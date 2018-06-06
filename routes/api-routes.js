const router = require('express').Router();
const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../models');
const User = db.User;

router.get('/scrape', (req, res) => {
  axios
    .get('https://www.theonion.com/c/news-in-brief')
    .then(response => {
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
    })
    .then(() => {
      // loads all articles when '/' is accessed
      db.Article.find()
        .then(articles => {
          res.json(articles);
        })
        .catch(err => console.log(err));
    });
});

// get specific article from db
router.get('/articles/:id', (req, res) => {
  db.Article.findOne({ _id: req.params.id })
    // .populate('notes)
    .then(article => res.json(article))
    .catch(err => res.json(err));
});

router.post('/register', (req, res) => {
  // checks for valid form input
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('username', 'Username must be at least 4 characters').isLength({ min: 4 });
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password', 'Password must be at least 4 characters').isLength({ min: 4 });
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  // stores possible errors
  const errors = req.validationErrors();

  // if there are errors, store it on the user session
  if (errors) {
    req.session.errors = errors;
    res.redirect('/signup');
    // successful sign up
  } else {
    const newUser = new User(req.body);
    newUser.createUser(newUser);
    req.session.success = 'Welcome, ' + req.body.username;
    res.redirect('/');
  }
});

module.exports = router;
