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
