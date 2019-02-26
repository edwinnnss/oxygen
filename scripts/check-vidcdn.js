require('../src/init');

const _ = require('lodash');
const Bluebird = require('bluebird');

const Movie = require('../src/database/models/movie');

const BANNED_TYPE = new Set(['drives_muvi', 'drives_lk21', 'drives']);

Bluebird.resolve()
  .then(async () => {
    const results = [];
    const movies = await Movie
      .find({
        type: 'film-series',
      })
      .select('episodes')
      .lean();

    const metaTypes = new Set();

    await Bluebird.each(movies, async (movie, index) => {
      const { episodes } = movie;

      _.map(episodes, (episode) => {
        const { sourceMetaData } = episode;

        if (!sourceMetaData) {
          return;
        }
        sourceMetaData.pop();

        _.map(sourceMetaData, (data) => {
          const { meta } = data;

          console.log(meta.type);
          metaTypes.add(meta.type);
        });
      });
    });

    console.log(metaTypes)

    // await Bluebird.each(movies, async (movie, index) => {
    //   console.log(`${index + 1}/${movies.length}: ${movie.name}`);

    //   const { sourceMetaData } = movie;

    //   if (!sourceMetaData) {
    //     return Bluebird.resolve();
    //   }

    //   await Bluebird.each(sourceMetaData, async (datum) => {
    //     if (!datum) {
    //       return Bluebird.resolve();
    //     }

    //     const isSource = !_.isArray(datum);

    //     if (!isSource) {
    //       return Bluebird.resolve();
    //     }

    //     // await Bluebird.each(datum.sources, (source) => {
    //     //   if (!_.get(source, 'file')) {
    //     //     return Bluebird.resolve();
    //     //   }

    //     //   if (source.file.indexOf('youtube') >= 0) {
    //     //     results.push('https://oxygen.now.sh/movie/' + movie.slug);
    //     //     return Bluebird.resolve();
    //     //   }

    //     //   return Bluebird.resolve();
    //     // });

    //     const metaType = _.get(datum, 'meta.type');

    //     if (metaType === 'iframe') {
    //       results.push('https://oxygen.now.sh/movie/' + movie.slug + '/play');
    //     }

    //     // const kuki = _.get(datum, 'meta.backup2');
    //     // const metaType = _.get(datum, 'meta.type');

    //     // if (kuki && !BANNED_TYPE.has(metaType)) {
    //     //   results.push('https://oxygen.now.sh/movie/' + movie.slug);
    //     // }

    //     return Bluebird.resolve();
    //   });

    //   return Bluebird.resolve();
    // });

    console.log(JSON.stringify(results, null, 2));
  })
  .catch(console.log)
  .finally(() => process.exit(3));
