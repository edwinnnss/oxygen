require('../src/init');

const _ = require('lodash');
const Bluebird = require('bluebird');

const Movie = require('../src/database/models/movie');
const BANNED_TYPE = new Set(['drives_muvi', 'drives_lk21', 'drives']);

Bluebird.resolve()
  .then(async () => {
    const results = [];
    const movies = await Movie
      .find({});

    await Bluebird.each(movies, async (movie, index) => {
      console.log(`${index + 1}/${movies.length}: ${movie.name}`);

      const { sourceMetaData } = movie;

      if (!sourceMetaData) {
        return Bluebird.resolve();
      }

      await Bluebird.each(sourceMetaData, async (datum) => {
        if (!datum) {
          return Bluebird.resolve();
        }

        const isSource = !_.isArray(datum);

        if (!isSource) {
          return Bluebird.resolve();
        }

        // await Bluebird.each(datum.sources, (source) => {
        //   if (source.file.indexOf('mp4') >= 0) {
        //     results.push('https://oxygen.now.sh/movie/' + movie.slug);
        //     return Bluebird.resolve();
        //   }

        //   return Bluebird.resolve();
        // });

        // return Bluebird.resolve();

        // const metaType = _.get(datum, 'meta.type');

        // if (metaType === 'kuki') {
        //   results.push('https://oxygen.now.sh/movie/' + movie.slug);
        // }

        const kuki = _.get(datum, 'meta.backup2');
        const metaType = _.get(datum, 'meta.type');

        if (kuki && !BANNED_TYPE.has(metaType)) {
          results.push('https://oxygen.now.sh/movie/' + movie.slug);
        }

        return Bluebird.resolve();
      });

      return Bluebird.resolve();
    });

    console.log(JSON.stringify(results, null, 2));
  })
  .catch(console.log)
  .finally(() => process.exit(3));
