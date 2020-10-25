var express = require('express');
var router = express.Router();
const Twitter = require('twitter');
const redis = require('redis');
const AWS = require("aws-sdk");
require('dotenv').config();

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

// Init S3
const bucketName = 'cab432-twitter-assign2-store';
const S3 = new AWS.S3({ apiVersion: '2006-03-01' });

// Init redis
const redisClient = redis.createClient({ port: 6379, host: "cab432twitterassign2.km2jzi.ng.0001.apse2.cache.amazonaws.com" });
// const redisClient = redis.createClient();
redisClient.on('error', (err) => {
  console.log("Error " + err);
});

/* GET home page. */
router.get('/', function (req, res, next) {
  client.get('trends/place', { id: '23424748' }, function (error, trends, response) {
    if (!error) {
      // console.log(trends[0].trends);
      res.render('index', {
        title: 'trending',
        keyword: req.params.q,
        data: trends[0].trends
      });
      res.end();
    } else {
      console.error(error);
      res.status(500).send(error);
    }
  });
});

router.get('/twitter', function (req, res, next) {
  res.render('twitterAnalysis');
});

router.post('/update', function (req, res, next) {
  S3.getObject({ Bucket: bucketName, Key: `twitter-${req.body.q}.json` }, (err, result) => {
    if (result) {
      res.json(JSON.parse(result.Body).value);
      res.end();
    } else {
      res.status(404);
      res.end();
    }
  });
});

module.exports = router;
