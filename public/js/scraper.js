const API_BASE = 'https://cors-anywhere.herokuapp.com/http://yugiohprices.com/api/';
//const API_BASE = 'https://crossorigin.me/http://yugiohprices.com/api/';

//Helpers
function loaderOn() {$('#loader').fadeIn();}
function loaderOff() {$('#loader').fadeOut();}
function saveText(text, filename){
  var a = document.createElement('a');
  a.setAttribute('href', 'data:text/plain;charset=utf-u,'+encodeURIComponent(text));
  a.setAttribute('download', filename);
  a.click()
}

function getSets() {
  return axios.get(API_BASE + 'card_sets');
}

function getCards(set) {
  $('#res-get-sets').fadeOut();
  $('#set-info-name').text(set);
  $('#get-cards-panel').fadeIn();
  loaderOn();
  axios.get(API_BASE + 'set_data/' + set).then(function(data) {
    cards_names = data.data.data.cards.map(card => card.name);
    $('#set-info-length').text(data.data.data.cards.length);
    loaderOff();
  }).catch(function(err) {
    console.log(err);
    $.notify('Error, we could not get the cards', 'error');
    loaderOff();
  });
}

function getAllCardsBySet() {
  let set = $('#set-info-name').text();
  if (!set || set.length <= 0) return $.notify('Set not specified', 'error');
  if (!cards_names || cards_names.length <= 0) return $.notify('No cards to fetch', 'error');
  loaderOn();
  let q_cards = [];
  cards_names.forEach(card => q_cards.push(axios.get(API_BASE + 'card_data/' + card)));
  Q.all(q_cards).then(data => {
    $('#res-get-cards-info-length').text(data.length);
    final_cards_list = data.map(res => res.data.data);
    $('#res-get-cards').fadeIn();
    loaderOff();
  }).catch(err => {
    $.notify('Error, we could not fetch the cards info', 'error');
    loaderOff();
  });
}

//Exports
function exportJson() {
  if(!final_cards_list) return $.notify('There are no cards to export', 'error');
  saveText(JSON.stringify(final_cards_list), $('#set-info-name').text().replace(/\s+/g, '')+ '.json');
}

function exportCsv(mode) {
  // 1:Monsters 2:Spells 3:Traps
  if(!final_cards_list) return $.notify('There are no cards to export', 'error');
  switch (mode) {
    case 1:
      let monster_list = final_cards_list.filter(card => card.card_type == 'monster');
      saveText(Papa.unparse(JSON.stringify(monster_list)), $('#set-info-name').text().replace(/\s+/g, '')+ '.csv');
      break;
    default:
      $.notify('Invalid CSV export mode', 'error');
  }
}

$(function () {

  //Initial config
  //$('#get-cards-panel').fadeOut();
  $('#loader').fadeOut();

  //Get Sets
  $('#scraper-get-sets').click(e => {
    loaderOn();
    getSets().then(function(data) {
      data.data.forEach((set, i) => $('#res-get-sets').append(`
        <tr>
          <td>${i + 1}</td>
          <td>${set}</td>
          <td><button class="btn btn-primary" onclick="getCards('${set}')">Get Cards</button></td>
        </tr>
      `));
      $('#res-get-sets').fadeIn();
      loaderOff();
    }).catch(function(err) {
      console.log(err);
      $.notify('Error, we could not get the card sets', 'error');
      loaderOff();
    });
  });

});
