import $ from 'jquery';
import store from 'store2';
import axios from 'axios';
import WatchButton from './watch-button';
import StockPopup from './stock-popup';
import { trimString } from '../utility/utility.js';

class StockList {
  constructor(containerId, collectionName, title) {
    this.$container = $(containerId);
    this.collectionName = collectionName;
    this.title = title;
    this.watchlist = store.get('watchlist') || [];
    this.renderHeaderHtml();
    this.$listContainer = $(`#${collectionName}`);
    this.renderAllData();
    this.displayPopup();
  }


  renderHeaderHtml() {
    const html = `
      <h2 class="text-header">${this.title}</h2>
      <div class="icon-loading">
        <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
      </div>
      <ol id="${this.collectionName}" class="stocklist">
        <li class="stock-list-header-row stocklist-item">
          <div>Company</div>
          <div>Last Price</div>
          <div>Change</div>
          <div>% Change</div>
          <div>Watch</div>
        </li>
      </ol>
    `;

    this.$container.empty();
    this.$container.append(html);
  }


  renderAllData() {
    if (store.get(this.collectionName) !== null) {
      this.renderStockList();
    } else {
      this.fetchStocks();
    }
  }


  // FETCH API DATA
  fetchStocks() {
    axios.get(`${URL_BASE}/market/collection/list?collectionName=${this.collectionName}&token=${API_TOKEN}`)
    .then((response) => {
      console.log(response);
      store.set(this.collectionName, response.data);
    })
    .catch(error => console.log(error))
    .then(() => {
      this.renderStockList();
    })
  }


  // CHECK IF WATCHLIST HAS STOCK. RETURNS A BOOLEAN.
  isInWatchlist(symbol) {
    return this.watchlist.some(stock => stock.symbol === symbol);
  }


  renderStockList() {
    const stocks = store.get(this.collectionName);

    const stocksList = stocks.slice(0,5).map((stock) => {
      let { symbol, companyName, latestPrice, change, changePercent } = stock;
      let isNegative, plusMinusSign;
      companyName = trimString(companyName, 32);

      if (change < 0) {
        isNegative = 'is-negative';
        plusMinusSign = '-';
      } else if (change == 0) {
        plusMinusSign = '';
      } else {
        plusMinusSign = '+';
      }

      change = Math.abs(change);
      changePercent = Math.abs((changePercent * 100).toFixed(2));

      return `
        <li id="${symbol}-${this.collectionName}" class="stocklist-item">
          <div>
            <span class="stock-code">${symbol}</span>
            <span class="stock-name">${companyName}</span>
          </div>
          <div>
            <p>${latestPrice}</p>
          </div>
          <div class="most-active-change ${isNegative}">
            <p>${plusMinusSign} ${change}</p>
          </div>
          <div class="most-active-change-percent ${isNegative}">
            <p>${plusMinusSign} ${changePercent}<span>%</span></p>
          </div>
          <div id="${this.collectionName}-${symbol}-watchbutton" class="stocklist-watchbutton"></div>
        </li>
      `;
    });

    $(`#${this.collectionName}`).append(stocksList);
    this.activateWatchButtons();
  }


  activateWatchButtons() {
    const stocks = store.get(this.collectionName);

    stocks.slice(0,5).map((stock) => {
      const { symbol, companyName } = stock;
      new WatchButton(`#${this.collectionName}-${symbol}-watchbutton`, symbol, companyName);
    });
  }


  displayPopup() {
    this.$listContainer.on('click', 'li.stocklist-item', function(event) {
      event.preventDefault();
      const symbol = $(this).find('.stock-code')[0].innerText;
      const name = $(this).find('.stock-name')[0].innerText;
      new StockPopup(symbol, name);
    })
  }
}

export default StockList;