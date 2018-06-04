const router = require('express').Router();
const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../models');

// renders home page
router.get('/', (req, res) => {
  db.Article.find()
    .then(articles => res.render('index', { page: '/', articles: articles }))
    .catch(err => console.log(err));
});

router.get('/scrape', (req, res) => {
  axios.get('https://www.theonion.com/c/news-in-brief').then(response => {
    const $ = cheerio.load(response.data);

    // stores title, image, and link for each article
    $('div.item__content').each((i, element) => {
      const article = {};

      article.title = $(element)
        .find('h1')
        .text();

      article.img = $(element)
        .find('.img-wrapper picture')
        .children()
        .first()
        .attr('data-srcset');

      article.link = $(element)
        .find('.headline a')
        .attr('href');

      article.excerpt = $(element)
        .find('.excerpt')
        .first()
        .text();

      // prevents the scraper from duplicating articles by checking if the article title exists in the db
      // if the article title does not exist, then it saves the article
      // if it does exist, then it updates the article with the newest value, which will be the same value as before
      db.Article.update({ title: article.title }, { $set: article }, { upsert: true })
        // .then(article => console.log(article))
        .catch(err => console.log(err));
    });
  });
  res.redirect('/');
});

// get articles from db
router.get('/articles', (req, res) => {
  db.Article.find({}).then(article => res.json(article));
});

// get specific article from db
router.get('/articles/:id', (req, res) => {
  db.Article.findOne({ _id: req.params.id })
    // .populate('notes)
    .then(article => res.json(article))
    .catch(err => res.json(err));
});

router.get('/saved', (req, res) => {
  res.render('saved.hbs', { page: '/saved', articles: [] });
});

module.exports = router;
