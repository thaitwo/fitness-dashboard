import $ from 'jquery';
import store from 'store2';
import axios from 'axios';
import { formatLargeNumber, formatNumberWithCommas, trimString } from '../helpers/helpers.js';
import Graph from './graph.js';

// update watchlist button logic to show only after data had been loaded
// fixed bug that hid exit icon after initial popup display
  // issue: referenced icon element before registering it

class StockPopup {
  constructor(companySymbol, companyName) {
    this.symbol = companySymbol;
    this.companyName = companyName;
    this.$mainContainer = $('.main-container');
    this.graph;
    // RETRIEVE WATCHLIST FROM ARRAY STORAGE
    this.watchlist = store.get('watchlist') || [];

    this.render();

    // REGISTER POPUP ELEMENTS
    this.$popupContainer = $('.popup-modal');
    this.$popupContentContainer = this.$popupContainer.find('.popup-stock-container');
    this.$chartContainer = this.$popupContainer.find('#popup-chart');
    this.$latestPriceContainer = this.$popupContainer.find('#popup-latest-price');
    this.$changePercentContainer = this.$popupContainer.find('#popup-change-percent');
    this.$stockName = this.$popupContainer.find('#popup-stock-name');
    this.$tbody = this.$popupContainer.find('table tbody');
    this.$exitIcon = this.$popupContainer.find('.exit-icon');
    this.$loadingIcon = this.$popupContainer.find('.icon-loading');
    this.$watchlistButton = this.$popupContainer.find('#popup-button-watchlist');


    this.getStockData();
    this.activateEventListeners();
  }


  // CHECK IF WATCHLIST HAS THIS STOCK
  isInWatchlist(symbol) {
    return this.watchlist.some(stock => stock.symbol === symbol);
  }


  // RENDER HTML FOR POPUP MODAL
  render() {
    const popupModal = `
      <div class="popup-modal">
        <div class="popup-stock-container">
          <div id="popup-header">
            <h2 id="popup-stock-name"></h2>
            <button id="popup-button-watchlist" class="button button-popup-watchlist">
              <i class="far fa-eye"></i>
              <span>Watch</span>
            </button>
          </div>
          <div id="popup-data-container">
            <div id="popup-summary-container">
              <div id="popup-price-container">
                <h2 id="popup-latest-price"></h2>
                <h3 id="popup-change-percent"></h3>
              </div>
              <table id="popup-summary-table">
                <tbody>
                </tbody>
              </table>
            </div>
            <div class="popup-chart-container">
              <div class="icon-loading">
                <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
              </div>
              <canvas id="popup-chart" width="660" height="400"></canvas>
            </div>
          </div>
          <div class="exit-icon"><i class="fas fa-times"></i></div>
        </div>
      </div>
    `;
    this.$mainContainer.prepend(popupModal);
  }


  // REMOVE EVENT LISTENERS & DESTROY POPUP HTML
  destroy() {
    this.$popupContainer.off();
    this.$popupContentContainer.off();
    this.graph.destroy();
    this.$popupContainer.remove();
  }


  // ACTIVATE EVENT LISTENERS
  activateEventListeners() {
    const that = this;
    const isInWatchlist = this.isInWatchlist(this.symbol);
    // update watchlist button state
    this.toggleButtonState(isInWatchlist);

    // Add/remove stock from watchlist
    this.$popupContentContainer.on('click', '#popup-button-watchlist', function(event) {
      event.preventDefault();

      const $this = $(this);
      const $starIconContainer = $(`#stocks-list button#${that.symbol} .icon-add-watchlist`);
      const $starIcon = $(`#stocks-list button#${that.symbol} i`);

      // if stock is not in watchlist, then add to watchlist
      if (!that.isInWatchlist(that.symbol)) {
        that.watchlist.push({
          symbol: that.symbol,
          name: that.companyName
        });
        store.set('watchlist', that.watchlist);

        // update watchlist button to REMOVE
        $this.addClass('isWatched');
        $this.html('<i class="fas fa-eye-slash"></i>Unwatch');

        $starIcon.removeClass('far').addClass('fas');
        $starIconContainer.toggleClass('is-selected');
      }
      // if stock exist, then remove it from watchlist
      else {
        // remove stock from watchlist array
        let index = that.watchlist.findIndex(stock => stock.symbol === that.symbol);
        if (index != -1) {
          that.watchlist.splice(index, 1);
        }

        // store upated watchlist array
        store.set('watchlist', that.watchlist);

        // update watchlist button to ADD
        $this.removeClass('isWatched');
        $this.html('<i class="far fa-eye"></i>Watch');
        $starIconContainer.toggleClass('is-selected');
        $starIcon.removeClass('fas').addClass('far');
      }
    });

    // Disable closing of viewer upon click on popup container
    this.$popupContentContainer.on('click', function(event) {
      event.stopPropagation();
    });

    // Remove popup modal on click of exit icon
    this.$exitIcon.on('click', function(event) {
      event.stopPropagation();
      that.destroy();
    });

    // Remove popup modal on click outside of modal
    this.$popupContainer.on('click', function() {
      that.destroy();
    });
  }


