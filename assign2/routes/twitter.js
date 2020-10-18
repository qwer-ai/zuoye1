const express = require('express');
const Twitter = require('twitter');
var analyzer = require('natural').SentimentAnalyzer;
var stemmer = require('natural').PorterStemmer;
const router = express.Router();
require('dotenv').config();



var sentimentAnalyzer = new analyzer("English", stemmer, "afinn");

const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});


// client.get('trends/place', {id: '23424748' }, function (error, trend){
//     let trends = trend[0].trends;
//     console.log(trends);
// });

router.get('/trends', function (req, res, next) {
    client.get('trends/place', {id: '23424748'}, function (error, trends, response) {
        if (!error) {
            console.log(trends[0].trends);
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

async  function processTweets(tweetsBody) {
  try{
    return new Promise((resolve) => {
      var TweetFullText = '';
      if(tweetsBody != undefined){
        if(tweetsBody.extended_tweet){
          TweetFullText = tweetsBody.extended_tweet.full_text;
        } else {
          TweetFullText = tweetsBody.text;
        }
      } 
      resolve(TweetFullText);
    });
  }catch(error){
    console.log(error);
  }
}

  
  async function Sentiment(tweet) {
    try{
      return new Promise((resolve) => {
        var splitTweet = tweet.split(' ');
        let sentiment = sentimentAnalyzer.getSentiment(splitTweet);
        resolve(sentiment);
      });
    } catch(error){
      console.log(error);
    }
  };

  
router.get('/stream', function (req, res, next){
    console.log(req.query.q);
    client.stream('statuses/filter', {track: req.query.q , language: 'en' }, function (stream) {
        stream.on('data', function(event) {
          processTweets(event).then(result =>{
            Sentiment(result).then(results => {
              console.log(results);
            })
          })
        });
        stream.on('error', function(error) {
          throw error;
        });
    });
});

module.exports = router;