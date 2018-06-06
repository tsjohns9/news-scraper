$(document).ready(function() {
  // performs get request for articles
  $('#scrape').on('click', function() {
    // popup modal to inform the scrape is finished
    $.getJSON('/scrape', function(data) {
      if (!$('.saved-articles'))
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
    });
  });
});
