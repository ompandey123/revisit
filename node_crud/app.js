const express = require("express");
const path = require("path");
const userModel = require("./models/usermodel");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");


app.get("/", (req, res)=>{
    res.render("index");
})

app.post("/register", async (req, res)=>{
    let {name, email, password, contact} = req.body;
    let existUser = await userModel.findOne({email});
    if(existUser)
    {
        return res.send("You have already registered");
    }
        let user = await userModel.create({
        name,
        email,
        password,
        contact
    });

    res.redirect("read");
});

app.get("/read", async(req, res)=>{
    let users = await userModel.find();
    res.render("read", {users});
});

app.get("/delete/:id", async(req, res)=>{
    let user = await userModel.findOneAndDelete({_id: req.params.id});
    res.redirect("/read");
});

app.get("/edit/:id", async (req, res)=>{
    let user = await userModel.findOne({_id: req.params.id});
    res.render("edit", {user});
});

app.post("/update/:userid", async (req, res)=>{
    let {name, email, password, contact} = req.body;
    let updatedUser = await userModel.findOneAndUpdate({_id: req.params.userid}, {name, email, password, contact}, {new:true});
    res.redirect("/read");
})

app.listen(3000);