var express = require('express');
var twitter = require('twitter');
var request = require('request');
var router = express.Router();

let server = 'http://localhost:3000';

const client = new twitter({
  consumer_key: 'ULYQZ6NiqBlsjRVFoyAsx5ODF',
  consumer_secret: 'YzSEQmRPBR96W14IcCMdcEJwge1ql6gkXa9o6yGrzi3LGFQnE0',
  access_token_key: '1167249226323021824-gCYis7AH3cR15lyaRfoOQbTbrsKACP',
  access_token_secret: 'RJbs0yV1LCnpsMWuDqQsoohFw03OYbYBLpGjZb3SItTsp'
});

console.log(client);


client.get('search/tweets', {q: 'node.js'}, function(error, tweets, response) {
  console.log('1');
  console.log(tweets);
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
