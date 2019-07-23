import $ from 'jquery';
import store from 'store2';
import axios from 'axios';
import { trimString } from '../helpers/helpers.js';
import Graph from './graph.js';
import Intervals from './intervals.js';
import WatchButton from './watch-button.js';
import KeyStats from './keystats.js';
import News from './news.js';

class Watchlist {
  constructor(container) {
    this.$canvas = container;
    this.graph;
    this.keyStats;
    this.latestNews;
    this.selectedStockIndex = store.get('selectedStockIndex') || 0;
    this.watchlist = store.get('watchlist') || [];
    this.interval = '1m';

    // IF WATCHLIST HAS STOCKS...
    if (this.watchlist.length > 0) {
      this.symbol = store.get('watchlist')[this.selectedStockIndex].symbol || '';
      this.companyName = store.get('watchlist')[this.selectedStockIndex].name || '';
      this.renderCanvasHtml();
    } else {
      this.renderEmptyWatchlistCanvas();
    }

    this.$watchlistCanvas = $('.watchlist-canvas');
    this.$watchlistContainer = this.$watchlistCanvas.find('.watchlist-container');
    this.$watchlist = this.$watchlistCanvas.find('.watchlist-list');
    this.$watchlistChart = this.$watchlistCanvas.find('#watchlist-chart');
    this.$stockName = this.$watchlistCanvas.find('#watchlist-stock-name');
    this.$stockSymbol = this.$watchlistCanvas.find('#watchlist-stock-symbol')
    this.$watchlistDropdown = this.$watchlistCanvas.find('#watchlist-dropdown');
    this.$keyStatsContainer = this.$watchlistCanvas.find('#watchlist-keystats-container');
    this.$newsContainer = this.$watchlistCanvas.find('#watchlist-news-container');
    this.$latestPriceContainer = this.$watchlistCanvas.find('#watchlist-latest-price');
    this.$changePercentContainer = this.$watchlistCanvas.find('#watchlist-change-percent');
    this.$watchButtonContainer = this.$watchlistCanvas.find('#watchlist-chart-header-watch-button');
    this.intervalsBar;
    this.watchButton;

    if (this.watchlist.length > 0) {
      this.displayStocks();
    }
    
    this.loadStockDataHandler();
    this.udpateGraphIntervals();
  }


