const Bluebird = require('bluebird');
const superagent = require('superagent').agent();
const cheerio = require('cheerio');

const decoder = require('./decoder');

const request = Bluebird.promisifyAll(superagent);

const getVariableValue = (responseText, keyword, endChar) => {
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

const getKeyStr = movieUrl => Bluebird.resolve()
  .then(async () => {
    const response = await request.get('https://indoxxi.bz/js/v76.js')
      .buffer(true)
      .set('Referer', movieUrl)
      .set('Accept', '*/*')
      .set('Origin', 'https://indoxxi.bz')
      .set('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36');;

    return getVariableValue(response.text, '_keyStr:"', '"');
  });

const getMovie = movieUrl => Bluebird.resolve()
  .then(async () => {
    await request.get('https://indoxxi.bz');

    const [keyStr, response] = await Bluebird.all([
      await getKeyStr(movieUrl),
      await request.get(movieUrl),
    ]);

    const $ = cheerio.load(response.text);

    const cookieName = getVariableValue(response.text, 'var cookie_name="', '"');
    const ts2 = getVariableValue(response.text, 'ts2=', ';');
    const dataTmdb = $('#downloadmv').attr('data-tmdb');

    const tokenUrl = decoder.getTokenUrl(cookieName, dataTmdb, ts2);
    console.log('Request token to', tokenUrl);

    const encoded = await request.get(tokenUrl)
      .set('Referer', movieUrl)
      .set('Accept', '*/*')
      .set('Origin', 'https://indoxxi.bz')
      .set('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36');

    const encodedText = encoded.text;
    const data = JSON.parse(decoder.decode(keyStr, encodedText));

    console.log(JSON.stringify(data, null, 2));
  });

// Bluebird.resolve()
//   .then(async () => {
//     await getMovie('https://indoxxi.bz/movie/io-2019-9aap/play');
//   });
