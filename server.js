const express = require('express');
const bodyParser = require('body-parser');
// const logger = require('morgan');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const axios = require('axios');
const cheerio = require('cheerio');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 8080;

// Use express.static to serve the public folder as a static directory
app.use(express.static('public'));

// Use morgan logger for logging requests
// app.use(logger('dev'));

// Sets up Express to handle data parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.engine(
  '.hbs',
  exphbs({
    extname: '.hbs',
    defaultLayout: 'main',
    partialsDir: __dirname + '/views/partials'
  })
);
app.set('view engine', '.hbs');

// Connect to the Mongo DB
mongoose.connect('mongodb://localhost/news-scrapper');

app.use(require('./routes/routes'));

// starts the server
app.listen(PORT, function() {
  console.log('App listening on PORT: ' + PORT);
});
