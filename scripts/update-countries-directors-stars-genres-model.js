require('../src/init');

const _ = require('lodash');
const Bluebird = require('bluebird');

const Movie = require('../src/database/models/movie');

Bluebird.resolve()
  .then(async () => {
    const movies = await Movie
      .find({})
      // .limit(1)
      .lean();

    await Bluebird.each(movies, async (movie, index) => {
      console.log(`${index + 1}/${movies.length}`);

      const movieDb = await Movie.findOne({ source: movie.source });

      movieDb.countries = _.map(movie.countries, (country) => {
        return {
          label: country,
          slug: _.kebabCase(country),
        };
      });

      movieDb.directors = _.map(movie.directors, (director) => {
        return {
          label: director,
          slug: _.kebabCase(director),
        };
      });

      movieDb.stars = _.map(movie.stars, (star) => {
        return {
          label: star,
          slug: _.kebabCase(star),
        };
      });

      movieDb.genres = _.map(movie.genres, (genre) => {
        return {
          label: genre,
          slug: _.kebabCase(genre),
        };
      });

      await movieDb.save();
    });
  })
  .catch(console.log)
  .finally(() => process.exit(3));
