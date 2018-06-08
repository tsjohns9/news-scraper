$(document).ready(function() {
  var articleId = null;

  // used to send the article id to the server when creating a new note
  $('.create-note').on('click', function() {
    articleId = $(this).attr('data-id');
    console.log($(this).attr('data-id'));
  });

  // performs get request for articles
  $('#scrape').on('click', function() {
    // server scrapes articles and returns the data here
    $.getJSON('/scrape', function(data) {
      // creates each article
      displayArticles(data);
    });
  });

  // saves an article to the user
  $('.save-article').on('click', function() {
    var self = $(this);
    $.post('/saveArticle', { id: $(this).attr('data-id') }, function(data) {
      // sends a message to the user saying it was saved, then removes the button
      $(`<p class="text-success mt-2">${data}</p>`).insertAfter(self);
      self.remove();
    });
  });

  // remove saved article when the button is pressed. deletes the article associated to the user
  $('.remove-article').on('click', function() {
    var self = $(this);
    $.ajax({
      url: '/removeArticle',
      data: { id: $(this).attr('data-id') },
      type: 'DELETE',
      success: function(result) {
        self.closest('.article').remove();
      }
    });
  });

  $('.save-note').on('click', function(e) {
    e.preventDefault();
    $.post('/saveNote', { body: $('#new-note-text').val(), articleId: articleId }, function(
      result
    ) {
      //
    });
  });

  // appends each article to the page
  function displayArticles(data) {
    console.log(data);
    $('.saved-articles').empty();
    $('.none').remove();
    data.forEach(article => {
      var row = $(`
        <div class="row article my-5 pb-4">
          <div class="col-sm-5 mb-3 mb-sm-3">
            <a href="${article.link}" target="_blank">
              <img class="img-fluid" src="${article.img}">
            </a>
          </div>
          <div class="col-sm-7 border-bottom border-secondary pb-3 pb-sm-3">
            <h3 class="mb-2">
              <a href="${article.link}" target="_blank">${article.title}</a> 
            </h3>
            <p class="mb-2">${article.excerpt}</p>
            <button type="button" class="btn" data-id="${article._id}">Save Article</button>
          </div>
        </div>
      `);
      $('.article-container').append(row);
    });
  }
});
