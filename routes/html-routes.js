const router = require('express').Router();
const db = require('../models');

// for all get routes, const obj = {} stores data needed to conditionally render info for the page
// req.isAuthenticated() is used to check if the user is signed in or not
// obj.auth is used to determine what parts of the nav items are displayed depending on if the user is authenticated or not
// obj.page is used to add the active tab to the correct page on the navbar

router.get('/', (req, res) => {
  const obj = {};
  obj.page = '/';

  // displays a success message when the user signs in.
  // first gets the flash message if there is one
  const flashSuccess = req.flash('success')[0];

  // checks if there is a user, and if there is a flash message. If so, displays the flash message
  obj.success = req.user && flashSuccess ? flashSuccess + req.user.username : null;

  // message when a user logs out
  obj.logout = req.flash('logout')[0] || null;
  obj.isAuthenticated = req.isAuthenticated();

  // loads all articles when '/' is accessed
  db.Article.find()
    .then(articles => {
      obj.articles = articles;
      res.render('index', obj);
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
    db.User.find({ _id: req.user._id })
      // grabs all saved articles based on the articleId in the savedArticles array saved to the user document
      .populate('savedArticles')
      .then(result => {
        obj.articles = result[0].savedArticles;
        res.render('saved.hbs', obj);
      })
      .catch(() => res.send('An error occured while loading saved articles'));

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

    // stores errors when failing to sign up properly
    obj.errors = req.session.errors || null;

    // stores an error if the username already exists
    obj.failure = req.flash('failure')[0] || null;
    res.render('signup.hbs', obj);

    // clears out all form validation errors
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

    // stores an error if the user could not authenticate when logging in
    obj.failure = req.flash('error')[0] || null;
    res.render('login.hbs', obj);

    // prevents an authenticated user from trying to log in again
  } else {
    obj.page = '/403';
    res.render('403', obj);
  }
});

router.get('/logout', (req, res) => {
  if (req.isAuthenticated()) {
    // stores message to display to the user when they log out
    req.flash('logout', req.user.username + ' has logged out');
    console.log('logged out');
    req.logout();
  } else {
    console.log('not logged in');
  }
  res.redirect('/');
});

module.exports = router;
