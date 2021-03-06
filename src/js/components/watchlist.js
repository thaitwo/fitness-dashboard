import $ from 'jquery';
import store from 'store2';
import axios from 'axios';
import ChartBox from './chartbox.js';
import KeyStats from './keystats.js';
import News from './news.js';
import { calcLocalStorageAge, trimString } from '../../utility/utility.js';
import { URL_BASE, API_TOKEN } from '../../const';
import Graph from './graph.js';

class Watchlist {
  constructor(canvasId) {
    this.$canvas = $(canvasId);
    this.symbol;
    this.chartBox;
    this.keyStats;
    this.latestNews;
    this.currentWatchIndex = store.get('current-watch-index') || 0;
    this.watchlist = store.get('watchlist') || [];

    // If 'current-interval' doesn't exists localStorage, set it at '1m'
    if (store.get('current-interval') === null) {
      store.set('current-interval', '1m');
    }

    // If Watchlist has stocks...
    if (this.watchlist.length > 0) {
      /* When the current selected Watchlist stock is the last one in the list
      and the user clicks the star icon to unwatch the stock, we need to
      set the currentWatchIndex to the length of the Watchlst minus 1 so
      that when the Watchlist page reloads, it will render data for the newly 
      updated last item in the Watchlist. Not having this condition will break
      the Watchlist page in this scenario.
      */
      if (this.currentWatchIndex === this.watchlist.length) {
        store.set('current-watch-index', this.watchlist.length - 1);
        this.currentWatchIndex = store.get('current-watch-index');
      }
      this.symbol = store.get('watchlist')[this.currentWatchIndex].symbol || '';
      this.companyName = store.get('watchlist')[this.currentWatchIndex].name || '';
      this.renderCanvasHtml();
    } else {
      this.renderEmptyWatchlistCanvas();
    }

    this.$watchlistCanvas = $('.watchlist-canvas');
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
    
    this.renderDataOnStockSelection();
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
          <p>Add stocks to your Watchlist by clicking the <span class="icon-watchlist"><i class="far fa-star"></i></span> symbol.</p>
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
      const companyName = trimString(stock.name, 40);
      let isActive = '';

      // Set 'active' class to watchlist item with index that matches selectedStockIndex
      if (index === this.currentWatchIndex) {
        isActive = 'active';
      }

      return `
        <li class="${isActive}">
          <button id="${symbol}">
            <p class="watchlist-item-symbol">${symbol}</p>
            <p class="watchlist-item-name">${companyName}</p>
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
      this.currentInterval = store.get('current-interval');
      /* If data for the current-interval for this stock does exist,
      Create a new Chartbox. Else, fetch new data for the interval.
      */
      if (store.get(this.symbol).chart[this.currentInterval]) {
        this.chartBox = new ChartBox('#watchlist-chart-container', this.symbol);
      } else {
        this.fetchChartData();
      }

      this.keyStats = new KeyStats('#watchlist-keystats-container', this.symbol);
      this.latestNews = new News('#watchlist-news-container', [this.symbol], this.symbol);
    } else {
      this.fetchStockData();
    }
  }


  // MAKE API CALL TO FETCH DATA FOR THE SELECTED STOCK
  fetchChartData() {
    this.currentInterval = store.get('current-interval');

    axios.get(`${URL_BASE}/${this.symbol}/chart/${this.currentInterval}?token=${API_TOKEN}`)
    .then((response) => {
      const storedData = store.get(this.symbol);

      storedData.chart[this.currentInterval] = response.data;
      store.set(this.symbol, storedData);
    })
    .catch(error => console.log(error))
    .then(() => {
      new ChartBox('#watchlist-chart-container', this.symbol);
    })
  }



  // GET DATA FOR COMPANY
  fetchStockData() {
    this.currentInterval = store.get('current-interval');

    axios.get(`${URL_BASE}/${this.symbol}/batch?types=quote,news,chart&last=5&range=${this.currentInterval}&token=${API_TOKEN}`)
    .then((response) => {
      const chart = response.data.chart;
      const news = response.data.news;
      const quote = response.data.quote;

      // If stored data exists
      if (store.get(this.symbol) !== null) {
        const storedData = store.get(this.symbol);

        /* If data for selected interval does not exist in localStorage
        then add data for selected interval into localStorage
        case: the current selected interval is 6M for stock1
        when we click on stock2, we need to check if data for 6M for
        stock2 exists in localStorage */
        if (!(this.currentInterval in storedData.chart)) {
          storedData.chart[this.currentInterval] = chart.data;
          store.set(this.symbol, storedData);
        }
      }
      // Otherwise create data object and store in localStorage
      else {
        const dataToStore = {
          chart: {
            [this.currentInterval]: chart, // this.currentInterval will be set to the selected interval
          },
          news: news,
          quote: quote,
          time: Date.now()
        }

        store.set(this.symbol, dataToStore);

        /* This prevents an infinite loop of requests in case the requests fail.
        The infinite loop would be caused in renderAllData().
        */
        if (response.status == 200) {
          this.renderAllData();
        }
      }
    })
    .catch(error => console.log(error.response.data.error))
  }


  // RENDER NEW DATA WHEN A NEW STOCK IS SELECTED IN WATCHLIST
  renderDataOnStockSelection() {
    const that = this;

    // Display graph & data for watchlist item
    this.$watchlist.on('click', 'button', function(event) {
      event.preventDefault();
      const clickedEl = $(this).parent();
      const watchlistItems = that.$watchlistCanvas.find('.watchlist-list li');
      that.symbol = this.id;
      const dataUpdateRequired = calcLocalStorageAge(that.symbol);

      // Add active class to clicked watchlist item
      watchlistItems.removeClass('active');
      clickedEl.addClass('active');
      

      // Render name and graph for watchlist item
      that.$latestPriceContainer.empty();
      that.$changePercentContainer.empty();
      // If stored data exists and is less than 1 day old
      if (store.get(that.symbol) !== null && !dataUpdateRequired) {
        that.renderAllData();
      }
      // Clear stored data for stock and fetch new data
      else {
        store.remove(that.symbol);
        that.fetchStockData();
      }

      // Get index of selected stock
      let currentWatchIndex = that.watchlist.findIndex((stock) => {
        return stock.symbol === that.symbol;
      });
      
      store.set('current-watch-index', currentWatchIndex);
    });
  }


  // CLEAR WATCHLIST CANVAS WHEN SWITCHING BETWEEN PAGES
  destroyPage() {
    if (this.$watchlistCanvas) {
      this.$canvas.empty();
    }
  }
}

export default Watchlist;