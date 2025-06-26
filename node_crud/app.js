const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const userModel = require("./models/usermodel");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
    const token = req.cookies.token;
    if(token){
        try{
            jwt.verify(token, "secret");
            return res.send("You are already logged in. Go to /home");
        }catch(err)
        {
            return res.render("login");
        }
    }
    res.render("login");
});

app.post("/login", async (req, res) => {
    let user = await userModel.findOne({ email: req.body.email });
    if (!user) return res.send("Something went wrong!");

    bcrypt.compare(req.body.password, user.password, function (err, result) {
        if (result) {
            let token = jwt.sign({ email: user.email }, "secret");
            res.cookie("token", token);
            res.redirect("/home");
        }
        else {
            res.send("Incorrect email or password");
        }
    })
    // res.redirect("/home");
})

app.get("/logout", (req, res) => {
    res.cookie("token", "");
    res.redirect("/");
})

app.get("/home",isLoggedIn, (req, res) => {
    res.render("index", {email: req.user.email});
});

app.post("/register",isLoggedIn, async (req, res) => {
    let { name, email, password, contact } = req.body;
    let existUser = await userModel.findOne({ email });
    if (existUser) {
        return res.send("You have already registered");
    }
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            let user = await userModel.create({
                name,
                email,
                password: hash,
                contact
            });
            res.redirect("read");
        });
    })


});

app.get("/read",isLoggedIn, async (req, res) => {
    let users = await userModel.find();
    res.render("read", { users });
});

app.get("/delete/:id",isLoggedIn, async (req, res) => {
    let user = await userModel.findOneAndDelete({ _id: req.params.id });
    res.redirect("/read");
});

app.get("/edit/:id",isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ _id: req.params.id });
    res.render("edit", { user });
});

app.post("/update/:userid",isLoggedIn, async (req, res) => {
    let { name, email, contact } = req.body;
    let updatedUser = await userModel.findOneAndUpdate({ _id: req.params.userid }, { name, email, contact }, { new: true });
    res.redirect("/read");
});

function isLoggedIn(req, res, next) {
    const token = req.cookies.token;
    if(!token){
        return res.redirect("/?error=login_required");
    }

    try {
        let data = jwt.verify(req.cookies.token, "secret");
        req.user = data;
        console.log("you are logged in as ", data.email);
        next();
    } catch (err) {
        res.send("invalid or expired token, please login");
    }
}

app.listen(3000);