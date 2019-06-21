const Bluebird = require('bluebird');

const Movie = require('../../database/models/movie');

const getKeyString = require('../../lib/indoxx1/get-key-string');
const getSourceMetaData = require('../../lib/indoxx1/get-source-meta-data');
const getSeriesEpisodeMetaData = require('../../lib/indoxx1/get-series-episode-meta-data');
// const getSeriesEpisodes = require('../../lib/indoxx1/get-series-episodes');
const { get, getNumber } = require('../../utils');

module.exports = (req, res) => Bluebird.resolve()
  .then(async () => {
    const { slug } = req.params;
    const index = getNumber(req.query.index, 1);
    const movie = await Movie
      .findOne({ slug })
      .select('name sourceMetaData source type episodes');

    if (!movie) {
      return res.send(null);
    }

    try {
      let playUrl = movie.source + '/play';

      if (movie.type === 'film-series') {
        playUrl = movie.source + '/playtv';
      }

      const [keyString, playResponse] = await Bluebird.all([
        await getKeyString(movie.source),
        await get(playUrl),
      ]);

      if (movie.type === 'film-series') {
        movie.episodes = await getSeriesEpisodeMetaData(playUrl, keyString, playResponse, movie.episodes, index);

        await movie.markModified('episodes');
        await movie.save();
      } else {
        movie.sourceMetaData = await getSourceMetaData(movie.source, keyString, playResponse);

        await movie.save();
      }
    } catch (error) {
      console.log(error);
      console.log('Error while get source meta data from indoxx1', JSON.stringify(error, null, 2));
    }

    return res.send(movie);
  })
  .catch(console.log);
