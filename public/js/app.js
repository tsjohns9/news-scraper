$(document).ready(function() {
  // performs get request for articles
  $('#scrape').on('click', function() {
    // server scrapes articles and returns the data here
    $.getJSON('/scrape', function(data) {
      // creates each article
      displayArticles(data);
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
            <button type="button" class="btn">Save Article</button>
          </div>
        </div>
      `);
      $('.article-container').append(row);
    });
  }
});
