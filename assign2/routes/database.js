const express = require('express');
const redis = require('redis');
require('dotenv').config();
const AWS = require("aws-sdk");
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const analyzer = require('natural').SentimentAnalyzer;
const stemmer = require('natural').PorterStemmer;

// Create unique bucket name
const bucketName = 'n10127135-wikipedia-store';

const router = express.Router();

// Init redis
const redisClient = redis.createClient();

redisClient.on('error', (err) => {
    console.log("Error " + err);
});

const sentimentAnalyzer = new analyzer("English", stemmer, "afinn");

router.post("/store", (req, res) => {
    try {
        const tweet = JSON.parse(req.body.tweet);
        const text = tweet.extended_tweet ? tweet.extended_tweet.full_text : tweet.text;

        const tweetObj = {
            "text": text,
            "name": tweet.user.name,
            "screen_name": tweet.user.screen_name,
            "time": tweet.created_at,
        }

        // get sentiment rate from tweet
        sentiment(text).then(result => {
            tweetObj["sentiment"] = result === 0 ? 0 : result > 0 ? 1 : -1;
        })

        const tags = req.body.query.split(",");
        for (tag of tags) {
            if (text.toLowerCase().includes(tag.toLowerCase())) {
                addRedis(tag, tweet.id, tweetObj);
                addS3(tag, tweet.id, tweetObj);
            }
        }

        res.send(tweetObj);
        res.end();
    } catch (err) {
        console.error(err);
    }

});

async function sentiment(text) {
    const tokens = tokenizer.tokenize(text);
    const rate = sentimentAnalyzer.getSentiment(tokens);
    return rate;
};

function addRedis(query, id, tweet) {
    const key = `twitter-${query}.json`;
    const params = { Bucket: bucketName, Key: key };

    redisClient.get(key, (err, result) => {
        const data = { source: 'Redis Cache', value: {} };
        data.value[id] = tweet;

        if (result) {
            const resultJSON = JSON.parse(result);
            data.value = { ...resultJSON.value, ...data.value };
            redisClient.setex(key, 3600, JSON.stringify(data));
        } else {
            new AWS.S3({ apiVersion: '2006-03-01' }).getObject(params, (err, result) => {
                if (result) {
                    let resultJSON = JSON.parse(result.Body);
                    data.value = { ...resultJSON.value, ...data.value };
                }
                redisClient.setex(key, 3600, JSON.stringify(data));
            });
        }
    });
}

function addS3(query, id, tweet) {
    const key = `twitter-${query}.json`;
    const params = { Bucket: bucketName, Key: key };

    let data = { source: 'S3 Bucket', value: {} };
    data.value[id] = tweet;

    new AWS.S3({ apiVersion: '2006-03-01' }).getObject(params, (err, result) => {
        if (result) {
            const resultJSON = JSON.parse(result.Body);
            data.value = { ...resultJSON.value, ...data.value };
        }

        const objectParams = { ...params, Body: JSON.stringify(data) };
        const uploadPromise = new AWS.S3({ apiVersion: '2006-03-01' }).putObject(objectParams).promise();
        uploadPromise.then(function (data) {
        });
    });
}

module.exports = router;
