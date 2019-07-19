import $ from 'jquery';
import _ from 'lodash';
import store from 'store2';
import axios from 'axios';
import StockPopup from './stock-popup.js';
import GraphCard from './graph-card.js';
import News from './news.js';

class Stocks {
  constructor(container) {
    this.$container = container;
    this.graph;
    this.popup;
    this.watchlist = store.get('watchlist') || [];
    this.render();
    this.$stocksContainer = $('#most-active-container');
    this.$loadingIcon = this.$stocksContainer.find('.icon-loading');
    this.$stockListContainer = $('.stock-list');

    this.getStocks();
    this.displayPopup();
    this.mostActiveSymbols;
    this.news;
  }


  // RENDER SMALL GRAPH CARDS
  renderGraphCards() {
    const mostActiveSymbols = store.get('mostActive');

    mostActiveSymbols.slice(0, 3).map((stock, index) => {
      const symbol = stock.symbol;
      new GraphCard(`#home-graphCard${index}`, symbol, );
    });
  }


  // RETRIEVE SYMBOLS FOR MOST ACTIVE STOCKS
  getMostActiveSymbols() {
    const symbols = store.get('mostActive');

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
          <div id="most-active-container" class="box margin-right">
            <h2 class="text-header">Most Active</h2>
            <div class="icon-loading">
              <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
            </div>
            <ol id="most-active" class="stock-list">
              <li class="stock-list-header-row">
                <div>Company</div>
                <div>Last Price</div>
                <div>Change</div>
                <div>% Change</div>
                <div>Watch</div>
              </li>
            </ol>
          </div>
          <div id="home-news" class="box">
            <h2 class="text-header">Latest News</h2>
          </div>
        </div>
        <div class="home-row">
          <div id="gainers-container" class="box margin-right">
            <h2 class="text-header">Gainers</h2>
            <ol id="gainers" class="stock-list">
              <li class="stock-list-header-row">
                <div>Company</div>
                <div>Last Price</div>
                <div>Change</div>
                <div>% Change</div>
                <div>Watch</div>
              </li>
            </ol>
          </div>
          <div id="losers-container" class="box">
            <h2 class="text-header">Losers</h2>
            <ol id="losers" class="stock-list">
              <li class="stock-list-header-row">
                <div>Company</div>
                <div>Last Price</div>
                <div>Change</div>
                <div>% Change</div>
                <div>Watch</div>
              </li>
            </ol>
          </div>
        </div>
      `;
    this.$container.append(html);
  }


  // CHECK IF WATCHLIST HAS STOCK. RETURNS A BOOLEAN.
  isInWatchlist(symbol) {
    return this.watchlist.some(stock => stock.symbol === symbol);
  }


  // RETRIEVE STOCKS FROM EITHER API OR STORE
  getStocks() {
    const mostActive = store.get('mostActive') || [];
    const gainers = store.get('gainers') || [];
    const losers = store.get('losers') || [];

    // check if local storage exist
    if (mostActive.length && gainers.length && losers.length) {
      this.mostActiveSymbols = this.getMostActiveSymbols();
      this.renderStocks('#most-active', 'mostActive');
      this.renderStocks('#gainers', 'gainers');
      this.renderStocks('#losers', 'losers');
      this.renderGraphCards();
      this.news = new News('#home-news', this.mostActiveSymbols, 'homeNews', 1);
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
      axios.get(`https://cloud.iexapis.com/v1/stock/market/collection/list?collectionName=gainers&token=pk_a12f90684f2a44f180bcaeb4eff4086d`),
      axios.get(`https://cloud.iexapis.com/v1/stock/market/collection/list?collectionName=losers&token=pk_a12f90684f2a44f180bcaeb4eff4086d`)
    ])
    .then(axios.spread((mostActive, gainers, losers) => {
      store.set('mostActive', mostActive.data);
      store.set('gainers', gainers.data);
      store.set('losers', losers.data);
    }))
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      this.mostActiveSymbols = this.getMostActiveSymbols();
      this.$loadingIcon.removeClass('is-visible');
      this.renderStocks('#most-active', 'mostActive');
      this.renderStocks('#gainers', 'gainers');
      this.renderStocks('#losers', 'losers');
      this.renderGraphCards();
      this.news = new News('#home-news', this.mostActiveSymbols, 'homeNews', 1);
    });
  }


  // RENDER MOST ACTIVE
  renderStocks(container, listType) {
    const stocks = store.get(listType);

    // render html list for stocks
    const list =  stocks.slice(0, 5).map((stock) => {
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
    
    $(container).append(list);
    this.activateWatchlistIcon(container);
  }


  // CREATE & DISPLAY NEW POPUP MODAL WHEN A STOCK IS CLICKED
  displayPopup() {
    const that = this;

    this.$stockListContainer.on('click', '.clickable-stock-name', function(event) {
      event.preventDefault();

      let companyId = $(this).closest('li')[0].id;
      let companyName = $(this).find('span.stock-name')[0].innerText;

      // create new popup
      that.popup = new StockPopup(companyId, companyName);
    });
  }


  // ACTIVATE ICON FOR WATCHLIST ADD/REMOVE
  activateWatchlistIcon(containerId) {
    const that = this;

    $(containerId).on('click', '.icon-watchlist', function(event) {
      const $this = $(this);
      event.stopPropagation();

      // find hollow star icon
      const $icon = $this.find('i');

      // get stock id and stock name from sibling elements
      const stockSymbol = $this.closest('li').find('.stock-code')[0].innerText;
      const stockName = $this.closest('li').find('.stock-name')[0].innerText;
      // console.log(stockSymbol, stockName);
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