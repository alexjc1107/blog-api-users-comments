const express = require('express');
const router = express.Router();
const { blogPost } = require('./models');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();


router.get('/', (req, res) => {
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

router.get('/:id', (req, res) => {
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

router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['title', 'content', 'author_id'];
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
            author: req.body.author_id
        })
        .then(post => res.status(201).json(post.serialize()))
        .catch(error => {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        });
});

router.put('/:id', (req, res) => {
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

router.delete('/:id', (req, res) => {
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

module.exports = router;