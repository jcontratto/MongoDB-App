var mongoose = require("mongoose");

//Save to schema
var Schema = mongoose.Schema;

var NoteSchema = new Schema({
    title: String,
    body: String
});

//Create model from Schema
var Note = mongoose.model("Note", NoteSchema);

//Export Note model
module.exports = Note;