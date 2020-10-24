var express = require('express');
var router = express.Router();
const Twitter = require('twitter');
const AWS = require("aws-sdk");
require('dotenv').config();

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
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
    }
  });
});

const bucketName = 'n10129375-wikipedia-store';

router.get('/twitter', function (req, res, next) {
  const params = { Bucket: bucketName, Key: 'twitter-ps5.json' };

  new AWS.S3({ apiVersion: '2006-03-01' }).getObject(params, (err, result) => {
    if (result) {
      const resultJSON = JSON.parse(result.Body);
      const responseJSON = resultJSON.value;
      var TweetInfo = Object.entries(responseJSON);
      res.render('twitterAnalysis', { TweetInfo });
    }
  });
});

module.exports = router;
