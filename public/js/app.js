$(document).ready(function() {
  var articleId = null;

  $('.text-success').fadeOut(1800, function() {
    // Animation complete.
  });

  // removes result message on close and brings back the textarea for the save-note modal.
  $('#save-note-modal').on('hidden.bs.modal', function(e) {
    $('#result-msg').remove();
    $('#new-note-text').show();
    $('.save-note').show();
  });

  // used to send the article id to the server when creating a new note
  $('.create-note, .view-note').on('click', function() {
    articleId = $(this).attr('data-id');
  });

  // gets articles from the onion, and displays them
  $('#scrape').on('click', function() {
    $('.article-container').empty();
    $('.article-container').append(`<div class="loader"></div>`);
    $.getJSON('/scrape', function(data) {
      $('.article-container').empty();
      // creates each article
      displayArticles(data);
    });
  });

  // saves an article to the user
  $(document).on('click', '.save-article', function() {
    var self = $(this);
    // sends article id to the server to save article to the user
    $.post('/saveArticle', { id: $(this).attr('data-id') }, function(data) {
      // sends a message to the user saying it was saved, then removes the save article button
      $(`<p class="text-success mt-2">${data}</p>`).insertAfter(self);
      self.remove();
    });
  });

  // remove saved article based on articleId when the button is pressed. deletes the article associated to the user
  $('.remove-article').on('click', function() {
    var self = $(this);
    $.ajax({
      url: '/removeArticle',
      data: { id: $(this).attr('data-id') },
      type: 'DELETE',
      success: function(result) {
        // removes the div containing the article
        self.closest('.article').remove();
        if ($('.saved-articles').children().length < 1) {
          $('.article-container').empty();
          $('.article-container').append($(`<h2 class="text-center none">No Articles!</h2>`));
        }
      }
    });
  });

  // sends new note info to db, and articleId when the save-note button is pressed in the modal. shows result message
  $('.save-note').on('click', function(e) {
    e.preventDefault();
    $.post(
      '/saveNote',
      {
        body: $('#new-note-text')
          .val()
          .trim(),
        articleId: articleId
      },
      function(result) {
        // clears out the last entered note
        $('#new-note-text').val('');
        // hides the text area
        $('#new-note-text').hide();
        // displays a success or fail message
        $('.form-group').append(`<h3 id="result-msg">${result}</h3>`);
        // removes the save note button after a note has been saved
        $('.save-note').hide();
      }
    );
  });

  // gets all notes from the db for an article based on the articleId.
  $('.view-note').on('click', function() {
    // removes the previous notes on each click
    $('#all-article-notes').empty();

    // displays loader if results are not immediate
    $('#all-article-notes').append(`<div class="loader"></div>`);

    // sends data to get the notes associated with the article
    $.post('/getArticleNotes', { articleId: $(this).attr('data-id') }, function(result) {
      // checking the type ensures the request for the notes was successful.

      // if it was unsuccessful the type will be a string.
      if (typeof result === 'object') {
        // contains the authenticated user from the server
        var username = result.username;

        // contains the notes from the server
        var result = result.result;

        // clears notes when the button is pressed before appending new notes
        $('.loader').remove();

        // displays message if no notes are found
        if (result.length < 1) {
          $('#all-article-notes').append($(`<h3>No Notes</h3>`));
        }

        // appends each note to the modal from the db query
        result.forEach(note => {
          // creates the main note content
          var noteContent = $(`
            <div class="mb-2 note-container">
              <span><span class="text-muted">${note.username}:</span> ${note.body}</span>
            </div>
          `);

          // if the authenticated user matches the note username, then the user can remove their own note
          if (username === note.username) {
            // creates remove note button
            noteContent.append(
              $(`
              <button type="button" class="close delete-note" aria-label="Close" data-id="${
                note._id
              }">
                <span aria-hidden="true"  
                  style="padding: 0 7px; color: white; background-color: #f44336">
                    ×
                </span>
              </button>
              `)
            );
          }

          // appends to notes modal
          $('#all-article-notes').append(noteContent);
        });
      } else {
        // if this runs, then we did not get a successful response. appends error message
        $('#all-article-notes').append(result);
      }
    });
  });

  // removes a users note from an article
  $(document).on('click', '.delete-note', function() {
    var self = $(this);
    $.post('/removeNote', { noteId: $(this).attr('data-id'), articleId: articleId }, function(
      result
    ) {
      // deletes the note from the page
      if (result === 'success') {
        self.closest('.note-container').remove();

        // if there are no notes, inform the user
        if ($('#all-article-notes').children().length < 1) {
          $('#all-article-notes').append($(`<h3>No Notes</h3>`));
        }

        // writes to the console if an error occured while removing a note
      } else {
        console.log(result);
      }
    });
  });

  // appends each article to the page
  function displayArticles(data) {
    // removes old articles before appending
    $('.saved-articles').empty();

    // removes message that says 'No Articles' on home page when there are no articles
    $('.none').remove();

    // creates each article container with its content
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
            <button type="button" class="btn save-article" data-id="${
              article._id
            }">Save Article</button>
          </div>
        </div>
      `);
      $('.article-container').append(row);
    });
  }
});
