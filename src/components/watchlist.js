import $ from 'jquery';
import store from 'store2';
import axios from 'axios';
import { calcLocalStorageAge } from '../helpers/helpers.js';
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
    axios.get(`${URL_BASE}/${this.symbol}/batch?types=quote,news,chart&last=5&range=${this.interval}&token=${API_TOKEN}`)
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


  // ACTIVATE EVENT LISTENERS FOR WATCHLIST
  loadStockDataHandler() {
    const that = this;

    // Display graph & data for watchlist item
    this.$watchlist.on('click', 'button', function(event) {
      event.preventDefault();
      const clickedEl = $(this).parent();
      const watchlistItems = that.$watchlistCanvas.find('.watchlist-list li');
      that.symbol = this.id;
      const dataUpdateRequired = calcLocalStorageAge(that.symbol);

      // add active class to clicked watchlist item
      watchlistItems.removeClass('active');
      clickedEl.addClass('active');
      

      // render name and graph for watchlist item
      that.$latestPriceContainer.empty();
      that.$changePercentContainer.empty();
      // if stored data exists and is less than 1 day old
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


  // CLEAR WATCHLIST CANVAS WHEN SWITCHING BETWEEN PAGES
  destroy() {
    if (this.$watchlistCanvas) {
      this.$canvas.empty();
    }
  }
}

export default Watchlist;