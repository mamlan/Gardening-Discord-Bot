const {model, Schema} = require("mongoose");

module.exports= model("users", new Schema({
    Guild: String,
    userID: Number,
    User: String,

}));