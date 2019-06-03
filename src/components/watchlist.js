import $ from 'jquery';
import store from 'store2';
import axios from 'axios';
import Graph from './graph.js';


class Watchlist {
  constructor(container) {
    this.$container = container;
    this.graph;
    this.symbol = store.get('watchlist')[0].symbol || '';
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
    this.$currentPrice = this.$watchlistCanvas.find('#watchlist-current-price');

    this.getStocks();
    this.renderDataForFirstStock();
    this.activateEventListeners();
    this.udpateGraphIntervals();
  }


  // RENDER WATCHLIST CANVAS
  renderCanvasHTML() {
    let html =
    `
      <div class="watchlist-canvas">
        <div class="watchlist-container">
          <h2 class="watchlist-title">Watchlist</h2>
          <ol class="watchlist-list"></ol>
        </div>
        <div class="watchlist-data-container">
          <div class="watchlist-data-inner-container">
            <div class="watchlist-chart-container">
              <div class="watchlist-chart-header">
                <div class="watchlist-chart-stock-container">
                  <div class="watchlist-chart-name-container">
                    <h2 id="watchlist-stock-name"></h2>
                    <h3 id="watchlist-stock-symbol"></h3>
                  </div>
                  <div id="watchlist-current-price"></div>
                </div>
                <div class="watchlist-dropdown-container">
                  <select id="watchlist-dropdown">
                    <option value="1m">1M</option>
                    <option value="3m">3M</option>
                    <option value="6m">6M</option>
                    <option value="ytd">YTD</option>
                    <option value="1y">1Y</option>
                    <option value="2y">2Y</option>
                    <option value="5y">5Y</option>
                    <option value="max">MAX</option>
                  </select>
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
  getStocks() {
    let list = this.watchlist.map((stock, index) => {
      const symbol = stock.symbol;
      const name = stock.name;
      let isActive = '';

      if (index === 0) {
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
        axios.get(`https://cloud.iexapis.com/v1/stock/${this.symbol}/price?token=pk_a12f90684f2a44f180bcaeb4eff4086d`),
        axios.get(`https://cloud.iexapis.com/v1/stock/${this.symbol}/chart/${this.interval}?token=pk_a12f90684f2a44f180bcaeb4eff4086d`),
        axios.get(`https://cloud.iexapis.com/v1/stock/${this.symbol}/stats?token=pk_a12f90684f2a44f180bcaeb4eff4086d`),
        axios.get(`https://cloud.iexapis.com/v1/stock/${this.symbol}/news/last/4?token=pk_a12f90684f2a44f180bcaeb4eff4086d`),
        axios.get(`https://cloud.iexapis.com/v1/stock/${this.symbol}/quote?token=pk_a12f90684f2a44f180bcaeb4eff4086d`),
      ]
    }
    else if (requestType === 'currentPrice') {
      return [
        axios.get(`https://cloud.iexapis.com/v1/stock/${this.symbol}/price?token=pk_a12f90684f2a44f180bcaeb4eff4086d`)
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
      return (currentPrice, historicalPrices, stats, news, quote) => {
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
          this.renderStockHeader(currentPrice.data);
        }
        // otherwise create data object and store in localStorage
        else {
          const dataToStore = {
            historicalPrices: {
              [this.interval]: historicalPrices.data, // this.interval will be set to the selected interval
            },
            keyStats: stats.data,
            news: news.data,
            quote: quote,
            time: Date.now()
          }
  
          store.set(this.symbol, dataToStore);
          this.renderStockHeader(currentPrice.data);
        }
      }
    } else if (requestType === 'currentPrice') {
      return (currentPrice) => {
        this.renderStockHeader(currentPrice.data);
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
        // this.renderStockHeader();
        // functions below don't receive data arguments bc they will retrieve data from localStorage
        this.renderGraph();
        this.renderKeyStats();
        this.renderNews();
      }
    })
  }


  renderStockHeader(currentPrice) {
    // let marketCap = store.get(this.symbol).keyStats.marketcap;
    // marketCap = this.formatLargeNumber(marketCap);

    const html = `
      <h2>${currentPrice}</2>
      <h3>Current Price</h3>
    `;

    // this.$currentPrice.empty();
    this.$currentPrice.html(html);
  }


  // ACTIVATE EVENT LISTENERS FOR WATCHLIST
  activateEventListeners() {
    const that = this;

    // Display graph & data for watchlist item
    this.$watchlist.on('click', 'button', function(event) {
      event.preventDefault();
      const isMoreThanOneDay = that.updateLocalStorageAge();
      const clickedEl = $(this).parent();
      const watchlistItems = that.$watchlistCanvas.find('.watchlist-list li');
      const symbol = this.id;
      that.symbol = symbol;
      const name = $(this).find('.watchlist-item-name').text();

      // add active class to clicked watchlist item
      watchlistItems.removeClass('active');
      clickedEl.addClass('active');

      // render name and graph for watchlist item
      that.renderStockName(name);

      // if stored data exists and is less than 1 day old
      if (store.get(that.symbol) !== null && !isMoreThanOneDay) {
        that.fetchStockData('currentPrice');
        that.renderGraph();
        that.renderKeyStats();
        that.renderNews();
      }
      // clear stored data for stock and fetch new data
      else {
        store.remove(that.symbol);
        that.fetchStockData('allData');
      }
    });
  }


  // Calculate whether local storage for stock is more than 12 hours old
  updateLocalStorageAge() {
    const oneDay = 60 * 60 * 12 * 1000;
    const newTime = Date.now();
    let oldTime;
    if (store.get(this.symbol !== null)) {
      oldTime = store.get(this.symbol).time;
      return (newTime - oldTime) > oneDay;
    } else {
      return false;
    }
  }


  // RENDER NEWS
  renderNews() {
    if (store.get(this.symbol).news !== null) {
      const news = store.get(this.symbol).news;
      
      const newsArticles = news.map((item) => {
        let headline = item.headline;
        headline = this.trimString(headline, 120);
        let summary = item.summary;
        summary = this.trimString(summary, 160);
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
    if (store.get(this.symbol).keyStats !== null) {
      const stats = store.get(this.symbol).keyStats;
      let marketCap = stats.marketcap;
      marketCap = this.formatLargeNumber(marketCap);
      const peRatio = stats.peRatio;
      const wk52High = stats.week52high;
      const wk52Low = stats.week52low;
      const eps = stats.ttmEPS;
      let avg30Vol = stats.avg30Volume;
      avg30Vol = this.formatNumberWithCommas(Math.round(avg30Vol));

      const keyStatsHTML = `
        <h2 class="text-header">Key Statistics</h2>
        <table id="key-stats-table">
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
            <td>EPS (TTM)</td>
            <td>${eps}</td>
          </tr>
          <tr>
            <td>Avg. Volume (30D)</td>
            <td>${avg30Vol}</td>
          </tr>
        </table>
      `;

      this.$keyStatsContainer.empty();
      this.$keyStatsContainer.append(keyStatsHTML);
    }
  }


  // FORMATE LARGE NUMBERS
  formatLargeNumber(num) {
    return Math.abs(Number(num)) >= 1.0e+9 ? (Math.abs(Number(num)) / 1.0e+9).toFixed(2) + "B"
         // Six Zeroes for Millions 
         : Math.abs(Number(num)) >= 1.0e+6 ? (Math.abs(Number(num)) / 1.0e+6).toFixed(2) + "M"
         // Three Zeroes for Thousands
         : Math.abs(Number(num)) >= 1.0e+3 ? (Math.abs(Number(num)) / 1.0e+3).toFixed(2) + "K"
         : Math.abs(Number(num)).toFixed(2);
  }


  // Insert commas into numbers
  formatNumberWithCommas(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }


  // RENDER GRAPH & DATA FOR FIRST STOCK IN WATCHLIST
  renderDataForFirstStock() {
    // if watchlist has at least one item, render item(s)
    if (this.watchlist.length > 0) {
      const name = this.watchlist[0].name;
      const isMoreThanOneDay = this.updateLocalStorageAge();

      this.renderStockName(name);

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
    this.$stockName.text(name);
    this.$stockSymbol.text(this.symbol);
  }


  // GET SPECIFIC DATA ARRAY OF COMPANY (STOCK OPEN PRICES, DATES, ETC.)
  getHistoricalData(data, key) {
    // console.log(data);
    return data.map((day) => {
      return day[key];
    });
  }

  // TRIM STRINGS TO SPECIFIED LENGTH
  trimString(string, length) {
    return string.length > length ? string.substring(0, length - 3) + '...' : string.substring(0, length);
  }


  // CLEAR WATCHLIST CANVAS WHEN SWITCHING BETWEEN PAGES
  destroy() {
    if (this.$watchlistCanvas) {
      this.$container.empty();
    }
  }
}

export default Watchlist;