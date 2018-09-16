"use strict";

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const postSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String },
    created: { type: Date, default: Date.now },
    author: {
        firstName: String,
        lastName: String
    }
});

postSchema.virtual("fullName").get(function() {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

postSchema.methods.serialize = function() {
    return {
        id: this._id,
        title: this.title,
        content: this.content,
        created: this.created,
        author: this.fullName
    };
};

const collectionName = 'posts';
const blogPost = mongoose.model("Post", postSchema, collectionName);

module.exports = { blogPost };