const Bluebird = require('bluebird');
const superagent = require('superagent').agent();

const request = Bluebird.promisifyAll(superagent);

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
