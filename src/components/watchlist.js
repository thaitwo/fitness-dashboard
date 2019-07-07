import $ from 'jquery';
import store from 'store2';
import axios from 'axios';
import { formatLargeNumber, formatNumberWithCommas, trimString } from '../helpers/helpers.js';
import Graph from './graph.js';
import Intervals from './intervals.js';
import WatchButton from './watch-button.js';

class Watchlist {
  constructor(container) {
    this.$container = container;
    this.graph;
    this.selectedStockIndex = store.get('selectedStockIndex') || 0;
    this.symbol = store.get('watchlist')[this.selectedStockIndex].symbol || '';
    this.companyName = store.get('watchlist')[this.selectedStockIndex].name || '';
    this.interval = '1m';
    this.watchlist = store.get('watchlist') || [];
    this.renderCanvasHTML();

    this.$watchlistCanvas = $('.watchlist-canvas');
    this.$watchlistContainer = this.$watchlistCanvas.find('.watchlist-container');
    this.$watchlist = this.$watchlistCanvas.find('.watchlist-list');
    this.$watchlistChart = this.$watchlistCanvas.find('#watchlist-chart');
    this.$stockName = this.$watchlistCanvas.find('#watchlist-stock-name');
    this.$stockSymbol = this.$watchlistCanvas.find('#watchlist-stock-symbol')
    this.$watchlistDropdown = this.$watchlistCanvas.find('#watchlist-dropdown');
    this.$keyStatsContainer = this.$watchlistCanvas.find('#watchlist-key-stats-container');
    this.$newsContainer = this.$watchlistCanvas.find('#watchlist-news-container');
    this.$latestPriceContainer = this.$watchlistCanvas.find('#watchlist-latest-price');
    this.$changePercentContainer = this.$watchlistCanvas.find('#watchlist-change-percent');
    this.$watchButtonContainer = this.$watchlistCanvas.find('#watchlist-chart-header-watch-button');
    this.$intervalsContainer = this.$watchlistCanvas.find('#watchlist-intervals-container');

    this.intervalsBar = new Intervals(this.$intervalsContainer, this.symbol, '#watchlist-chart');
    this.watchButton;

    this.displayStocks();
    // this.renderDataForFirstStock();
    this.renderOnUnwatch();
    this.loadStockDataHandler();
    this.udpateGraphIntervals();
  }


