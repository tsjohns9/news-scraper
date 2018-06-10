const express = require('express');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const session = require('express-session');
const passport = require('passport');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 8080;

// serve static files from /public
app.use(express.static('public'));

// Sets up Express to handle data parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// validates form submission
app.use(expressValidator());

// saves the users session
app.use(cookieParser());
app.use(
  session({
    secret: 'secret',
    saveUninitialized: false,
    resave: false
  })
);
app.use(flash());

// passport
app.use(passport.initialize());
app.use(passport.session());

// sets up handlebars
app.engine(
  '.hbs',
  exphbs({
    extname: '.hbs',
    defaultLayout: 'main',
    partialsDir: __dirname + '/views/partials',
    // if else helper used to check which page gets the 'active' tab class in the nav bar
    helpers: {
      ifEquals: function(arg1, arg2, options) {
        return arg1 == arg2 ? options.fn(this) : options.inverse(this);
      }
    }
  })
);
app.set('view engine', '.hbs');

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/news-scrapper';

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

app.use(require('./routes/html-routes'));
app.use(require('./routes/api-routes'));

// 404 redirect
app.get('*', (req, res) => {
  const obj = {};
  // used to render url path for requested resource on a 404 page
  obj.requested = req.originalUrl;
  obj.page = '/404';
  res.render('404', obj);
});

// starts the server
app.listen(PORT, function() {
  console.log('App listening on PORT: ' + PORT);
});
