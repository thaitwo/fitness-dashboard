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
    this.$stocksContainer = $('.stocks-container');
    this.$loadingIcon = this.$stocksContainer.find('.icon-loading');
    this.$stockListContainer = this.$stocksContainer.find('#stocks-list');
    this.count = 1;

    this.getStocks();

    this.displayPopup();
    // this.activateScroll();
  }


  // RENDER HTML
  render() {
    let html =
      `
        <div class="stocks-container">
          <h3>Technology Stocks</h3>
          <div class="icon-loading">
            <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
          </div>
          <ol id="stocks-list" class="stocks-list"></ol>
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
    const stocks = store.get(`stocks${this.count}`) || [];

    // check if local storage exist
    if (stocks.length) {
      this.renderStocks(this.count);
    }
    else {
      this.fetchStocks(this.count);
    }
  }


  // GET LIST OF COMPANIES
  fetchStocks(num) {
    // display loading icon
    this.$loadingIcon.addClass('is-visible');

    axios({
      method: 'get',
      url: 'https://cloud.iexapis.com/v1/stock/market/collection/sector',
      responseType: 'json',
      params: {
        collectionName: 'Technology',
        token: 'pk_a12f90684f2a44f180bcaeb4eff4086d',
      }
    })
    .then((response) => {
      const stocks = response.data;
      // store list of stocks
      store.set(`stocks${num}`, stocks);
      this.renderStocks(num);
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      this.$loadingIcon.removeClass('is-visible');
    });
  }


  // RENDER LIST OF COMPANIES
  renderStocks(num) {
    const stocks = store.get(`stocks${num}`);
    // console.log('stocks', stocks);

    // render html list for 100 stocks
    const list =  stocks.slice(0, 375).map((stock) => {
      const { symbol, companyName } = stock;
      const name = companyName;
      let iconClass;

      // if stock exist in watchlist array, dispay solid icon with gold color
      if (this.isInWatchlist(symbol)) {
        iconClass = 'fas';

        return `
          <li>
            <button id="${symbol}">
              <span class="stock-code">${symbol}</span>
              <span class="stock-name">${name}</span>
              <span class="icon-add-watchlist is-selected"><i class="${iconClass} fa-star"></i></span>
            </button>
          </li>
        `;
      }
      // if stock doesn't exist, display line icon with gray color
      else {
        iconClass = 'far';

        return `
          <li>
            <button id="${symbol}">
              <span class="stock-code">${symbol}</span>
              <span class="stock-name">${name}</span>
              <span class="icon-add-watchlist"><i class="${iconClass} fa-star"></i></span>
            </button>
          </li>
        `;
      }
    });
    this.$stockListContainer.append(list);
    this.activateWatchlistIcon();
  }


  // CREATE & DISPLAY NEW POPUP MODAL WHEN A STOCK IS CLICKED
  displayPopup() {
    const that = this;

    this.$stockListContainer.on('click', 'button', function(event) {
      event.preventDefault();

      let companyId = this.id;
      let companyName = $(this).find('span.stock-name')[0].innerText;

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
          this.renderStocks(this.count);
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

      // find hollow star icon and make solid star by replacing value of atribute data-prefix
      const $icon = $this.find('i');

      // get stock id and stock name from sibling elements
      const stockSymbol = $this.siblings('.stock-code')[0].innerText;
      const stockName = $this.siblings('.stock-name')[0].innerText;
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