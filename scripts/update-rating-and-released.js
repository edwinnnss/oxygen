require('../src/init');

const _ = require('lodash');
const Bluebird = require('bluebird');

const Movie = require('../src/database/models/movie');

Bluebird.resolve()
  .then(async () => {
    const movies = await Movie.find({});

    await Bluebird.each(movies, async (movie) => {
      if (movie.ratingValue === 'N/A') {
        console.log('abc');
        movie.ratingValue = '0';
      }

      console.log(movie.released);
      console.log(_.toString(movie.released).split('-'));
      const [year, month, day] = _.toString(movie.released).split('-');

      movie.released = {
        year: _.replace(year, /[^0-9]/g, ''),
        month: _.replace(month, /[^0-9]/g, ''),
        day: _.replace(day, /[^0-9]/g, ''),
      };

      console.log(movie.ratingValue, movie.released);
      await movie.save();
    });
  })
  .catch(console.log)
  .finally(() => process.exit(3));
