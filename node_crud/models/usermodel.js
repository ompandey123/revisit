const mongoose = require("mongoose");
mongoose.connect(`mongodb://127.0.0.1:27017/revisit`);

const userSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    contact: String
});

module.exports = mongoose.model("user", userSchema);