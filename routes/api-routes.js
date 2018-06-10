const router = require('express').Router();
const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../models');
const User = db.User;
const Note = db.Note;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// gets articles from the onion
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
          err => res.send(err)
        );
      });
    })
    .then(() => {
      // sends each article to the front end to be rendered once all articles are saved to the db
      db.Article.find()
        .then(articles => {
          res.json(articles);
        })
        .catch(err => res.send(err));
    });
});

// clears the db
router.get('/clear', (req, res) => {
  db.Article.deleteMany({})
    .then(() => {
      User.deleteMany({}).then(() => {
        Note.deleteMany({}).then(() => res.redirect('/'));
      });
    })
    .catch(err => res.json(err));
});

// associates an article to a user when the save article button is pressed
router.post('/saveArticle', (req, res) => {
  // prevents an attempt to save an article without being authenticated
  if (req.user) {
    // saves to the savedArticles array on the User schema
    User.update({ _id: req.user._id }, { $addToSet: { savedArticles: req.body.id } }, { new: true })
      // success and error handling
      .then(result => {
        if (result.nModified === 1) res.send('Article Saved');
        else res.send('Article already saved');
      })
      .catch(() => res.send('Could not save article'));

    // runs if a user didn't authenticate when trying to save an article
  } else {
    res.send('Could not save article. You are not logged in');
  }
});

// deletes an article that is associated with a user by removing from the savedArticles array
router.delete('/removeArticle', (req, res) => {
  User.update({ _id: req.user._id }, { $pull: { savedArticles: { $in: [req.body.id] } } })
    .then(() => res.send('Article Removed'))
    .catch(() => res.send('An error ocurred while removing the article'));
});

// saves a new note to the corresponding article. saves the noteId to the article based on id
router.post('/saveNote', (req, res) => {
  // creates a new Note document
  const newNote = new Note({ username: req.user.username, body: req.body.body });

  // will hold the noteId once it is created so that it can be used to save to the user
  let noteId = null;

  // saves the new document
  newNote
    .save()
    // contains the result of the saved note after its saved to the db
    .then(result => {
      // sets the noteId variable so it can be used outside of this scope
      noteId = result._id;

      // saves the newNote _id to the notes array for the article
      db.Article.findOneAndUpdate(
        { _id: req.body.articleId },
        { $addToSet: { notes: noteId } },
        { new: true }
      )
        // save note to the user once the note has been saved to the article
        .then(() => res.send('Note Saved'))
        .catch(() => res.send('Could not save note'));
    })
    .catch(err => res.send(err));
});

// gets all article notes based on articleId
router.post('/getArticleNotes', (req, res) => {
  db.Article.find({ _id: req.body.articleId })
    .populate('notes')
    .then(result => res.send({ username: req.user.username, result: result[0].notes }))
    .catch(() => res.send('An error ocurred while retrieving the notes'));
});

// removes a note from an article and from the notes collection
router.post('/removeNote', (req, res) => {
  db.Article.update({ _id: req.body.articleId }, { $pull: { notes: { $in: [req.body.noteId] } } })
    .then(removeRes => {
      // if the write result removed value is greater than 0, then it was a success
      if (removeRes.n > 0) {
        res.send('success');
      }

      // if not, then there was an error
      else {
        res.send('An error occured while trying to remove the note');
      }
    })
    .catch(() => res.send('An error occured while trying to remove the note'));
});

// deals with registration, error handling, and authentication of a new user
router.post('/register', (req, res) => {
  // checks for valid form input and sends message to client if a field is invalid
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
    // successful sign up if there were no errors
  } else {
    // creates user with passed in form info
    User.create({ username: req.body.username, password: req.body.password })
      // hashes the users password
      .then(result => {
        result.hashPassword(result, () => {
          // if the hash was successful, then re-directs to /
          passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/signup',
            successFlash: 'Welcome, '
          })(req, res);
        });
      })
      // runs if a user could not be created
      .catch(() => {
        req.flash('failure', 'Username already exists');
        res.redirect('/signup');
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
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// checks the cookie
passport.deserializeUser((id, done) => {
  User.getUserById(id, (err, user) => {
    done(err, user);
  });
});

// functions to handle authentication.
passport.use(
  new LocalStrategy((username, password, done) => {
    // checks for existing user
    User.findOne({ username })
      .then(user => {
        // message to display if no user is found
        if (!user) {
          return done(null, false);
        }
        // if a user is found, checks the requesting users password with the hashed password
        user.checkPassword(password, user.password, (err, isMatch) => {
          if (err) return done(err);
          // authenticates user if there is a matching password for the user
          if (isMatch) {
            return done(null, user);
            // returns message if failed password did not match
          } else {
            return done(null, false);
          }
        });
      })
      .catch(err => console.log(err));
  })
);

module.exports = router;
