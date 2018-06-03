const router = require('express').Router();

// renders home page
router.get('/', function(req, res) {
  res.render('index');
});

// posts a new article to the db
router.post('/api/articles', function(req, res) {
  //
});

// get articles from db
router.get('/api/articles', function(req, res) {
  //
});

module.exports = router;
