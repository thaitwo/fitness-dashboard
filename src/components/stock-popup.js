import $ from 'jquery';
import store from 'store2';
import axios from 'axios';
import Graph from './graph.js';

// update watchlist button logic to show only after data had been loaded
// fixed bug that hid exit icon after initial popup display
  // issue: referenced icon element before registering it

class StockPopUp {
  constructor(companyId, companyName) {
    this.symbol = companyId;
    this.companyName = companyName;
    this.$mainContainer = $('.main-container');
    this.graph;
    // RETRIEVE WATCHLIST FROM ARRAY STORAGE
    this.watchlist = store.get('watchlist') || [];
    // CHECK IF WATCHLIST HAS THIS STOCK
    this.hasStock = this.watchlist.includes(`${this.symbol} | ${this.companyName}`);

    this.render();

    // REGISTER POPUP ELEMENTS
    this.$popupContainer = $('.popup-modal');
    this.$popupContentContainer = this.$popupContainer.find('.popup-stock-container');
    this.$chartContainer = this.$popupContainer.find('#popup-chart');
    this.$stockName = this.$popupContainer.find('.popup-stock-name');
    this.$tbody = this.$popupContainer.find('table tbody');
    this.$exitIcon = this.$popupContainer.find('.exit-icon');
    this.$loadingIcon = this.$popupContainer.find('.icon-loading');
    this.$watchlistButton = this.$popupContainer.find('#btn-watchlist');


    this.getStockData();
    this.activateEventListeners();
  }


  // RENDER HTML FOR POPUP MODAL
  render() {
    const popupModal = `
      <div class="popup-modal">
        <div class="popup-stock-container">
          <h3 class="text-headline popup-stock-name"></h3>
          <div class="exit-icon"><i class="fas fa-times-circle fa-2x"></i></div>
          <table>
            <tbody>
            </tbody>
          </table>
          <div class="popup-chart-container">
            <div class="icon-loading">
              <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
            </div>
            <canvas id="popup-chart" width="700" height="320"></canvas>
          </div>
          <button id="btn-watchlist" class="button btn-popup-watchlist is-hidden">Add to watchlist</button>
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

    // update watchlist button state
    this.toggleButtonState(this.hasStock);

    // Add/remove stock from watchlist
    this.$popupContentContainer.on('click', '#btn-watchlist', function(event) {
      event.preventDefault();

      const $this = $(this);

      // if stock is not in watchlist, then add to watchlist
      if (that.hasStock === false) {
        that.watchlist.push(`${that.companyId} | ${that.companyName}`);
        store.set('watchlist', that.watchlist);

        // update watchlist button to REMOVE
        $this.addClass('has-warning');
        $this.text('Remove from watchlist');
      }
      // if stock exist, then remove it from watchlist
      else {
        // remove stock from watchlist array
        let index = that.watchlist.indexOf(`${that.companyId} | ${that.companyName}`);
        if (index != -1) {
          that.watchlist.splice(index, 1);
        }

        // store upated watchlist array
        store.set('watchlist', that.watchlist);

        // update watchlist button to ADD
        $this.removeClass('has-warning');
        $this.text('Add to watchlist');
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
      this.$watchlistButton.addClass('has-warning');
      this.$watchlistButton.text('Remove from watchlist');
    }
    // if stock doesn't exist in watchlist, display 'add to watchlist' button
    else {
      this.$watchlistButton.removeClass('has-warning');
      this.$watchlistButton.text('Add to wathclist');
    }

    // if stock exist in local storage, show 'watchlist add/remove' button
    // this is bc we initially want to hide this button when loading a new popup (data not stored in local storage)
    if (store.has(this.symbol)) {
      this.$watchlistButton.removeClass('is-hidden');
    }
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
    }
  }


  // FETCH STOCK DATA
  fetchStockData() {
    // display loading icon
    this.$loadingIcon.addClass('is-visible');

    // request stock data
    axios.all([
      axios.get(`https://cloud.iexapis.com/v1/stock/${this.symbol}/chart/1m?token=pk_a12f90684f2a44f180bcaeb4eff4086d`),
      axios.get(`https://cloud.iexapis.com/v1/stock/${this.symbol}/quote?token=pk_a12f90684f2a44f180bcaeb4eff4086d`)
    ])
    .then(axios.spread((historicalPrices, quote) => {
      // store company data
      const dataToStore = {
        historicalPrices: historicalPrices.data,
        quote: quote.data
      }
      store.set(`POP-${this.symbol}`, dataToStore);
    }))
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      // render stock info
      this.renderStockInfo();

      // render graph
      this.renderGraph();

      // remove loading icon
      this.$loadingIcon.removeClass('is-visible');

      // show watchlist add/remove button
      this.showButton(this.$watchlistButton);

      // display exit icon
      this.showButton(this.$exitIcon);
    });
  }


  // RENDER TABLE WITH STOCK INFO
  renderStockInfo() {
    const stockData = store.get(`POP-${this.symbol}`);
    console.log(stockData);
    // let details = stockData.dataset_data.data[0];

    // get stock info from local storage
    const closePrice = stockData.quote.close;
    const openPrice = stockData.quote.open;
    const low = stockData.quote.low;
    const high = stockData.quote.high
    const volume = stockData.quote.latestVolume;

    // render stock name
    this.$stockName.text(this.companyName);

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
        <td class="key">Day's Range</td>
        <td class="val">${low} - ${high}</td>
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
    const stockData = store.get(`POP-${this.symbol}`).historicalPrices;

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
      return day[key];
    });
  }


  // SHOW WATCHLIST ADD/REMOVE BUTTON
  showButton(buttonElement) {
    buttonElement.removeClass('is-hidden');
  }
}

export default StockPopUp;