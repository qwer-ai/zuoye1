const express = require('express');
const Twitter = require('twitter');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

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

let stream = undefined;

router.get('/stream', function (req, res) {
  let query = (req.query.q).trim();

  // Delete exist stream
  if (stream) {
    stream.destroy();
    console.log('Old stream destroyed.');
  }

  // Create new stream
  console.log('New stream created with query: ' + query);
  stream = client.stream('statuses/filter', { track: query, language: 'en' });

  stream.on('data', function (event) {
    if (event && !event.retweeted_status) {

      let url = "http://127.0.0.1:3000/database/store"
      let data = {
        "query": query,
        "tweet": JSON.stringify(event),
      }

      axios.post(url, data);
    }
  });

  stream.on('error', function (err) {
    console.error(err);
  });
});

router.get('/stop', function (req, res) {
  if (stream) {
    stream.destroy();
  }
  console.log('Old stream destroyed.');
  res.send('Old stream destroyed.');
  res.end();
})

module.exports = router;