  renderOnUnwatch() {
    if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
      // console.info( "This page is reloaded", this.selectedStockIndex);
      this.symbol = store.get('watchlist')[this.selectedStockIndex].symbol;
      // console.log('symbol', this.symbol);
      // this.renderDataForFirstStock();
      this.fetchStockData('allData');
    } else {
      // console.info( "This page is not reloaded");
      // this.renderDataForFirstStock();
      this.fetchStockData('allData');
    }
  }


  // RENDER WATCHLIST CANVAS
  renderCanvasHTML() {
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
              <div id="watchlist-key-stats-container" class="box marginRight"></div>
              <div id="watchlist-news-container" class="box"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.$container.append(html);
  }


  // POPULATE WATCHLIST CONTAINER WITH STOCKS
  displayStocks() {
    const list = this.watchlist.map((stock, index) => {
      const symbol = stock.symbol;
      const name = stock.name;
      let isActive = '';

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

    this.$watchlist.append(list);
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
        axios.get(`https://cloud.iexapis.com/v1/stock/${this.symbol}/chart/${this.interval}?token=pk_a12f90684f2a44f180bcaeb4eff4086d`),
        axios.get(`https://cloud.iexapis.com/v1/stock/${this.symbol}/news/last/4?token=pk_a12f90684f2a44f180bcaeb4eff4086d`),
        axios.get(`https://cloud.iexapis.com/v1/stock/${this.symbol}/quote?displayPercent=true&token=pk_a12f90684f2a44f180bcaeb4eff4086d`),
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
      return (historicalPrices) => {
        const storedData = store.get(this.symbol);

        // if data for selected interval does not exist in localStorage
        if (!(this.interval in storedData.historicalPrices)) {
          storedData.historicalPrices[this.interval] = historicalPrices.data;
          store.set(this.symbol, storedData);
        }
      }
    }
    // store all data for the stock
    else if (requestType === 'allData') {
      return (historicalPrices, news, quote) => {
        // const latestPrice = quote.data.latestPrice;
        // const changePercent = quote.data.changePercent;
        // if stored data exists
        if (store.get(this.symbol) !== null) {
          const storedData = store.get(this.symbol);

          // if data for selected interval does not exist in localStorage
          // then add data for selected interval into localStorage
          // case: the current selected interval is 6M for stock1
          // when we click on stock2, we need to check if data for 6M
          // exists in localStorage
          if (!(this.interval in storedData.historicalPrices)) {
            storedData.historicalPrices[this.interval] = historicalPrices.data;
            store.set(this.symbol, storedData);
          }
          this.renderStockHeader(quote.data);
        }
        // otherwise create data object and store in localStorage
        else {
          const dataToStore = {
            historicalPrices: {
              [this.interval]: historicalPrices.data, // this.interval will be set to the selected interval
            },
            news: news.data,
            quote: quote.data,
            time: Date.now()
          }
  
          store.set(this.symbol, dataToStore);
          this.renderStockHeader(quote.data);
        }
      }
    } else if (requestType === 'latestPrice') {
      return (quote) => {
        const latestPrice = quote.data.latestPrice;
        const changePercent = quote.data.changePercent;
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
        this.renderGraph();
      }
      else if (requestType === 'allData') {
        // functions below don't receive data arguments bc they will retrieve data from localStorage
        this.renderGraph();
        this.renderKeyStats();
        this.renderNews();
        this.watchButton = new WatchButton('#watchlist-chart-header-watch-button', this.symbol, this.companyName, true);
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
      const dataUpdateRequired = that.calcLocalStorageAge();
      const clickedEl = $(this).parent();
      const watchlistItems = that.$watchlistCanvas.find('.watchlist-list li');
      const symbol = this.id;
      that.symbol = symbol;
      const name = $(this).find('.watchlist-item-name').text();

      // add active class to clicked watchlist item
      watchlistItems.removeClass('active');
      clickedEl.addClass('active');
      

      // render name and graph for watchlist item
      // that.renderStockName(name);
      // that.watchButton = new WatchButton('#watchlist-chart-header-watch-button', symbol, name, true);
      that.$latestPriceContainer.empty();
      that.$changePercentContainer.empty();

      // if stored data exists and is less than 6 hours old
      if (store.get(that.symbol) !== null && dataUpdateRequired) {
        that.fetchStockData('latestPrice');
        that.renderGraph();
        that.renderKeyStats();
        that.renderNews();
      }
      // clear stored data for stock and fetch new data
      else {
        store.remove(that.symbol);
        that.fetchStockData('allData');
      }

      // get index of selected stock
      let selectedStockIndex = that.watchlist.findIndex((stock) => {
        return stock.symbol === symbol;
      });
      console.log('wLength', that.watchlist.length);
      console.log(selectedStockIndex);
      // if (selectedStockIndex == (that.watchlist.length - 1)) {
      //   selectedStockIndex = selectedStockIndex - 1;
      // };
      store.set('selectedStockIndex', selectedStockIndex);
    });
  }


  // Calculate whether local storage for stock is more than 6 hours old
  calcLocalStorageAge() {
    const oneHour = 60 * 60 * 6 * 1000;
    const newTime = Date.now();
    let oldTime;

    // if stored data exists, calculate if data needs to be updated
    if (store.get(this.symbol) !== null) {
      oldTime = store.get(this.symbol).time;
      return (newTime - oldTime) > oneHour;
    } else {
      return true;
    }
  }


  // RENDER NEWS
  renderNews() {
    if (store.get(this.symbol).news !== null) {
      const news = store.get(this.symbol).news;
      
      const newsArticles = news.map((item) => {
        let headline = item.headline;
        headline = trimString(headline, 120);
        let summary = item.summary;
        summary = trimString(summary, 160);
        const url = item.url;

        return `
          <article class="watchlist-news-article">
            <a href="${url}" target="_blank">
              <h2>${headline}</h2>
              <p>${summary}</p>
            </a<
          </article>
        `
      });

      this.$newsContainer.empty();
      this.$newsContainer.append(`<h2 class="text-header">Latest News</h2>`);
      this.$newsContainer.append(newsArticles);
    }
  }


  // RENDER GRAPH
  renderGraph() {
    const storedData = store.get(this.symbol);
    // if historical prices for selected interval does exist in localStorage
    if (this.interval in storedData.historicalPrices) {
      const storedData = store.get(this.symbol).historicalPrices[this.interval];
      // get closing prices for stock
      const prices = this.getHistoricalData(storedData, 'close');
      // get dates for closing prices
      const dates = this.getHistoricalData(storedData, 'date');
      
      // delete graph if any exists and create new graph
      if (this.graph) {
        this.graph.destroy();
      }
      this.graph = new Graph(this.$watchlistChart, prices, dates);
    }
    // if it doesn't exist, make data request
    else {
      this.fetchStockData('prices');
    }
  }


  // RENDER KEY STATISTICS
  renderKeyStats() {
    if (store.get(this.symbol).quote !== null) {
      const stats = store.get(this.symbol).keyStats;
      const quote = store.get(this.symbol).quote;

      const close = quote.close;
      const open = quote.open;
      const high = quote.high;
      const low = quote.low;
      const marketCap = formatLargeNumber(quote.marketCap);
      const peRatio = quote.peRatio;
      const wk52High = quote.week52High;
      const wk52Low = quote.week52Low;
      const volume = formatNumberWithCommas(Math.round(quote.latestVolume));

      const keyStatsHTML = `
        <h2 class="text-header">Key Statistics</h2>
        <table id="key-stats-table">
          <tr>
            <td>Close</td>
            <td>${close}</td>
          </tr>
          <tr>
            <td>Open</td>
            <td>${open}</td>
          </tr>
          <tr>
            <td>High</td>
            <td>${high}</td>
          </tr>
          <tr>
            <td>Low</td>
            <td>${low}</td>
          </tr>
          <tr>
            <td>Market Cap</td>
            <td>${marketCap}</td>
          </tr>
          <tr>
            <td>P/E Ratio</td>
            <td>${peRatio}</td>
          </tr>
          <tr>
            <td>52 Wk High</td>
            <td>${wk52High}</td>
          </tr>
          <tr>
            <td>52 Wk Low</td>
            <td>${wk52Low}</td>
          </tr>
          <tr>
            <td>Volume</td>
            <td>${volume}</td>
          </tr>
        </table>
      `;

      this.$keyStatsContainer.empty();
      this.$keyStatsContainer.append(keyStatsHTML);
    }
  }


  // RENDER GRAPH & DATA FOR FIRST STOCK IN WATCHLIST
  renderDataForFirstStock() {
    // if watchlist has at least one item, render item(s)
    if (this.watchlist.length > 0) {
      const name = this.watchlist[0].name;
      const isMoreThanOneDay = this.calcLocalStorageAge();

      // this.renderStockName(name);
      this.watchButton = new WatchButton('#watchlist-chart-header-watch-button', this.symbol, name, true);

      // update localStorage with new data if data is older than 12 hours
      if (isMoreThanOneDay) {
        store.remove(this.symbol);
        this.fetchStockData('allData');
      } else {
        // make Ajax call to get data for company
        this.fetchStockData('allData');
      }
    
    }
    // If watchlist is empty, render button with link to stocks page
    else {
      this.$watchlistContainer.append(`<a href="/#stocks"><p class="watchlist-add-stocks">Add stocks to watchlist<i class="fa fa-plus-circle" aria-hidden="true"></i></p></a>`);
    }
  }


  // RENDER STOCK NAME
  renderStockName(name) {
    const stockName = trimString(name, 36);
    this.$stockName.text(stockName);
    this.$stockSymbol.html(`(${this.symbol})`);
  }


  // GET SPECIFIC DATA ARRAY OF COMPANY (STOCK OPEN PRICES, DATES, ETC.)
  getHistoricalData(data, key) {
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
      this.$container.empty();
    }
  }
}

export default Watchlist;