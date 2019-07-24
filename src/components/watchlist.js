import $ from 'jquery';
import store from 'store2';
import axios from 'axios';
import { trimString } from '../helpers/helpers.js';
import ChartBox from './chartbox.js';
import KeyStats from './keystats.js';
import News from './news.js';
import { URL_BASE, API_TOKEN } from '../const';

// make latest price consistently update

class Watchlist {
  constructor(container) {
    this.$canvas = container;
    this.symbol;
    this.graph;
    this.chartBox;
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
            <div id="watchlist-chart-container" class="watchlist-chart-container"></div>
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
    this.renderAllData();
  }


  // RENDER ALL STOCK INFO ON PAGE
  renderAllData() {
    if (store.get(this.symbol) !== null) {
      this.chartBox = new ChartBox('#watchlist-chart-container', this.symbol);
      this.keyStats = new KeyStats('#watchlist-keystats-container', this.symbol);
      this.latestNews = new News('#watchlist-news-container', [this.symbol], this.symbol);
    } else {
      this.fetchStockData();
    }
  }


  // GET DATA FOR COMPANY
  fetchStockData() {
    axios.get(`${URL_BASE}/${this.symbol}/batch?types=quote,news,chart&range=${this.interval}&token=${API_TOKEN}`)
    .then((response) => {
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
      }
    })
    .catch(error => console.log(error))
    .finally(() => {
      this.renderAllData();
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
        that.fetchStockData();
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
    const oneDay = 60 * 60 * 24 * 1000;
    const newTime = Date.now();
    let oldTime;

    // if stored data exists, calculate if data needs to be updated
    if (store.get(this.symbol) !== null) {
      oldTime = store.get(this.symbol).time;
      return (newTime - oldTime) > oneDay;
    } else {
      return true;
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