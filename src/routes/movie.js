const express = require('express');

const getMoviesHandler = require('../handlers/movie/get-movies');
const getMovieHandler = require('../handlers/movie/get-movie');
const getSourceMetaDataHandler = require('../handlers/movie/get-source-meta-data');

const getGenresHandler = require('../handlers/movie/get-genres');

const router = express();

router.get('/', getMoviesHandler);
router.get('/genres', getGenresHandler);

router.get('/:slug', getMovieHandler);
router.get('/:slug/play', getSourceMetaDataHandler);

module.exports = router;
