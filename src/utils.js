const _ = require('lodash');
const Bluebird = require('bluebird');
const superagent = require('superagent').agent();

const request = Bluebird.promisifyAll(superagent);

exports.checkResponse = async (url) => {
  return request.get(url)
    .set('Range', 'bytes=0-150')
    .timeout(10000);
};

exports.get = async (url) => {
  let credit = 10;
  let error = true;

  let response;

  while (error && credit) {
    try {
      response = await request.get(url).timeout(10000);
      error = false;
    } catch (errResponse) {
      console.log(`Connection Error try again to scrape ${url}! ${credit}`);

      credit -= 1;
      error = true;

      if (errResponse.status === 404) {
        error = false;
        response = errResponse;
      }
    }
  }

  return response;
};

exports.formPost = async (url, payload) => {
  let credit = 10;
  let error = true;

  let response;

  while (error && credit) {
    try {
      response = await request
        .post(url)
        .send(payload)
        .type('form')
        .timeout(10000);

      error = false;
    } catch (errResponse) {
      console.log(`Connection Error try again to form post ${url}! ${credit}`);

      credit -= 1;
      error = true;

      if (errResponse.status === 404) {
        error = false;
        response = errResponse;
      }
    }
  }

  return response;
};

exports.isAlphaNumeric = (str) => {
  let code;
  let i;
  let len;

  for (i = 0, len = str.length; i < len; i += 1) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) // numeric (0-9)
      && !(code > 64 && code < 91) // upper alpha (A-Z)
      && !(code > 96 && code < 123)) { // lower alpha (a-z)
      return false;
    }
  }
  return true;
};

exports.retry = (task, credit = 5) => Bluebird.resolve()
  .then(async () => {
    return task();
  })
  .catch(async (error) => {
    if (!credit) {
      console.log('Credit exceeded !');
      return Bluebird.reject(error);
    }

    credit -= 1;

    console.log(`Exception occurred will wait for 5 seconds, ${JSON.stringify(error, null, 2)}`);
    await Bluebird.delay(5000);

    return exports.retry(task, credit);
  });

exports.getNumber = (rawNum, defaultNumber) => {
  if (!rawNum) {
    return defaultNumber;
  }

  const number = _.toNumber(rawNum);

  if (_.isNaN(number)) {
    return defaultNumber;
  }

  return number;
};
