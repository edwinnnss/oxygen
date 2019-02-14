const _ = require('lodash');
const Bluebird = require('bluebird');

const BANNED_TYPE = new Set(['drives_muvi', 'drives_lk21', 'drives']);

const renameLabel = (source) => {
  if (_.toLower(source.label) === 'hd') {
    source.label = '720p';
  } else if (_.toLower(source.label) === 'sd') {
    source.label = '360p';
  }

  return source;
};

const filterResponse = async (source) => {
  if (_.get(source, 'file', '').indexOf('youtube') >= 0) {
    source.file = source.file.replace('watch?v=', 'embed/');

    return source;
  }

  return source;
};

const filterOffLabel = (sub) => {
  if (sub.label === 'off') {
    return Bluebird.resolve();
  }

  return sub;
};

exports.getVariableValue = (responseText, keyword, endChar) => {
  const keywordIndex = responseText.indexOf(keyword);
  let index = keywordIndex + keyword.length;

  let value = '';
  let next = true;

  while (next) {
    const indexChar = responseText[index];
    if (indexChar !== endChar) {
      value += indexChar;
      index += 1;
    } else {
      next = false;
    }
  }

  return value;
};

exports.modifySourceMetaData = async sourceMetaData => Bluebird.map(sourceMetaData, async (data) => {
  if (!data) {
    return data;
  }

  if (_.isArray(data)) {
    return _.chain(data)
      .map(filterOffLabel)
      .compact()
      .value();
  }

  const metaType = _.get(data, 'meta.type');
  if (BANNED_TYPE.has(metaType)) {
    return Bluebird.resolve();
  }

  let sourcesPatch = _.map(data.sources, renameLabel);
  sourcesPatch = _.compact(await Bluebird.map(sourcesPatch, filterResponse));

  if (_.compact(sourcesPatch).length === 0) {
    return Bluebird.resolve();
  }

  data.sources = sourcesPatch;

  return data;
})
  .then(_.compact);

exports.getValueBetweenBracket = (str) => {
  const firstBracket = _.indexOf(str, '(');
  const lastBracket = _.indexOf(str, ')');

  return str.slice(firstBracket + 1, lastBracket);
};
