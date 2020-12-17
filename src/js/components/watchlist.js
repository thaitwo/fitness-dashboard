import $ from 'jquery';
import store from 'store2';
import axios from 'axios';
import KeyStats from './keystats.js';
import { calcLocalStorageAge, trimString } from '../../utility/utility.js';
import { URL_BASE, API_TOKEN } from '../../const';
import AddStockButton from './addStockButton.js';

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
      <div id="watchlistContainer" class="watchlistContainer">
        <div class="headerWrapper">
          <a class="headerLinkWrapper" href="/#watchlist">
            <h2 class="watchlist-title">Watchlist</h2>
            <i data-feather="chevron-right" class="featherIcon--small"></i>
          </a>
          <div id="addStockContainer"></div>
        </div>
        <div class="watchlistListHeader">
          <div>Symbol</div>
          <div>Price</div>
          <div>Change</div>
          <div>% Change</div>
        </div>
        <ul class="watchlistList"></ul>
      </div>
    `;
    // this.$addStockContainer = $('#addStockContainer');

    this.$canvas.empty();
    this.$canvas.append(html);
    this.$watchlistContainer = $('.watchlistList');
    new AddStockButton('#addStockContainer');
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

      // If data for the stock already exists in DataStore, then use the stored data
      if (companyData) {
        // console.log(company.symbol, companyData);
        // this.displayStocks();
      } 
      // Else, data for this stock is not stored, then make an API call to fetch data
      else {
        // console.log(false);
        axios.get(`${URL_BASE}/${company.symbol}/quote?token=${API_TOKEN}`)
          .then((res) => {
            store.set(company.symbol, res.data);            
          })
          .catch(error => console.log(error.res.data.error))
          .then(() => {
            console.log('CALLed');
            this.displayStocks();
          })
      }
      
      // console.log(company)
    });

    this.displayStocks();
    
  }


  // POPULATE WATCHLIST CONTAINER WITH STOCKS
  displayStocks() {
    this.$watchlistContainer.empty();

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

    this.$watchlistContainer.append(stocks);
    // this.renderAllData();
  }
}

export default Watchlist;