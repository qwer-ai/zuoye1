const express = require('express');
const Twitter = require('twitter');
var analyzer = require('natural').SentimentAnalyzer;
var stemmer = require('natural').PorterStemmer;
const router = express.Router();
require('dotenv').config();



const sentimentAnalyzer = new analyzer("English", stemmer, "afinn");

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

router.get('/trends', function (req, res, next) {
  client.get('trends/place', { id: '23424748' }, function (error, trends, response) {
    if (!error) {
      res.render('twitter', {
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

async function Sentiment(tweet) {
  try {
    return new Promise((resolve) => {
      var splitTweet = tweet.split(' ');
      let sentiment = sentimentAnalyzer.getSentiment(splitTweet);
      resolve(sentiment);
    });
  } catch (error) {
    console.error(error);
  }
};

let stream = undefined;

router.get('/stream', function (req, res, next) {
  // check if exist there is a stream before, delete it.
  if (stream) {
    stream.destroy();
    console.log('Old stream destroyed.');
  }

  console.log('New stream created with query: ' + req.query.q);

  stream = client.stream('statuses/filter', { track: req.query.q, language: 'en' });

  stream.on('data', function (event) {
    if (event && !event.retweeted_status) {

      // process tweet
      let text = event.extended_tweet ? event.extended_tweet.full_text : event.text;
      console.log(event.user.screen_name + " : " + text);
      
      // get sentiment rate from tweet
      Sentiment(text).then(results => {
        console.log(results);
        console.log('---------------------------------------');
      })
    }
  });

  stream.on('error', function (error) {
    console.error(error);
  });
});

module.exports = router;
