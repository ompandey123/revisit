const express = require("express");
const path = require("path");
const app = express();
const userModel = require("./models/usermodel.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("index");
})

app.post("/login", async (req, res)=>{
    let {email, password} = req.body;
    let user = await userModel.findOne({email});
    if(!user) return res.status(500).send("Something went wrong!!");

    bcrypt.compare(password, user.password, function(err, result){
        if(result){
            const token = jwt.sign({email:email, userid:user._id}, "secret");
            res.cookie("token", token);
            res.status(200).redirect("/profile");
        }
        else{
            res.status(401).redirect("/");
        }
    })
})

app.get("/profile",(req, res)=>{
    res.render("profile")
})


app.get("/logout", async (req, res)=>{
    res.cookie("token", "");
    res.redirect("/");
})

app.get("/register", (req, res) => {
    res.render("register");
})

app.post("/register", async (req, res) => {
    let { name, username, email, age, password } = req.body;
    let user = await userModel.findOne({ email })
    if (user) return res.status(500).send("User Already Exists!");

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            let newuser = await userModel.create({
                name,
                username,
                email,
                age,
                password: hash
            });
            const token = jwt.sign({email:email, userid:newuser._id}, "secret");
            res.cookie("token", token)
            res.send("Registered!!!!");

        })
    })

})

app.listen(3000);