  // RENDER WATCHLIST CANVAS
  renderCanvasHtml() {
    let html = `
      <div class="watchlist-canvas">
        <div class="watchlist-container">
          <h2 class="watchlist-title">Watchlist</h2>
          <ul class="watchlist-list"></ul>
        </div>
        <div class="watchlist-data-container">
          <div class="watchlist-data-inner-container">
            <div class="watchlist-chart-container">
              <div class="watchlist-chart-header">
                <div id="watchlist-chart-header-top-row">
                  <div class="watchlist-chart-stock-container">
                    <div class="watchlist-chart-name-container">
                      <h2 id="watchlist-stock-name"></h2>
                      <h3 id="watchlist-stock-symbol"></h3>
                    </div>
                  </div>
                  <div id="watchlist-chart-header-btn-intervals">
                    <div id="watchlist-chart-header-watch-button"></div>
                    <div id="watchlist-intervals-container"></div>
                  </div>
                </div>
                <div class="flex-hori-start" style="height: 32px;">
                  <div id="watchlist-latest-price"></div>
                  <div id="watchlist-change-percent"></div>
                </div>
              </div>
              <canvas id="watchlist-chart" width="900" height="320"></canvas>
            </div>
            <div id="watchlist-summary-container">
              <div id="watchlist-keystats-container" class="box margin-right"></div>
              <div id="watchlist-news-container" class="box"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.$canvas.empty();
    this.$canvas.append(html);
  }

  
  // RENDER CANVAS WITH NO WATCHLIST
  renderEmptyWatchlistCanvas() {
    let html = `
      <div id="watchlist-empty">
        <div class="watchlist-empty-content">
          <img src="https://raw.githubusercontent.com/thaitwo/charts/master/public/images/watchlist-icon.png" />
          <h3>Your Watchlist will appear here</h3>
          <p>Add stocks to your Watchlist by clicking the <span class="icon-watchlist"><i class="far fa-star"></i></span> symbol next to a company's name.</p>
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
      const name = stock.name;
      let isActive = '';

      // set 'active' class to watchlist item with index that matches selectedStockIndex
      if (index === this.selectedStockIndex) {
        isActive = 'active';
      }

      return `
        <li class="${isActive}">
          <button id="${symbol}">
            <p class="watchlist-item-symbol">${symbol}</p>
            <p class="watchlist-item-name">${name}</p>
          </button>
        </li>
      `;
    });

    this.$watchlist.empty();
    this.$watchlist.append(stocks);
    this.renderOnUnwatch();
  }


  // RELOAD PAGE WHEN STOCK IS REMOVED FROM WATCHLIST
  renderOnUnwatch() {
    if (this.watchlist.length > 0) {
      this.symbol = store.get('watchlist')[this.selectedStockIndex].symbol;
      if (store.get(this.symbol) !== null) {
        this.renderAllData();
      }
    } else {
      this.fetchStockData('allData');
    }
  }


  // RENDER ALL STOCK INFO ON PAGE
  renderAllData() {
    const quoteData = store.get(this.symbol).quote;
    this.renderStockHeader(quoteData);
    this.renderChart();
    this.keyStats = new KeyStats('#watchlist-keystats-container', this.symbol);
    this.latestNews = new News('#watchlist-news-container', [this.symbol], this.symbol);
    this.watchButton = new WatchButton('#watchlist-chart-header-watch-button', this.symbol, this.companyName);
  }


  // UPDATE GRAPH WITH NEW INTERVAL
  udpateGraphIntervals() {
    const that = this;
    this.$watchlistDropdown.on('change', function(event) {
      const selectedInterval = this.value;
      that.interval = selectedInterval; // set this.interval

      that.fetchStockData('prices');
    })
  }


  // FORMAT AJAX REQUEST BASED ON NEEDED DATA
  formatAjaxRequest(requestType) {
    // request data only for historical prices to update graph
    if (requestType === 'prices') {
      return[
        axios.get(`https://cloud.iexapis.com/v1/stock/${this.symbol}/chart/${this.interval}?token=pk_a12f90684f2a44f180bcaeb4eff4086d`)
      ];

    }
    // request all data for this stock
    else if (requestType === 'allData') {
      return [
        axios.get(`https://cloud.iexapis.com/v1/stock/${this.symbol}/batch?types=quote,news,chart&range=${this.interval}&token=pk_a12f90684f2a44f180bcaeb4eff4086d`)
      ]
    }
    else if (requestType === 'latestPrice') {
      return [
        axios.get(`https://cloud.iexapis.com/v1/stock/${this.symbol}/quote?displayPercent=true&token=pk_a12f90684f2a44f180bcaeb4eff4086d`)
      ]
    }
  }


  // FORMAT HOW TO STORE DATA BASED ON NEEDED DATA
  formatAjaxResponseAction(requestType) {
    // store historical prices
    if (requestType === 'prices') {
      return (chart) => {
        const storedData = store.get(this.symbol);

        // if data for selected interval does not exist in localStorage
        if (!(this.interval in storedData.chart)) {
          storedData.chart[this.interval] = chart.data;
          store.set(this.symbol, storedData);
        }
      }
    }
    // store all data for the stock
    else if (requestType === 'allData') {
      return (response) => {
        const chart = response.data.chart;
        const news = response.data.news;
        const quote = response.data.quote;
        // if stored data exists
        if (store.get(this.symbol) !== null) {
          const storedData = store.get(this.symbol);

          // if data for selected interval does not exist in localStorage
          // then add data for selected interval into localStorage
          // case: the current selected interval is 6M for stock1
          // when we click on stock2, we need to check if data for 6M for
          // stock2 exists in localStorage
          if (!(this.interval in storedData.chart)) {
            storedData.chart[this.interval] = chart.data;
            store.set(this.symbol, storedData);
          }
          this.renderStockHeader(quote);
        }
        // otherwise create data object and store in localStorage
        else {
          const dataToStore = {
            chart: {
              [this.interval]: chart, // this.interval will be set to the selected interval
            },
            news: news,
            quote: quote,
            time: Date.now()
          }
  
          store.set(this.symbol, dataToStore);
          this.renderStockHeader(quote);
        }
      }
    } else if (requestType === 'latestPrice') {
      return (quote) => {
        this.renderStockHeader(quote.data);
      }
    }
  }


  // GET DATA FOR COMPANY
  fetchStockData(requestType) {
    const requests = this.formatAjaxRequest(requestType);
    const responseAction = this.formatAjaxResponseAction(requestType);

    axios.all(requests)
    .then(axios.spread(responseAction))
    .catch(error => console.log(error))
    .finally(() => {
      if (requestType === 'prices') {
        this.renderChart();
      }
      else if (requestType === 'allData') {
        // functions below don't receive data arguments bc they will retrieve data from localStorage
        this.renderChart();
        this.keyStats = new KeyStats('#watchlist-keystats-container', this.symbol);
        this.latestNews = new News('#watchlist-news-container', [this.symbol], this.symbol);
        this.watchButton = new WatchButton('#watchlist-chart-header-watch-button', this.symbol, this.companyName);
      }
    })
  }


  // DISPLAY STOCK INFO IN HEADER
  renderStockHeader(data) {
    const companyName = trimString(data.companyName, 36);
    const changePercent = data.changePercent.toFixed(2);
    const latestPrice = data.latestPrice;
    const plusOrMinus = (changePercent > 0) ? '+' : ''; // else condition is not '-' since data includes negative sign
    const latestPriceHtml = `<h2>${latestPrice}</2>`;
    const changePercentHtml = `<h3>${plusOrMinus}${changePercent}%</h3>`;

    this.$stockName.html(companyName);
    this.$stockSymbol.html(`(${this.symbol})`);

    if (changePercent >= 0) {
      this.$changePercentContainer.removeClass('percent-change-negative');
      this.$changePercentContainer.addClass('percent-change-positive');
    } else {
      this.$changePercentContainer.removeClass('percent-change-positive');
      this.$changePercentContainer.addClass('percent-change-negative');
    }

    this.$latestPriceContainer.html(latestPriceHtml);
    this.$changePercentContainer.html(changePercentHtml);
  }


  // ACTIVATE EVENT LISTENERS FOR WATCHLIST
  loadStockDataHandler() {
    const that = this;

    // Display graph & data for watchlist item
    this.$watchlist.on('click', 'button', function(event) {
      event.preventDefault();
      const clickedEl = $(this).parent();
      const watchlistItems = that.$watchlistCanvas.find('.watchlist-list li');
      that.symbol = this.id;
      const dataUpdateRequired = that.calcLocalStorageAge();

      // add active class to clicked watchlist item
      watchlistItems.removeClass('active');
      clickedEl.addClass('active');
      

      // render name and graph for watchlist item
      that.$latestPriceContainer.empty();
      that.$changePercentContainer.empty();
      // if stored data exists and is less than 6 hours old
      if (store.get(that.symbol) !== null && !dataUpdateRequired) {
        that.renderAllData();
      }
      // clear stored data for stock and fetch new data
      else {
        store.remove(that.symbol);
        that.fetchStockData('allData');
      }

      // get index of selected stock
      let selectedStockIndex = that.watchlist.findIndex((stock) => {
        return stock.symbol === that.symbol;
      });
      // if (selectedStockIndex == (that.watchlist.length - 1)) {
      //   selectedStockIndex = selectedStockIndex - 1;
      // };
      store.set('selectedStockIndex', selectedStockIndex);
    });
  }


  // Calculate whether local storage for stock is more than 6 hours old
  calcLocalStorageAge() {
    const sixHours = 60 * 60 * 6 * 1000;
    const newTime = Date.now();
    let oldTime;

    // if stored data exists, calculate if data needs to be updated
    if (store.get(this.symbol) !== null) {
      oldTime = store.get(this.symbol).time;
      return (newTime - oldTime) > sixHours;
    } else {
      return true;
    }
  }


  // RENDER CHART
  renderChart() {
    const storedData = store.get(this.symbol);
    // if historical prices for selected interval does exist in localStorage
    if (this.interval in storedData.chart) {
      const storedData = store.get(this.symbol).chart[this.interval];
      // get closing prices for stock
      const prices = this.getChartData(storedData, 'close');
      // get dates for closing prices
      const dates = this.getChartData(storedData, 'date');
      
      // delete graph if any exists and create new graph
      if (this.graph) {
        this.graph.destroy();
      }
      this.graph = new Graph('#watchlist-chart', prices, dates);
      this.intervalsBar = new Intervals('#watchlist-intervals-container', this.symbol, '#watchlist-chart');
    }
    // if it doesn't exist, make data request
    else {
      this.fetchStockData('prices');
    }
  }


  // GET SPECIFIC DATA ARRAY OF COMPANY (STOCK OPEN PRICES, DATES, ETC.)
  getChartData(data, key) {
    return data.map((day) => {
      if (key === 'date') {
        const date = day[key].split('-');
        return `${date[1].replace(/^0+/, '')}-${date[2]}-${date[0]}`;
      } else {
        return day[key];
      }
    });
  }


  // CLEAR WATCHLIST CANVAS WHEN SWITCHING BETWEEN PAGES
  destroy() {
    if (this.$watchlistCanvas) {
      this.$canvas.empty();
    }
  }
}

export default Watchlist;