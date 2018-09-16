const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const { PORT, DATABASE_URL } = require('./config');
const { blogPost } = require('./models');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const app = express();

app.use(morgan('common'));
app.use(express.json());

app.get('/posts', (req, res) => {
    blogPost.find()
        .then(posts => {
            res.json(
                posts.map(
                    (post) => post.serialize())
            );
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        });
});

app.get('/posts/:id', (req, res) => {
    blogPost.findById(req.params.id)
        .then(posts => {
            res.json(
                posts.serialize())
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        });
});

app.post('/posts', jsonParser, (req, res) => {
    const requiredFields = ['title', 'content', 'author'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`
            console.error(message);
            return res.status(400).send(message);
        }
    }

    blogPost.create({
            title: req.body.title,
            content: req.body.content,
            author: req.body.author
        })
        .then(post => res.status(201).json(post.serialize()))
        .catch(error => {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        });
});

app.put('/posts/:id', (req, res) => {
    const requiredFields = ['id'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`
            console.error(message);
            return res.status(400).send(message);
        }
    }

    if (req.params.id !== req.body.id) {
        const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
        console.error(message);
        return res.status(400).send(message);
    }

    const toUpdate = {};
    const canUpdate = ['title', 'content', 'author'];
    for (let j = 0; j < canUpdate.length; j++) {
        const field = canUpdate[j];
        if (field in req.body) {
            toUpdate[field] = req.body[field];
            console.log(toUpdate[field]);
        }
    }

    blogPost.findByIdAndUpdate(req.params.id, {
            $set: toUpdate
        }, { new: true })
        .then(res.status(204).end())
        .catch(error => {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        });
});

app.delete('/posts/:id', (req, res) => {
    blogPost.findByIdAndRemove(req.params.id)
        .then(() => {
            console.log(`Deleted BlogPost id \`${req.params.ID}\``);
            res.status(204).end();
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        });
});

let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(
            databaseUrl,
            err => {
                if (err) {
                    return reject(err);
                }
                server = app
                    .listen(port, () => {
                        console.log(`Your app is listening on port ${port}`);
                        resolve();
                    })
                    .on("error", err => {
                        mongoose.disconnect();
                        reject(err);
                    });
            }
        );
    });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log("Closing server");
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };