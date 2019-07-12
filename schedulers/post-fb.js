require('../src/init');

const _ = require('lodash');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));
const request = require('request-promise');
const Bluebird = require('bluebird');
const Movie = require('../src/database/models/movie');
const { QUALITY_FORMAT_MAPPING } = require('../src/constants');

const getRandomMovie = async () => {
  const totalMovie = await Movie.count();

  const random = Math.floor(Math.random() * totalMovie);

  let movie = await Movie.findOne().skip(random);

  const slugsHasBeenPosted = JSON.parse(fs.readFileSync(__dirname + '/slug.json'));

  if (slugsHasBeenPosted.find(slug => slug === movie.slug)) {
    movie = await getRandomMovie();
  } else {
    fs.writeFileSync(
      __dirname + '/slug.json',
      JSON.stringify(slugsHasBeenPosted.concat(movie.slug), null, 2),
    );
  }

  return movie;
};

Bluebird.resolve()
  .then(async () => {
    console.log('Getting movie...');

    const { slug } = argv;
    const movie = slug ? await Movie.findOne({ slug }) : await getRandomMovie();

    const message = `Nonton film ${movie.name} | Tanpa Iklan Sub Indo`
      + `\nQuality: ${_.get(QUALITY_FORMAT_MAPPING, `${movie.quality}.name`, 'HD')}`
      + ` | Genre: ${_.join(_.map(movie.genres, 'label'), ', ')}`
      + `\n\n${movie.summary.length > 150 ? movie.summary.substring(0, 147) + '...' : movie.summary}`
      + `\n\nlink: https://nontongue.xyz/movie/${movie.slug}`;

    const url = `https://graph.facebook.com/v3.3/${process.env.PAGE_ID}/feed`
      + `?access_token=${process.env.PAGE_ACCESS_TOKEN}`
      + `&message=${message}`
      + `&link=https://nontongue.xyz/movie/${movie.slug}`;

    console.log(`Post url: ${url}`);

    const result = await request.post(url);

    if (!_.isEmpty(result)) {
      console.log(`Successfully posting to facebook with slug: ${movie.slug}`);
    } else {
      console.log(`Failed posting to facebook with slug: ${movie.slug}`);
    }
  })
  .catch(console.log)
  .finally(() => process.exit(3));
