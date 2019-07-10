const _ = require('lodash');
const Bluebird = require('bluebird');

const { checkResponse } = require('../../utils');

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

  if (_.get(source, 'file', '').indexOf('google') >= 0) {
    let statusCode;
    let contentType;

    try {
      const response = await checkResponse(source.file);

      contentType = _.get(response, 'headers.[content-type]');
      ({ statusCode } = response);
    } catch (errResponse) {
      ({ statusCode } = errResponse);
    }

    if (statusCode < 200 || statusCode >= 300) {
      return Bluebird.resolve();
    }

    if (contentType !== 'video/mp4') {
      return Bluebird.resolve();
    }

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

      if (indexChar === '\\') {
        index += 1;
      }
      index += 1;
    } else {
      next = false;
    }
  }

  return value;
};

exports.modifySourceMetaData = sourceMetaData => Bluebird.resolve()
  .then(async () => {
    const storeMetaIds = [];

    return Bluebird.map(sourceMetaData, async (data) => {
      if (!data) {
        return Bluebird.resolve();
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

      // remove duplicate sourceMeta based on metaId
      const metaId = _.get(data, 'meta.id');
      if (metaId) {
        if (_.includes(storeMetaIds, metaId)) return Bluebird.resolve();
        storeMetaIds.push(metaId);
      }

      let sourcesPatch = _.map(data.sources, renameLabel);
      sourcesPatch = _.compact(await Bluebird.map(sourcesPatch, filterResponse));

      if (_.compact(sourcesPatch).length === 0) {
        return Bluebird.resolve();
      }

      data.sources = sourcesPatch;

      return data;
    });
  });

exports.getValueBetweenBracket = (str) => {
  const firstBracket = _.indexOf(str, '(');
  const lastBracket = _.indexOf(str, ')');

  return str.slice(firstBracket + 1, lastBracket);
};
