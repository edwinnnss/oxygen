const Bluebird = require('bluebird');
const Movie = require('../../database/models/movie');

const getKeyString = require('../../lib/indoxx1/get-key-string');
const getSourceMetaData = require('../../lib/indoxx1/get-source-meta-data');
const utils = require('../../utils');

module.exports = (req, res) => Bluebird.resolve()
  .then(async () => {
    const { slug } = req.params;
    const movie = await Movie
      .findOne({ slug });

    if (!movie) {
      return res.send(null);
    }

    try {
      const playUrl = movie.source + '/play';

      const [keyString, playResponse] = await Bluebird.all([
        await getKeyString(movie.source),
        await utils.get(playUrl),
      ]);

      const sourceMetaDataFromWebsite = await getSourceMetaData(movie.source, keyString, playResponse);

      if (sourceMetaDataFromWebsite) {
        movie.sourceMetaData = sourceMetaDataFromWebsite;

        await movie.save();
      }
    } catch (error) {
      console.log('Error while get source meta data from indoxx1', JSON.stringify(error, null, 2));
    }

    return res.send(movie);
  })
  .catch(console.log);