  // UPDATE WATCHLIST BUTTON STATE - TRUE: STOCK IN WATCHLIST, FALSE: STOCK NOT IN WATCHLIST
  toggleButtonState(boolean) {
    // if stock exist in watchlist, display 'remove from watchlist' button
    if (boolean === true) {
      this.$watchlistButton.addClass('isWatched');
      this.$watchlistButton.html('<i class="fas fa-eye-slash"></i>Unwatch');
    }
    // if stock doesn't exist in watchlist, display 'add to watchlist' button
    else {
      this.$watchlistButton.removeClass('isWatched');
      this.$watchlistButton.html('<i class="far fa-eye"></i>Watch');
    }

    // if stock exist in local storage, show 'watchlist add/remove' button
    // this is bc we initially want to hide this button when loading a new popup (data not stored in local storage)
    // if (store.has(this.symbol)) {
    //   this.$watchlistButton.removeClass('is-hidden');
    // }
  }


  // RENDER STOCK CONTENT FOR POPUP
  getStockData() {

    // check if there's locally stored data before making Ajax request
    if (store.get(`${this.symbol}`)) {
      this.renderStockInfo();
      this.renderGraph();
      this.$exitIcon.removeClass('is-hidden');
    }
    else {
      this.fetchStockData();
      this.$exitIcon.removeClass('is-hidden');
    }
  }


  // FETCH STOCK DATA
  fetchStockData() {
    // display loading icon
    this.$loadingIcon.addClass('is-visible');
    // request stock data
    axios.all([
      axios.get(`https://cloud.iexapis.com/v1/stock/${this.symbol}/chart/1m?token=pk_a12f90684f2a44f180bcaeb4eff4086d`),
      axios.get(`https://cloud.iexapis.com/v1/stock/${this.symbol}/quote?token=pk_a12f90684f2a44f180bcaeb4eff4086d`),
      axios.get(`https://cloud.iexapis.com/v1/stock/${this.symbol}/news/last/4?token=pk_a12f90684f2a44f180bcaeb4eff4086d`)
    ])
    .then(axios.spread((historicalPrices, quote, news) => {
      // store company data
      const dataToStore = {
        historicalPrices: {
          '1m': historicalPrices.data, // this.interval will be set to the selected interval
        },
        news: news.data,
        quote: quote.data
      }
      store.set(`${this.symbol}`, dataToStore);
    }))
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      this.renderStockInfo();
      this.renderGraph();
      this.$loadingIcon.removeClass('is-visible');
      // show watchlist add/remove button
      this.showButton(this.$watchlistButton);
      // display exit icon
      this.showButton(this.$exitIcon);
    });
  }


  // RENDER TABLE WITH STOCK INFO
  renderStockInfo() {
    const stockData = store.get(`${this.symbol}`);

    // get stock info from local storage
    const latestPrice = stockData.quote.latestPrice;
    let changePercent = (stockData.quote.changePercent * 100).toFixed(2);
    const closePrice = stockData.quote.close;
    const openPrice = stockData.quote.open;
    const low = stockData.quote.low;
    const high = stockData.quote.high
    const wk52High = stockData.quote.week52High;
    const wk52Low = stockData.quote.week52Low;
    const volume = formatNumberWithCommas(Math.round(stockData.quote.latestVolume));
    const peRatio = stockData.quote.peRatio;
    const marketCap = formatLargeNumber(stockData.quote.marketCap);
    const plusOrMinus = (changePercent > 0) ? '+' : '';

    // render stock name
    this.$stockName.text(`${this.companyName} (${this.symbol})`);
    this.$latestPriceContainer.text(latestPrice);
    this.$changePercentContainer.text(`${plusOrMinus}${changePercent}%`);


    let row = `
      <tr>
        <td class="key">Close</td>
        <td class="val">${closePrice}</td>
      </tr>
      <tr>
        <td class="key">Open</td>
        <td class="val">${openPrice}</td>
      </tr>
      <tr>
        <td class="key">High</td>
        <td class="val">${high}</td>
      </tr>
      <tr>
        <td class="key">Low</td>
        <td class="val">${low}</td>
      </tr>
      <tr>
        <td class="key">Market Cap</td>
        <td class="val">${marketCap}</td>
      </tr>
      <tr>
        <td class="key">P/E Ratio</td>
        <td class="val">${peRatio}</td>
      </tr>
      <tr>
        <td class="key">52 Wk Range</td>
        <td class="val">${wk52Low} - ${wk52High}</td>
      </tr>
      <tr>
        <td class="key">Volume</td>
        <td class="val">${volume}</td>
      </tr>
    `;
    this.$tbody.append(row);
  }


  // RENDER GRAPH
  renderGraph() {
    const stockData = store.get(`${this.symbol}`).historicalPrices['1m'];

    // get opening prices for company stock
    let priceData = this.getHistoricalData(stockData, 'close');

    // get dates for the opening prices
    let dateLabels = this.getHistoricalData(stockData, 'date');

    // create new graph for this company stock
    this.graph = new Graph(this.$chartContainer, priceData, dateLabels);
  }


  // GET SPECIFIC DATA ARRAY OF COMPANY (STOCK OPEN PRICES, DATES, ETC.)
  getHistoricalData(data, key) {
    // console.log(data);
    return data.map((day) => {
      if (key === 'date') {
        return day[key].split('-')[2];
      } else {
        return day[key];
      }
    });
  }


  // SHOW WATCHLIST ADD/REMOVE BUTTON
  showButton(buttonElement) {
    buttonElement.removeClass('is-hidden');
  }
}

export default StockPopup;