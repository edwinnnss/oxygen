require('../src/init');

const _ = require('lodash');
const fs = require('fs');
const Bluebird = require('bluebird');

const Movie = require('../src/database/models/movie');
const movieQuery = require('../src/database/queries/movie');

const getMovieUrls = require('./lk21/get-movie-urls');
const getMovie = require('./lk21/get-movie');
const createEmbedLink = require('./lk21/create-embed-link');

const movieUrlPath = 'tmp/movie-urls.json';

const setEmbedLinks = async () => {
  const movies = await Movie.find();

  await Bluebird.each(movies, async (movie, index) => {
    console.log(`${index + 1}/${movies.length} set ${movie.source}`);
    const { downloadLinks } = movie;

    movie.embedlinks = _.compact(_.map(downloadLinks, createEmbedLink));

    await movie.save();
  });
};

Bluebird.resolve()
  .then(async () => {
    let movieUrls;
    let counter = 1;

    if (fs.existsSync(movieUrlPath)) {
      movieUrls = JSON.parse(fs.readFileSync(movieUrlPath, 'utf8'));
    } else {
      movieUrls = await getMovieUrls();
      fs.writeFileSync(movieUrlPath, JSON.stringify(movieUrls, null, 2));
    }
    await Bluebird.each(movieUrls, async (movieUrl) => {
      console.log(`${counter}/${movieUrls.length} | Extract data from ${movieUrl}`);
      counter += 1;
      const movie = await getMovie(movieUrl);

      await movieQuery.upsert(movie);
    });

    // const movie = await getMovie('http://lk21.red/avengers-infinity-war-2018/');
    // console.log(movie);
  })
  .catch(console.log)
  .finally(() => process.exit(3));
