const Bluebird = require('bluebird');

const superagent = require('superagent').agent();

const request = Bluebird.promisifyAll(superagent);

const getKeyStr = movieUrl => Bluebird.resolve()
  .then(async () => {
    // const response = await request.get('https://indoxxi.bz/js/v76.js')
    //   .buffer(true)
    //   .set('Referer', movieUrl)
    //   .set('Accept', '*/*')
    //   .set('Origin', 'https://indoxxi.bz')
    //   .set('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36');

    // return getVariableValue(response.text, '_keyStr:"', '"');
    return 'ZYX10+/PONM765LKJIAzyTSRQGxwvuHWVFEDUCBtsrqdcba9843ponmlkjihgfe2';
  });

module.exports = getKeyStr;
