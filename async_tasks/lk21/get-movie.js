const _ = require('lodash');
const isUrl = require('is-url');

const cheerio = require('cheerio');
const utils = require('../../src/utils');

const getMovie = async (movieUrl) => {
  const response = await utils.get(movieUrl);
  const $ = cheerio.load(response.text);

  const slug = _.last(_.compact(movieUrl.split('/')));
  const name = $('h1.entry-title').text();
  const released = $('table time[itemprop="dateCreated"]').text();
  const duration = $('.gmr-movie-runtime').text();
  const language = $('table span[property="inLanguage"]').text();
  const coverImageUrl = $('meta[property="og:image"]').attr('content');
  const director = $('table span[itemprop="director"]').text();
  const summary = $('#muvipro_player_content_id > div.entry-content.entry-content-single > p:nth-child(1)').text();

  let trailerUrl = $('#muvipro_player_content_id > ul > li:nth-child(3) > a').attr('href');

  if (!isUrl(trailerUrl)) {
    trailerUrl = '';
  }

  const tags = new Set();
  $('meta[property="article:tag"]').each((index, elem) => {
    const tag = $(elem).attr('content');

    tags.add(tag);
  });

  const genres = new Set();
  $('.gmr-movie-genre a').each((index, elem) => {
    const genre = _.trim($(elem).text());

    genres.add(genre);
  });

  const downloadLinks = new Set();
  $('#download ul li a').each((index, elem) => {
    const downloadLink = _.trim($(elem).attr('href'));

    downloadLinks.add(downloadLink);
  });

  const stars = new Set();
  $('table span[itemprop="actors"]').each((index, elem) => {
    const star = _.trim($(elem).text());

    stars.add(star);
  });

  return {
    name,
    released,
    language,
    slug,
    director,
    coverImageUrl,
    trailerUrl,
    summary,
    source: movieUrl,
    tags: Array.from(tags),
    duration: _.replace(duration, /[^0-9]/g, ''),
    genres: Array.from(genres),
    downloadLinks: Array.from(downloadLinks),
    stars: Array.from(stars),
  };
};

module.exports = getMovie;
