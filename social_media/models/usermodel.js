const mongoose = require("mongoose");

mongoose.connect(`mongodb://127.0.0.1:27017/facegram`);

const userSchema = mongoose.Schema({
    name: String,
    username: String,
    age: Number,
    email:String,
    password:String
});

module.exports = mongoose.model("user", userSchema);