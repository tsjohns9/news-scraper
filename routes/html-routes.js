const router = require('express').Router();
const db = require('../models');

// for all get routes, const obj = {} stores data needed to conditionally render info for the page
// req.isAuthenticated() is used to check if the user is signed in or not
// obj.auth is used to determine what parts of the nav items are displayed

router.get('/', (req, res) => {
  const obj = {};
  const flashSuccess = req.flash('success')[0];
  obj.page = '/';
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
  obj.page = '/saved';
  obj.isAuthenticated = req.isAuthenticated();
  req.user.getSavedArticles(req.user._id, obj, result => {
    console.log(result[0].savedArticles);
    obj.articles = result[0].savedArticles;
    res.render('saved.hbs', obj);
  });
});

// signup page
router.get('/signup', (req, res) => {
  const obj = {};
  obj.page = '/signup';
  obj.isAuthenticated = req.isAuthenticated();
  obj.errors = req.session.errors || null;
  obj.failure = req.flash('failure')[0] || null;
  res.render('signup.hbs', obj);
  req.session.errors = null;
});

// login page
router.get('/login', (req, res) => {
  const obj = {};
  obj.page = '/login';
  obj.isAuthenticated = req.isAuthenticated();
  obj.errors = req.session.errors || null;
  obj.failure = req.flash('error')[0] || null;
  res.render('login.hbs', obj);
  req.session.errors = null;
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
