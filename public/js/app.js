$(document).ready(function() {
  // performs get request for articles
  $('#scrape').on('click', function() {
    // popup modal to inform the scrape is finished
    $.getJSON('/scrape', function(data) {
      // create article with forEach loop
      console.log(data);
    });
  });
});
