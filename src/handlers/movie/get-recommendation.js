const _ = require('lodash');
const Bluebird = require('bluebird');

const Movie = require('../../database/models/movie');
const { recommendationCache } = require('../../lru-caches');
const { MAX_RECOMMENDATION_ITEM } = require('../../constants');

module.exports = (req, res) => Bluebird.resolve()
  .then(async () => {
    const { slug } = req.params;

    let movie = recommendationCache.get(slug);

    if (movie) {
      return res.send(movie);
    }

    movie = await Movie
      .findOne({ slug })
      .select('stars directors genres')
      .lean();

    if (!movie) {
      return res.send(null);
    }

    const { stars = [], directors = [], genres = [] } = movie;

    // get based on stars
    let recommendationMovies = await Movie
      .find({
        'stars.slug': { $in: _.map(stars, 'slug') },
        'slug': { $ne: slug },
      })
      .select('name posterUrl quality ratingValue slug')
      .sort({ ratingValue: -1 })
      .limit(MAX_RECOMMENDATION_ITEM)
      .lean();

    // if it's not enough, get from director
    if (recommendationMovies.length < MAX_RECOMMENDATION_ITEM) {
      const moviesBasedOnDirectors = await Movie
        .find({
          'directors.slug': { $in: _.map(directors, 'slug') },
          'slug': { $ne: slug },
        })
        .select('name posterUrl quality ratingValue slug')
        .sort({ ratingValue: -1 })
        .limit(MAX_RECOMMENDATION_ITEM - recommendationMovies.length)
        .lean();

      recommendationMovies = recommendationMovies.concat(moviesBasedOnDirectors);
    }

    // if it's not enough, get from genre
    if (recommendationMovies.length < MAX_RECOMMENDATION_ITEM) {
      const moviesBasedOnGenres = await Movie
        .find({
          'genres.slug': { $in: _.map(genres, 'slug') },
          'slug': { $ne: slug },
        })
        .select('name posterUrl quality ratingValue slug')
        .sort({ ratingValue: -1 })
        .limit(MAX_RECOMMENDATION_ITEM - recommendationMovies.length)
        .lean();

      recommendationMovies = recommendationMovies.concat(moviesBasedOnGenres);
    }

    recommendationCache.set(slug, recommendationMovies);

    return res.send(recommendationMovies);
  })
  .catch(console.log);
