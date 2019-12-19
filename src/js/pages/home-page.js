import $ from 'jquery';
import store from 'store2';
import axios from 'axios';
import GraphCard from '../components/graph-card.js';
import News from '../components/news.js';
import StockList from '../components/stocklist.js';
import { URL_BASE, API_TOKEN } from '../../const.js';

class HomePage {
  constructor(canvasId) {
    this.$canvas = $(canvasId);
    this.graph;
    this.popup;
    this.watchlist = store.get('watchlist') || [];
    this.render();
    this.$PageContainer = $('#most-active-container');
    this.$stockListContainer = $('.stock-list');

    this.getStocks();
    this.mostActiveSymbols;
    this.news;

    // window.addEventListener('storage', function(event) {
    //   console.log(event);
    //   console.log('changes made');
    // }, false);

    // window.addEventListener('click', function(event) {
    //   console.log('hey', event.target);
    // });
  }


  // RETRIEVE SYMBOLS FOR MOST ACTIVE STOCKS
  getMostActiveSymbols() {
    const symbols = store.get('mostactive');
    return symbols.slice(0, 5).map((stock) => {
      return stock.symbol;
    })
  }


  // RENDER HTML
  render() {
    let html =
      `
        <div id="home-graph-cards-container" class="home-row">
          <div id="home-graphCard0"></div>
          <div id="home-graphCard1"></div>
          <div id="home-graphCard2"></div>
        </div>
        <div class="home-row">
          <div id="mostactive-container" class="box margin-right"></div>
          <div id="home-news" class="box"></div>
        </div>
        <div class="home-row">
          <div id="gainers-container" class="box margin-right"></div>
          <div id="losers-container" class="box"></div>
        </div>
      `;
    this.$canvas.empty();
    this.$canvas.append(html);
  }


  // CHECK IF WATCHLIST HAS STOCK. RETURNS A BOOLEAN.
  isInWatchlist(symbol) {
    return this.watchlist.some(stock => stock.symbol === symbol);
  }


  // RETRIEVE STOCKS FROM EITHER API OR STORE
  getStocks() {
    const mostActive = store.get('mostactive') || [];
    const gainers = store.get('gainers') || [];
    const losers = store.get('losers') || [];

    // check if local storage exist
    if (mostActive.length && gainers.length && losers.length) {
      this.mostActiveSymbols = this.getMostActiveSymbols();
      new StockList('#mostactive-container', 'mostactive', 'Most Active');
      new StockList('#gainers-container', 'gainers', 'Gainers');
      new StockList('#losers-container', 'losers', 'Losers');
      this.renderGraphCards();
      this.news = new News('#home-news', this.mostActiveSymbols, 'home-news', 1);
    }
    else {
      this.fetchStocks();
    }
  }


  // RENDER SMALL GRAPH CARDS
  renderGraphCards() {
    const mostActiveSymbols = store.get('mostactive');
    
    mostActiveSymbols.slice(0, 3).map((stock, index) => {
      const symbol = stock.symbol;
      new GraphCard(`#home-graphCard${index}`, symbol);
    });
  }


  // GET LIST OF COMPANIES
  fetchStocks() {
    axios.all([
      axios.get(`${URL_BASE}/market/collection/list?collectionName=mostactive&token=${API_TOKEN}`),
      axios.get(`${URL_BASE}/market/collection/list?collectionName=gainers&token=${API_TOKEN}`),
      axios.get(`${URL_BASE}/market/collection/list?collectionName=losers&token=${API_TOKEN}`)
    ])
    .then(axios.spread((mostActive, gainers, losers) => {
      store.set('mostactive', mostActive.data);
      store.set('gainers', gainers.data);
      store.set('losers', losers.data);
    }))
    .catch((error) => {
      console.log(error);
    })
    .then(() => {
      this.mostActiveSymbols = this.getMostActiveSymbols();
      new StockList('#mostactive-container', 'mostactive', 'Most Active');
      new StockList('#gainers-container', 'gainers', 'Gainers');
      new StockList('#losers-container', 'losers', 'Losers');
      this.renderGraphCards();
      this.news = new News('#home-news', this.mostActiveSymbols, 'home-news', 1);
    });
  }

  // DESTROY PAGE
  destroyPage() {
    if (this.$canvas) {
      this.$canvas.empty();
    }
  }
}

export default HomePage;