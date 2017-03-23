const express = require('express');
const cheerio = require('cheerio');
const request = require('request');
const app = express();

const API_BASE = 'http://yugiohprices.com/api/';

app.use(express.static('public'));

app.get('/monsters/:page', (req, res) => {
  let page = req.params.page;
  let final_res = [];
  request(API_MONSTERS + page, (err, response, html) => {
    if(err) return res.json(500, {err: err, msg: 'Ocurrió un error'});

    let $ = cheerio.load(html);
    $('.box_list').each(i => {
      console.log(i);
      let card = $(this);
      final_res.push({
        name: card.find('span.card_status').children().text()
      });
    });

    return res.json({msg: 'Request Succesul', cards: final_res});
  });
});

app.listen(8080, () => {
  console.log('SERVER - :8080');
});
