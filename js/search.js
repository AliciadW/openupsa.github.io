(function() {
  var $form = $("#search-form"),
      $q = $form.find("[name=q]"),
      resultsTemplate = Handlebars.compile($("#search-result-template").html()),
      $results = $("#search-results");

  // Initalize lunr with the fields it will be searching on. I've given title
  // a boost of 10 to indicate matches on this field are more important.
  var searchIndex = lunr(function() {
    this.field('id');
    this.field('title', {boost: 10});
    this.field('author');
    this.field('content');
  });

  // Add the data to lunr
  for (var key in SITE_CONTENT) { 
    var item = SITE_CONTENT[key];

    searchIndex.add({
      'id': key,
      'title': item.title,
      'author': item.author,
      'content': item.content
    });
  }

  $form.on('submit', function(e) {
    e.preventDefault();
    doSearch($q.val());
  });

  $q.on('change keyup', _.debounce(function(e) {
    doSearch($q.val());
  }, 250));

  function doSearch(q) {
    q = q.trim();
    if ('pushState' in history)
      history.pushState(q, "OpenUp Search: " + q, "search.html?q=" + encodeURIComponent(q));

    if (q.length === 0) {
      $results.empty();
      return;
    }

    var results = _.map(searchIndex.search(q), function(r) {
      hit = SITE_CONTENT[r.ref];
      hit.path = hit.url;
      hit.snippet = hit.content.length < 150 ? hit.content : hit.content.substring(0, 150) + "...";
      return hit;
    });

    $results.html(resultsTemplate({
      n: results.length,
      plural: results.length == 1 ? '' : 's',
      hits: results,
    }));
  }

  // do search on page load
  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');

    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');

      if (pair[0] === variable) {
        return decodeURIComponent(pair[1].replace(/\+/g, '%20'));
      }
    }
  }

  var searchTerm = getQueryVariable('q');
  if (searchTerm) {
    $q.val(searchTerm).trigger('change');
  }

  window.onpopstate = function(event) {
    if (event.state) {
      var q = event.state;
      $q.val(q).trigger('change');
    }
  };
})();
