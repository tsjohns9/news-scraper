const router = require('express').Router();
const db = require('../models');

// for all get routes, const obj = {} stores data needed to conditionally render info for the page
// req.isAuthenticated() is used to check if the user is signed in or not
// obj.auth is used to determine what parts of the nav items are displayed

router.get('/', (req, res) => {
  const obj = {};
  const flashSuccess = req.flash('success')[0];
  obj.page = '/';
  // displays a success message when the user signs in.
  // checks if there is a user, and checks if there is a message.
  obj.success = req.user && flashSuccess ? flashSuccess + req.user.username : null;
  obj.logout = req.flash('logout')[0] || null;
  obj.isAuthenticated = req.isAuthenticated();

  // loads all articles when '/' is accessed
  db.Article.find()
    .then(articles => {
      obj.articles = articles;
      res.render('index', obj);
      obj.success = null;
    })
    .catch(err => console.log(err));
});

// loads saved articles for the user
router.get('/saved', (req, res) => {
  const obj = {};
  obj.isAuthenticated = req.isAuthenticated();

  // retrieves saved articles for the user if they are authenticated
  if (obj.isAuthenticated) {
    obj.page = '/saved';
    req.user.getSavedArticles(req.user._id, obj, (result, error) => {
      if (result) {
        obj.articles = result[0].savedArticles;
        res.render('saved.hbs', obj);
      }
      if (error) res.status(500).send('An error occured while loading saved articles');
    });

    // this will render a 403 page if the user is not authenticated
  } else {
    obj.page = '/403';
    res.render('403', obj);
  }
});

// signup page
router.get('/signup', (req, res) => {
  const obj = {};
  obj.isAuthenticated = req.isAuthenticated();

  // only displays sign up page if the user has not authenticated
  if (!obj.isAuthenticated) {
    obj.page = '/signup';
    obj.errors = req.session.errors || null;
    obj.failure = req.flash('failure')[0] || null;
    res.render('signup.hbs', obj);
    req.session.errors = null;

    // prevents an authenticated user from trying to sign up again
  } else {
    obj.page = '/403';
    res.render('403', obj);
  }
});

// login page
router.get('/login', (req, res) => {
  const obj = {};
  obj.isAuthenticated = req.isAuthenticated();

  // allows access to the login page if the user is not authenticated
  if (!obj.isAuthenticated) {
    obj.page = '/login';
    obj.errors = req.session.errors || null;
    obj.failure = req.flash('error')[0] || null;
    res.render('login.hbs', obj);
    req.session.errors = null;

    // prevents an authenticated user from trying to log in again
  } else {
    obj.page = '/403';
    res.render('403', obj);
  }
});

router.get('/logout', (req, res) => {
  if (req.isAuthenticated()) {
    req.flash('logout', req.user.username + ' has logged out');
    console.log('logged out');
    req.logout();
  } else {
    console.log('not logged in');
  }
  res.redirect('/');
});

module.exports = router;
