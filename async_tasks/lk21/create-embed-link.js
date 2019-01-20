const _ = require('lodash');
const util = require('util');
const utils = require('../../src/utils');

const embedTemplate = {
  rapidvideo: 'https://www.rapidvideo.com/e/%s',
  oload: 'https://oload.stream/embed/%s',
  sendit: 'https://sendit.cloud/embed-%s.html',
  uptobox: 'https://uptostream.com/iframe/%s',
  openload: 'https://openload.pw/embed/%s',
  uptostream: 'https://uptostream.com/iframe/%s',
  userscloud: 'https://userscloud.com/embed-%s',
  tusfiles: 'https://tusfiles.net/embed-%s.html',
  thevideo: 'https://thevideo.me/embed-%s',
};

const specialEmbedTemplate = {
  opload: 'https://openload.pw/embed/%s',
  youtube: 'https://www.youtube.com/embed/%s',
};

const embedKeys = _.keys(embedTemplate);

const getProvider = (downloadLink) => {
  let provider;

  _.forEach(embedKeys, (embedKey) => {
    if (downloadLink.indexOf(embedKey) >= 0) {
      provider = embedKey;

      return false;
    }

    return true;
  });

  return provider;
};

const getYoutubeUniqueCode = (youtubeLink) => {
  let indexOfV = youtubeLink.indexOf('v=') + 2;

  let uniqueCode = '';

  while (utils.isAlphaNumeric(youtubeLink[indexOfV])) {
    uniqueCode += youtubeLink[indexOfV];
    indexOfV += 1;
  }

  return uniqueCode;
};

const createEmbedLink = (downloadLink) => {
  let uniqueCode = _.chain(downloadLink)
    .split('/')
    .compact()
    .last()
    .value();

  const provider = getProvider(downloadLink);

  if (provider) {
    return util.format(embedTemplate[provider], uniqueCode);
  }

  if (downloadLink.indexOf('opload') >= 0) {
    uniqueCode = _.chain(downloadLink)
      .split('/')
      .compact()
      .dropRight()
      .last()
      .value();

    return util.format(specialEmbedTemplate.opload, uniqueCode);
  }

  if (downloadLink.indexOf('youtube') >= 0) {
    const utubeUniqueCode = getYoutubeUniqueCode(downloadLink);

    return util.format(specialEmbedTemplate.youtube, utubeUniqueCode);
  }

  return undefined;
};

module.exports = createEmbedLink;
