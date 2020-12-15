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
      console.log("TRRRRUUUEE");
      
    } else {
      this.renderEmptyWatchlistCanvas();
    }

    if (this.watchlist.length > 0) {
      this.displayStocks();
    }

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


  // POPULATE WATCHLIST CONTAINER WITH STOCKS
  displayStocks() {
    const stocks = this.watchlist.map((stock, index) => {
      const symbol = stock.symbol;
      const companyName = trimString(stock.name, 40);
      let isActive = '';

      // Set 'active' class to watchlist item with index that matches selectedStockIndex
      if (index === this.currentWatchIndex) {
        isActive = 'active';
      }

      return `
        <li class="${isActive}">
          <button id="${symbol}">
            <p class="watchlist-item-symbol">${symbol}</p>
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