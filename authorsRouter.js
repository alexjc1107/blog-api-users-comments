const express = require('express');
const router = express.Router();
const { author } = require('./models');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();


router.get('/', (req, res) => {
    author.find()
        .then(authors => {
            res.json(
                authors.map(
                    (author) => author.serialize())
            );
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        });
});

router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['firstName', 'lastName', 'userName'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    author.findOne({ userName: req.body.userName })
        .then(auth => {
            if (auth) {
                const message = `Username \`${auth}\` already exists`;
                console.error(message);
                return res.status(400).send(message);
            } else {
                author.create({
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        userName: req.body.userName
                    })
                    .then(auth => res.status(201).json(auth.serialize()))
            }
        })
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
    const canUpdate = ['firstName', 'lastName', 'userName'];
    for (let j = 0; j < canUpdate.length; j++) {
        const field = canUpdate[j];
        if (field in req.body) {
            toUpdate[field] = req.body[field];
            console.log(toUpdate[field]);
        }
    }

    author.findByIdAndUpdate(req.params.id, {
            $set: toUpdate
        }, { new: true })
        .then(auth => res.status(200).json(auth.serialize()))
        .catch(error => {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        });
});

router.delete('/:id', (req, res) => {
    author.findByIdAndRemove(req.params.id)
        .then(() => {
            blogPost.remove({ author: req.params.id })
                .then(() => {
                    console.log(`Deleted Author id \`${req.params.ID}\` and associated posts`);
                    res.status(204).end();
                })
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        });
});

module.exports = router;