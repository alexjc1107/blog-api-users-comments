"use strict";

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const commentSchema = mongoose.Schema({ content: 'string' });

const postSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String },
    created: { type: Date, default: Date.now },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
    comments: [commentSchema]
});

const authorSchema = mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    userName: {
        type: String,
        unique: true
    }
});

postSchema.virtual('authorName').get(function() {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

postSchema.pre('findOne', function(next) {
    this.populate('author');
    next();
});

postSchema.pre('find', function(next) {
    this.populate('author');
    next();
});

postSchema.methods.serialize = function() {
    return {
        id: this._id,
        title: this.title,
        content: this.content,
        created: this.created,
        author: this.authorName,
        comments: this.comments
    };
};

authorSchema.methods.serialize = function() {
    return {
        _id: this._id,
        name: `${this.firstName} ${this.lastName}`,
        userName: this.userName
    };
};

const author = mongoose.model('Author', authorSchema);
const blogPost = mongoose.model("BlogPost", postSchema);

module.exports = { blogPost, author };