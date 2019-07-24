import $ from 'jquery';
import store from 'store2';
import axios from 'axios';

class StocksList {
  constructor(containerId, collectionName, title) {
    this.$container = $(containerId);
    this.collectionName = collectionName;
    this.title = title;
    this.watchlist = store.get('watchlist') || [];
    this.renderHeaderHtml();
    this.renderAllData();
  }


  renderHeaderHtml() {
    const html = `
      <h2 class="text-header">${this.title}</h2>
      <div class="icon-loading">
        <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
      </div>
      <ol id="${this.collectionName}" class="stock-list">
        <li class="stock-list-header-row">
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
      this.renderStocksList();
    } else {
      this.fetchStocks();
    }
  }


  fetchStocks() {
    this.$loadingIcon.addClass('is-visible');

    axios.get(`${URL_BASE}/market/collection/list?collectionName=${this.collectionName}&token=${API_TOKEN}`)
    .then((response) => {
      console.log(response);
      store.set(this.collectionName, response.data);
    })
    .catch(error => console.log(error))
    .finally(() => {
      this.$loadingIcon.removeClass('is-visible');
      this.renderStocksList();
    })
  }


  // CHECK IF WATCHLIST HAS STOCK. RETURNS A BOOLEAN.
  isInWatchlist(symbol) {
    return this.watchlist.some(stock => stock.symbol === symbol);
  }


  renderStocksList() {
    const stocks = store.get(this.collectionName);

    const stocksList = stocks.map((stock) => {
      let { symbol, companyName, latestPrice, change, changePercent } = stock;
      let iconClass;
      let isNegative;
      let plusMinusSign;
      let isSelected = '';

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

      // if stock exist in watchlist array, dispay solid icon with gold color
      if (this.isInWatchlist(symbol)) {
        iconClass = 'fas';
        isSelected = 'is-selected';
      }
      // if stock doesn't exist, display line icon with gray color
      else {
        iconClass = 'far';
      }

      return `
        <li id="${symbol}">
          <div class="clickable-stock-name">
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
          <div>
            <span class="icon-watchlist ${isSelected}"><i class="${iconClass} fa-star"></i></span>
          </div>
        </li>
      `;
    });

    $(this.collectionName).append(stocksList);
  }  
}

export default StocksList;