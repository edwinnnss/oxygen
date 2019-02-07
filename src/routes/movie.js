const express = require('express');

const getMoviesHandler = require('../handlers/movie/get-movies');
const getMovieHandler = require('../handlers/movie/get-movie');
const getSourceMetaDataHandler = require('../handlers/movie/get-source-meta-data');

const getDistinctFieldHandler = require('../handlers/movie/get-distinct-field');
const getGenresHandler = require('../handlers/movie/get-genres');

const router = express();

router.get('/', getMoviesHandler);
router.get('/genres', getGenresHandler);

router.get('/distinct/:field', getDistinctFieldHandler);

router.get('/:slug', getMovieHandler);
router.get('/:slug/play', getSourceMetaDataHandler);

module.exports = router;
