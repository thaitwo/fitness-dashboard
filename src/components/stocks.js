import $ from 'jquery';
import _ from 'lodash';
import store from 'store2';
import axios from 'axios';
import StockPopup from './stock-popup.js';

class Stocks {
  constructor(container) {
    this.$container = container;
    this.graph;
    this.popup;
    this.watchlist = store.get('watchlist') || [];
    this.render();
    this.$stocksContainer = $('#most-active-container');
    this.$loadingIcon = this.$stocksContainer.find('.icon-loading');
    this.$stockListContainer = this.$stocksContainer.find('#most-active');

    this.getStocks();
    this.displayPopup();
  }


  // RENDER HTML
  render() {
    let html =
      `
        <div id="home-row-second">
          <div id="most-active-container" class="box margin-right">
            <h2 class="text-header">Most Active</h2>
            <div class="icon-loading">
              <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
            </div>
            <ol id="most-active" class="most-active">
              <li id="most-active-header-row">
                <div>Company</div>
                <div>Last Price</div>
                <div>Change</div>
                <div>% Change</div>
                <div></div>
              </li>
            </ol>
          </div>
          <div id="top-gainers-container" class="box">
            <h2 class="text-header">Top Gainers</h2>
            <ol id="top-gainers" class="most-active">
              <li id="top-gainers-header-row">
                <div>Company</div>
                <div>Last Price</div>
                <div>Change</div>
                <div>% Change</div>
                <div></div>
              </li>
            </ol>
          </div>
        </div>
      `;
    this.$container.append(html);
  }


  // Check If Watchlist Has Stock. RETURNS BOOLEAN
  isInWatchlist(symbol) {
    return this.watchlist.some(stock => stock.symbol === symbol);
  }


  // RETRIEVE STOCKS FROM EITHER API OR STORE
  getStocks() {
    const mostActive = store.get('mostActive') || [];
    const topGainers = store.get('topGainers') || [];

    // check if local storage exist
    if (mostActive.length && topGainers.length) {
      this.renderStocks('#most-active', 'mostActive');
      this.renderStocks('#top-gainers', 'topGainers');
    }
    else {
      this.fetchStocks();
    }
  }


  // GET LIST OF COMPANIES
  fetchStocks() {
    // display loading icon
    this.$loadingIcon.addClass('is-visible');

    axios.all([
      axios.get(`https://cloud.iexapis.com/v1/stock/market/collection/list?collectionName=mostactive&token=pk_a12f90684f2a44f180bcaeb4eff4086d`),
      axios.get(`https://cloud.iexapis.com/v1/stock/market/collection/list?collectionName=gainers&token=pk_a12f90684f2a44f180bcaeb4eff4086d`)
    ])
    .then(axios.spread((mostActive, gainers) => {
      store.set('mostActive', mostActive.data);
      store.set('topGainers', gainers.data);
      this.renderStocks('#most-active', 'mostActive');
      this.renderStocks('#top-gainers', 'topGainers');
    }))
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      this.$loadingIcon.removeClass('is-visible');
    });
  }


  // RENDER MOST ACTIVE
  renderStocks(container, listType) {
    const stocks = store.get(listType);

    // render html list for 100 stocks
    const list =  stocks.map((stock) => {
      let { symbol, companyName, latestPrice, change, changePercent } = stock;
      changePercent = (changePercent * 100).toFixed(2);
      let iconClass;
      let isNegative;
      let isSelected = '';

      if (change < 0) {
        isNegative = 'is-negative';
      }

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
          <div class="most-active-stock-name">
            <span class="stock-code">${symbol}</span>
            <span class="stock-name">${companyName}</span>
          </div>
          <div>
            <p>${latestPrice}</p>
          </div>
          <div class="most-active-change ${isNegative}">
            <p>${change}</p>
          </div>
          <div class="most-active-change-percent ${isNegative}">
            <p>${changePercent}%</p>
          </div>
          <div>
            <span class="icon-add-watchlist ${isSelected}"><i class="${iconClass} fa-star"></i></span>
          </div>
        </li>
      `;
    });
    $(container).append(list);
    this.activateWatchlistIcon();
  }


  // CREATE & DISPLAY NEW POPUP MODAL WHEN A STOCK IS CLICKED
  displayPopup() {
    const that = this;

    this.$stockListContainer.on('click', '.most-active-stock-name', function(event) {
      event.preventDefault();

      let companyId = $(this).closest('li')[0].id;
      let companyName = $(this).find('span.stock-name')[0].innerText;
      console.log(companyId, companyName);

      // create new popup
      that.popup = new StockPopup(companyId, companyName);
    });
  }


  // LOAD MORE STOCK ON SCROLL
  activateScroll() {
    this.$stocksContainer.on('scroll', _.debounce(() => {
      if (this.$stocksContainer.scrollTop() + this.$stocksContainer.innerHeight() >= this.$stockListContainer.height()) {
        this.count++;
        if (store.get(`stocks${this.count}`)) {
          // this.renderStocks(this.count);
        }
        else {
          this.fetchStocks(this.count);
        }
      }
    }, 500));
  }


  // ACTIVATE ICON FOR WATCHLIST ADD/REMOVE
  activateWatchlistIcon() {
    const that = this;

    this.$stockListContainer.on('click', '.icon-add-watchlist', function(event) {
      const $this = $(this);
      event.stopPropagation();

      // find hollow star icon
      const $icon = $this.find('i');

      // get stock id and stock name from sibling elements
      const stockSymbol = $this.closest('li').find('.stock-code')[0].innerText;
      const stockName = $this.closest('li').find('.stock-name')[0].innerText;
      // retrieve watchlist:
      // not doing this causes a bug where after you click watch/unwatch and close popup,
      // the star icon will not work on the first click attempt for the stock 
      that.watchlist = store.get('watchlist') || [];

      const isInWatchlist = that.isInWatchlist(stockSymbol);
      // if stock is not in watchlist array
      if (!isInWatchlist) {
        that.watchlist.push({
          symbol: stockSymbol,
          name: stockName
        });
        // update watchlist array
        store.set('watchlist', that.watchlist);
        // set icon to solid icon
        $icon.removeClass('far');
        $icon.addClass('fas');
        // set icon color to gold
        $this.addClass('is-selected');
      }
      // if stock exist, then remove it from watchlist
      else {
        // get index of stock in the watchlist array
        let index = that.watchlist.findIndex(stock => stock.symbol === stockSymbol);
        // if index exist (meaning that stock exists in watchlist), remove the stock
        if (index != -1) {
          that.watchlist.splice(index, 1);
        }
        // update watchlist array
        store.set('watchlist', that.watchlist);
        // set icon to line icon
        $icon.removeClass('fas');
        $icon.addClass('far');
        // set icon color to gray
        $this.removeClass('is-selected');
      }
    });
  }


  destroy() {
    if (this.$stocksContainer) {
      this.$container.empty();
    }
  }
}

export default Stocks;