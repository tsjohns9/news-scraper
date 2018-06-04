const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const axios = require('axios');
const cheerio = require('cheerio');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 8080;

// serve static files from /public
app.use(express.static('public'));

// Sets up Express to handle data parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

app.use(require('./routes/routes'));

// starts the server
app.listen(PORT, function() {
  console.log('App listening on PORT: ' + PORT);
});
