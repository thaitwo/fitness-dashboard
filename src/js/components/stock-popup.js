import $ from 'jquery';
import store from 'store2';
import axios from 'axios';
import { formatLargeNumber, formatNumberWithCommas, trimString } from '../../utility/utility.js';
import Intervals from './intervals.js';
import WatchButton from './watch-button.js';
import { URL_BASE, API_TOKEN } from '../../const';

class StockPopup {
  constructor(companySymbol, companyName) {
    this.symbol = companySymbol;
    this.companyName = companyName;
    this.$mainContainer = $('.main-container');
    this.chart;
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
    this.$watchlistButton = this.$popupContainer.find('#popup-button-watchlist');
    this.chartCanvas = document.getElementById('popup-chart');

    this.intervals;
    this.watchButton = new WatchButton('#popup-watch-button', this.symbol, this.companyName);
    this.renderAllData();
    this.closePopup();
  }


  // RENDER HTML FOR POPUP MODAL
  render() {
    const popupModal = `
      <div class="popup-modal">
        <div class="popup-stock-container">
          <div id="popup-top-container">
            <div id="popup-header">
              <h2 id="popup-stock-name"></h2>
            </div>
            <div id="popup-wbutton-intervals">
              <div id="popup-watch-button" class="popup-watch-button"></div>
              <div id="popup-intervals-container"></div>
            </div>
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
              <canvas id="popup-chart" width="660" height="400"></canvas>
            </div>
          </div>
          <div class="exit-icon"><i class="fas fa-times"></i></div>
        </div>
      </div>
    `;
    this.$mainContainer.prepend(popupModal);
  }


  // RENDER STOCK CONTENT FOR POPUP
  renderAllData() {
    // check if there's locally stored data before making Ajax request
    if (store.get(this.symbol)) {
      this.renderStockInfo();
      // new Intervals will dynamically create 
      this.intervals = new Intervals('#popup-intervals-container', this.symbol, '#popup-chart');
    }
    else {
      this.fetchStockData();
    }
  }


  // FETCH STOCK DATA
  fetchStockData() {
    axios.get(`${URL_BASE}/${this.symbol}/batch?types=quote,news,chart&range=1m&token=${API_TOKEN}`)
    .then((response) => {
      const dataToStore = {
        chart: {
          '1m': response.data.chart,
        },
        news: response.data.news,
        quote: response.data.quote,
        time: Date.now()
      }
      store.set(this.symbol, dataToStore);

      /* This prevents an infinite loop of requests in case the requests fail.
        The infinite loop would be caused in renderAllData().
        */
      if (response.status == 200) {
        this.renderStockInfo();
        this.renderAllData();
      }
    })
    .catch(error => console.log(error))
  }


  // RENDER TABLE WITH STOCK INFO
  renderStockInfo() {
    const stockData = store.get(`${this.symbol}`).quote;
    let {
      changePercent,
      close,
      high,
      latestPrice,
      latestVolume,
      low,
      marketCap,
      open,
      peRatio,
      week52High,
      week52Low
    } = stockData;

    // get stock info from local storage
    changePercent = changePercent ? `${changePercent.toFixed(2)}%` : '';
    latestVolume = formatNumberWithCommas(Math.round(latestVolume));
    marketCap = formatLargeNumber(marketCap);
    const companyName = trimString(this.companyName, 36);
    const plusOrMinus = (changePercent > 0) ? '+' : ''; // else condition is not '-' since data includes negative sign

    // render stock name
    this.$stockName.text(`${companyName} (${this.symbol})`);
    this.$latestPriceContainer.text(latestPrice);
    this.$changePercentContainer.text(`${plusOrMinus}${changePercent}`);
    
    if (changePercent >= 0) {
      this.$changePercentContainer.addClass('percent-change-positive');
    } else {
      this.$changePercentContainer.addClass('percent-change-negative');
    }


    let row = `
      <tr>
        <td class="key">Close</td>
        <td class="val">${close}</td>
      </tr>
      <tr>
        <td class="key">Open</td>
        <td class="val">${open}</td>
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
        <td class="val">${week52Low} - ${week52High}</td>
      </tr>
      <tr>
        <td class="key">Volume</td>
        <td class="val">${latestVolume}</td>
      </tr>
    `;
    this.$tbody.append(row);
  }


  // CLOSE POPUP EVENT HANDLER
  closePopup() {
    const that = this;

    // Disable closing of viewer upon click on popup container
    this.$popupContentContainer.on('click', function(event) {
      event.stopPropagation();
    });

    // Remove popup modal on click of exit icon
    this.$exitIcon.on('click', function(event) {
      event.stopPropagation();
      that.destroyPopup();
    });

    // Remove popup modal on click outside of modal
    this.$popupContainer.on('click', () => this.destroyPopup());
  }


  // REMOVE EVENT LISTENERS & DESTROY POPUP HTML
  destroyPopup() {
    this.$popupContainer.off();
    this.$popupContentContainer.off();
    this.$popupContainer.remove();
  }
}

export default StockPopup;