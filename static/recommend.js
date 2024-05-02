$(function() {
  const source = document.getElementById('autoComplete');
  const inputHandler = function(e) {
    if (e.target.value == "") {
      $('.movie-button').attr('disabled', true);
    } else {
      $('.movie-button').attr('disabled', false);
    }
  }

  source.addEventListener('input', inputHandler);

  // Event listener for the enter key press
  source.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent default form submission
      $('.movie-button').trigger('click'); // Trigger click event on movie button
    }
  });

  $('.fa-arrow-up').click(function() {
    $('html, body').animate({ scrollTop: 0 }, 'slow');
  });

  $('.app-title').click(function() {
    window.location.href = '/';
  })

  $('.movie-button').on('click', function() {
    var my_api_key = 'f82d3658e4fe4c21487f2c409f868517';
    var description = $('.movie').val();
    var loader = $("#loader"); // Loader element
    loader.show(); // Show the loader

    if (description == "") {
      $('.results').css('display', 'none');
      $('.fail').css('display', 'block');
    }

    if (($('.fail').text() && ($('.footer').css('position') == 'absolute'))) {
      $('.footer').css('position', 'fixed');
    } else {
      show_details(my_api_key, description, loader); // Pass loader to show_details function
    }
  });
});

function show_details(my_api_key, movie_des, loader) {
  var recommendations;
  recommendations = fetchRecommendations(movie_des, my_api_key);
  details = {
    'rec_movies': JSON.stringify(recommendations.rec_movies),
    'rec_posters': JSON.stringify(recommendations.rec_posters),
    'rec_movies_org': JSON.stringify(recommendations.rec_movies_org),
    'rec_year': JSON.stringify(recommendations.rec_year),
    'rec_vote': JSON.stringify(recommendations.rec_vote)
  }

  $.ajax({
    type: 'POST',
    data: details,
    url: "/recommend",
    dataType: 'html',

    complete: function() {
      loader.hide(); // Hide the loader when request is complete
      $("#loader").delay(500).fadeOut();
    },
    success: function(response) {
      $('.results').html(response);
      $('#autoComplete').val('');
      $('.footer').css('position', 'absolute');
      if ($('.movie-content')) {
        $('.movie-content').after('<div class="gototop"><i title="Go to Top" class="fa fa-arrow-up"></i></div>');
      }
      $(window).scrollTop(0);
    }
  });
}


 
  function movie_details(movie_title, my_api_key) {
    var movieDetails;
    $.ajax({
        type: 'GET',
        url: 'https://api.themoviedb.org/3/search/movie',
        data: {
            api_key: my_api_key,
            query: movie_title
        },
        async: false, // Make the request synchronous
        success: function(response) {
            movieDetails = response;
        },
        error: function(xhr, status, error) {
            console.error("API Error! - " + error);
        }
    });
    return movieDetails;
}

function fetchRecommendations(movie_des, my_api_key) {
 
    var rec_movies = [];
    var rec_posters = [];
    var rec_movies_org = [];
    var rec_year = [];
    var rec_vote = [];
    $.ajax({
        type: 'GET',
        url: '/recommendations/' + movie_des,
        dataType: 'json',
        async: false, // Make the request synchronous
        
        success: function(data) {
            data.forEach(function(movieId) {
                var movieDetails = movie_details(movieId, my_api_key);
                rec_movies.push(movieDetails.results[0].original_title);
                rec_movies_org.push(movieDetails.results[0].original_title);
                rec_year.push(new Date(movieDetails.results[0].release_date).getFullYear());
                rec_vote.push(movieDetails.results[0].vote_average);
                if (movieDetails.results[0].poster_path) {
                    rec_posters.push("https://image.tmdb.org/t/p/original" + movieDetails.results[0].poster_path);
                } else {
                    rec_posters.push("static/default.jpg");
                }
            });
        },
        error: function(xhr, status, error) {
            console.error('Error fetching recommendations: ' + error);
        }
    });
    return {
        rec_movies: rec_movies,
        rec_movies_org: rec_movies_org,
        rec_posters: rec_posters,
        rec_year: rec_year,
        rec_vote: rec_vote
    };
}function movie_det(title, my_api_key, callback) {
  var imdb_id = null; // Initialize imdb_id variable

  $.ajax({
    type: 'GET',
    url: 'https://api.themoviedb.org/3/search/movie',
    data: {
      api_key: my_api_key,
      query: title
    },
    success: function(movie) {
      if (movie.results.length < 1) {
        console.log("No movie found with the title:", title);
      } else if (movie.results.length >= 1) {
        var movie_id = movie.results[0].id;

        // Fetch movie details using movie_id
        $.ajax({
          type: 'GET',
          url: 'https://api.themoviedb.org/3/movie/' + movie_id,
          data: {
            api_key: my_api_key
          },
          success: function(movie_details) {
            imdb_id = movie_details.imdb_id; // Store imdb_id from movie_details
            
            // Call the callback function with imdb_id
            callback(imdb_id);
          },
          error: function(error) {
            console.error("API Error! - ", error);
            // Call the callback function with null if there's an error
            callback(null);
          }
        });
      }
    },
    error: function(error) {
      console.error("Invalid Request - ", error);
      // Call the callback function with null if there's an error
      callback(null);
    }
  });
}

function viewSentimentAnalysis(movieTitle) {
  var my_api_key = 'f82d3658e4fe4c21487f2c409f868517';
  var loader = $("#loader"); // Loader element
  loader.show(); // Show the loader

  // Call movie_det with a callback function to handle the imdb_id
  movie_det(movieTitle, my_api_key, function(imdb_id) {
    // Construct the URL without changing the main.py URL
    var sentimentURL = 'http://localhost:5000/sentiment/' + imdb_id + '?movie_title=' + encodeURIComponent(movieTitle);

    // Update the window location URL
    window.location.href = sentimentURL;

    // Alternatively, you can send the movie_title as data in the AJAX request
    $.ajax({
      type: 'GET',
      url: '/sentiment/' + imdb_id,
      data: { movie_title: movieTitle },
      success: function(response) {
        console.log("Sentiment Analysis:", response);
        // Process the sentiment analysis response as needed
      },
      error: function(error) {
        console.error("Error performing sentiment analysis:", error);
      },
      complete: function() {
        loader.hide(); // Hide the loader when request is complete
      }
    });
  });
}

