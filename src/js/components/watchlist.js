import $ from 'jquery';
import store from 'store2';
import axios from 'axios';
import KeyStats from './keystats.js';
import { calcLocalStorageAge, trimString } from '../../utility/utility.js';
import { URL_BASE, API_TOKEN } from '../../const';

class Watchlist {
  constructor(canvasId) {
    this.$canvas = $(canvasId);
    this.keyStats;
    this.watchlist = store.get('watchlist') || [];

    this.renderCanvasHtml();


    // If Watchlist has stocks...
    if (this.watchlist.length > 0) {
      this.getStockData();
      
    } else {
      this.renderEmptyWatchlistCanvas();
    }

    // if (this.watchlist.length > 0) {
    //   this.displayStocks();
    // }

    this.$watchlistContainer;
  }


  // RENDER WATCHLIST CANVAS
  renderCanvasHtml() {
    let html = `
      <div class="watchlistContainer">
        <h2 class="watchlist-title">Watchlist</h2>
        <ul class="watchlistList"></ul>
      </div>
    `;

    this.$canvas.empty();
    this.$canvas.append(html);
    this.$watchlistContainer = $('.watchlistList');
  }


  // RENDER CANVAS WITH NO WATCHLIST
  renderEmptyWatchlistCanvas() {
    let html = `
      <div id="watchlist-empty">
        <div class="watchlist-empty-content">
          <img src="https://raw.githubusercontent.com/thaitwo/charts/master/public/images/watchlist-icon.png" />
          <h3>Your Watchlist will appear here</h3>
          <p>Add stocks to your Watchlist by clicking the <span class="icon-watchlist"><i class="far fa-star"></i></span> symbol.</p>
        </div>
      </div>
    `;

    this.$canvas.empty();
    this.$canvas.append(html);
  }


  getStockData() {
    // console.log(this.watchlist);
    this.watchlist.map((company) => {
      const companyData = store.get(company.symbol);

      if (companyData) {
        // console.log(company.symbol, companyData);
        this.displayStocks();
      } else {
        // console.log(false);
        axios.get(`${URL_BASE}/${company.symbol}/quote?token=${API_TOKEN}`)
          .then((res) => {
            store.set(company.symbol, res.data);            
          })
          .catch(error => console.log(error.res.data.error))
          .then(() => {
            this.displayStocks();
          })
      }
      // console.log(company)
    })
    
  }


  // GET DATA FOR COMPANY
  fetchStockData() {
    this.currentInterval = store.get('current-interval');

    axios.get(`${URL_BASE}/${this.symbol}/batch?types=quote,news,chart&last=5&range=${this.currentInterval}&token=${API_TOKEN}`)
    .then((response) => {
      const chart = response.data.chart;
      const news = response.data.news;
      const quote = response.data.quote;

      // If stored data exists
      if (store.get(this.symbol) !== null) {
        const storedData = store.get(this.symbol);

        /* If data for selected interval does not exist in localStorage
        then add data for selected interval into localStorage
        case: the current selected interval is 6M for stock1
        when we click on stock2, we need to check if data for 6M for
        stock2 exists in localStorage */
        if (!(this.currentInterval in storedData.chart)) {
          storedData.chart[this.currentInterval] = chart.data;
          store.set(this.symbol, storedData);
        }
      }
      // Otherwise create data object and store in localStorage
      else {
        const dataToStore = {
          chart: {
            [this.currentInterval]: chart, // this.currentInterval will be set to the selected interval
          },
          news: news,
          quote: quote,
          time: Date.now()
        }

        store.set(this.symbol, dataToStore);

        /* This prevents an infinite loop of requests in case the requests fail.
        The infinite loop would be caused in renderAllData().
        */
        if (response.status == 200) {
          this.renderAllData();
        }
      }
    })
    .catch(error => console.log(error.response.data.error))
  }


  // POPULATE WATCHLIST CONTAINER WITH STOCKS
  displayStocks() {
    const stocks = this.watchlist.map((stock, index) => {
      const symbol = stock.symbol;
      const stockData = store.get(symbol);
      console.log('stockdata', stockData);
      const companyName = trimString(stockData.companyName, 40);
      const price = stockData.delayedPrice;
      const change = stockData.change;
      const changePercent = stockData.changePercent;

      let isActive = '';

      // Set 'active' class to watchlist item with index that matches selectedStockIndex
      if (index === this.currentWatchIndex) {
        isActive = 'active';
      }

      return `
        <li class="${isActive}">
          <button id="${symbol}">
            <div class="topRow">
              <span class="watchlist-item-symbol">${symbol}</span>
              <span>${price}</span>
              <span class="green">${change}</span>
              <span class="green">${changePercent}</span>
            </div>
            <p class="watchlist-item-name">${companyName}</p>
          </button>
        </li>
      `;
    });

    this.$watchlistContainer.empty();
    this.$watchlistContainer.append(stocks);
    // this.renderAllData();
  }
}

export default Watchlist;