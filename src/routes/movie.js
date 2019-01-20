const express = require('express');

const getMovieListHandler = require('../handlers/movie/get-movie-list');
const getMovieHandler = require('../handlers/movie/get-movie');

const router = express();

router.get('/', getMovieListHandler);
router.get('/:slug', getMovieHandler);

module.exports = router;
