const router = require('express').Router();
const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../models');
const User = db.User;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

router.get('/scrape', (req, res) => {
  axios
    .get('https://www.theonion.com/c/news-in-brief')
    .then(response => {
      // data from the onion
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

        // prevents duplicate articles by checking if the article title exists in the db
        // if the article title does not exist, then it saves the article
        // creates new article if it does not exist
        db.Article.update({ title: article.title }, { $set: article }, { upsert: true }).catch(
          err => console.log('43:', err)
        );
      });
    })
    .then(() => {
      // sends each article to the front end to be rendered
      db.Article.find()
        .then(articles => {
          res.json(articles);
        })
        .catch(err => console.log('53:', err));
    });
});

// get specific article from db
router.get('/articles/:id', (req, res) => {
  db.Article.findOne({ _id: req.params.id })
    // .populate('notes)
    .then(article => res.json(article))
    .catch(err => res.json(err));
});

// clears all articles
router.get('/clear', (req, res) => {
  db.Article.deleteMany({})
    .then(result => {
      res.redirect('/');
    })
    .catch(err => console.log('71:', err));
});

// associates an article to a user
router.post('/saveArticle', (req, res) => {
  req.user.savedArticle(req.body.id, req.user._id, (response, error) => {
    if (response) res.send('Article Saved');
    if (error) res.status(500).send('An error ocurred while saving the article');
  });
});

// deletes an article that is associated with a user
router.delete('/removeArticle', (req, res) => {
  req.user.removeSavedArticle(req.body.id, req.user._id, (response, error) => {
    // sends success or error message to the user
    if (response) res.send('Article Removed');
    if (error) res.status(500).send('An error ocurred when removing the article');
  });
});

// deals with registration, error handling, and authentication of a new user
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
    // create a user without saving to the db to have access to the User methods
    const newUser = new User.User(req.body);
    newUser.checkIfUserExists(newUser, (err, result) => {
      if (err) throw err;
      // if !result, then no users with that username exist, and the user can be created
      if (!result) {
        newUser.createUser(newUser, saved => {
          req.flash('success', 'Welcome, ');
          passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/signup',
            successFlash: 'Welcome, '
          })(req, res);
        });
      } else {
        req.flash('failure', 'Username already exists');
        res.redirect('/signup');
      }
    });
  }
});

// authenticates an existing user logging in. Handles success and failure cases.
router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    successRedirect: '/',
    failureFlash: 'Invalid username or password.',
    successFlash: 'Welcome, '
  }),
  (req, res) => {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.redirect('/');
  }
);

// saves the users session in a cookie based on the userID
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// checks the cookie
passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

// functions to handle authentication.
passport.use(
  new LocalStrategy((username, password, done) => {
    const checkUser = new User.User({ username, password });
    // checks for existing user
    checkUser.findByUserName(username, (err, user) => {
      if (err) throw err;
      // returns message if no username found
      if (!user) {
        return done(null, false, { message: 'Incorrect Username' });
      }

      // checks if passwords match
      checkUser.checkPassword(password, user.password, (err, isMatch) => {
        if (err) return done(err);
        // authenticates user if there is a matching password for the user
        if (isMatch) {
          return done(null, user);
          // returns message if failed password did not match
        } else {
          return done(null, false, { message: 'Invalid Password' });
        }
      });
    });
  })
);

module.exports = router;
