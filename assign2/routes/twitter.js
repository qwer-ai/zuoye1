const express = require('express');
const Twitter = require('twitter');
const router = express.Router();
require('dotenv').config();

const server = 'http://localhost:3000';

const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

router.get('/get/:q', function (req, res, next) {
    client.get('search/tweets', { q: req.params.q }, function (error, tweets, response) {
        if (!error) {
            res.render('twitter', {
                title: 'Latest Tweets',
                keyword: req.params.q,
                data: tweets.statuses
            });
            res.end();
        } else {
            console.error(error);
        }
    });
});

module.exports = router;