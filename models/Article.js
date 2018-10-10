var mongoose = require("mongoose");

var Schema = mongoose.Schema;

//Create new  Schema for user (UserSchema)
var ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    saved: {
        type: Boolean,
        default: false
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

//Create model from schema 
var Article = mongoose.model("Article", ArticleSchema);

//Export Article model
module.exports = Article; 