const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const axios = require('axios');
const cheerio = require('cheerio');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').strategy;

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

// Connect to mongodb
mongoose.connect('mongodb://localhost/news-scrapper');

app.use(require('./routes/html-routes'));
app.use(require('./routes/api-routes'));

// starts the server
app.listen(PORT, function() {
  console.log('App listening on PORT: ' + PORT);
});
