const express = require('express');

const getMovieListHandler = require('../handlers/movie/get-movie-list');
const getMovieHandler = require('../handlers/movie/get-movie');
const getSourceMetaData = require('../handlers/movie/get-source-meta-data');

const router = express();

router.get('/', getMovieListHandler);
router.get('/:slug', getMovieHandler);
router.get('/:slug/play', getSourceMetaData);

module.exports = router;
