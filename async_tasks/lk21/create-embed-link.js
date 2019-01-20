const _ = require('lodash');
const util = require('util');

const embedTemplate = {
  rapidVideo: 'https://www.rapidvideo.com/e/%s',
  oload: 'https://oload.stream/embed/%s',
  sendit: 'https://sendit.cloud/embed-%s.html',
  uptobox: 'https://uptostream.com/iframe/%s',
  youtube: 'https://www.youtube.com/embed/%s',
  openload: 'https://openload.pw/embed/%s',
  uptostream: 'https://uptostream.com/iframe/%s',
  userscloud: 'https://userscloud.com/embed-%s',
};

const createEmbedLink = (downloadLink) => {
  let uniqueCode = _.chain(downloadLink)
    .split('/')
    .compact()
    .last()
    .value();

  if (downloadLink.indexOf('rapidvideo') >= 0) {
    return util.format(embedTemplate.rapidVideo, uniqueCode);
  }

  if (downloadLink.indexOf('oload') >= 0) {
    return util.format(embedTemplate.oload, uniqueCode);
  }

  if (downloadLink.indexOf('sendit') >= 0) {
    return util.format(embedTemplate.sendit, uniqueCode);
  }

  if (downloadLink.indexOf('uptobox') >= 0) {
    return util.format(embedTemplate.uptobox, uniqueCode);
  }

  if (downloadLink.indexOf('uptostream') >= 0) {
    return util.format(embedTemplate.uptostream, uniqueCode);
  }

  if (downloadLink.indexOf('openload') >= 0) {
    return util.format(embedTemplate.openload, uniqueCode);
  }

  if (downloadLink.indexOf('userscloud') >= 0) {
    return util.format(embedTemplate.userscloud, uniqueCode);
  }

  if (downloadLink.indexOf('tusfiles') >= 0) {
    return undefined;
  }

  if (downloadLink.indexOf('opload') >= 0) {
    uniqueCode = _.chain(downloadLink)
      .split('/')
      .compact()
      .dropRight()
      .last()
      .value();

    return util.format(embedTemplate.openload, uniqueCode);
  }

  return undefined;
};

module.exports = createEmbedLink;
