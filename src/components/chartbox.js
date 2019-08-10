import $ from 'jquery';
import store from 'store2';
import Intervals from './intervals.js';
import WatchButton from './watch-button.js';
import { trimString, getPageId } from '../utility/utility.js';

class ChartBox {
  constructor(containerId, symbol) {
    this.$container = $(containerId);
    this.symbol = symbol;
    this.chart;
    this.intervalsBar;
    this.watchButton;
    this.pageId = getPageId();
    this.currentInterval;;
    if (this.pageId === 'watchlist') {
      this.currentInterval = store.get('current-interval');
    } else {
      store.set('current-interval', '1m');
    }
    this.renderHtml();
    this.$stockName = $('#chartbox-stock-name');
    this.$stockSymbol = $('#chartbox-stock-symbol');
    this.$changePercentContainer = $('#chartbox-change-percent');
    this.$latestPriceContainer = $('#chartbox-latest-price');
    this.renderHeader();
    this.renderChart();
  }


  // RENDER HTML LAYOUT
  renderHtml() {
    const html = `
      <div>
        <div class="chartbox-header-top-row">
          <div class="chartbox-name-container">
            <h2 id="chartbox-stock-name" class="chartbox-stock-name"></h2>
            <h3 id="chartbox-stock-symbol" class="chartbox-stock-symbol"></h3>
          </div>
          <div class="chartbox-watch-intervals-container">
            <div id="chartbox-watch-button" class="chartbox-watchbutton"></div>
            <div id="chartbox-intervals-container" class="chart-intervals-container"></div>
          </div>
        </div>
        <div class="flex-hori-start" style="height: 32px;">
          <div id="chartbox-latest-price" class="chartbox-latest-price"></div>
          <div id="chartbox-change-percent" class="chartbox-change-percent"></div>
        </div>
      </div>
      <div>
        <canvas id="chartbox-chart" class="chart-container" width="900" height="320"></canvas>
      </div>
    `;

    this.$container.empty();
    this.$container.append(html);
  }


  // RENDER HEADER INFO
  renderHeader() {
    const storeData = store.get(this.symbol).quote;
    const companyName = trimString(storeData.companyName, 36);
    const changePercent = storeData.changePercent.toFixed(2);
    const latestPrice = storeData.latestPrice;
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


  // RENDER CHART
  renderChart() {
    this.currentInterval = store.get('current-interval');
    const storedData = store.get(this.symbol).chart[this.currentInterval];
    const companyName = store.get(this.symbol).quote.companyName;
    
    this.intervalsBar = new Intervals('#chartbox-intervals-container', this.symbol, '#chartbox-chart');
    this.watchButton = new WatchButton('#chartbox-watch-button', this.symbol, companyName);
  }


  // GET SPECIFIC DATA ARRAY OF COMPANY (STOCK OPEN PRICES, DATES, ETC.)
  getChartData(data, key) {
    return data.map((day) => {
      if (key === 'date') {
        const fullDate = day[key].split('-');
        let [ year, month, date ] = fullDate;
        month = month.replace(/^0+/, ''); // Remove leading '0'
        
        return `${month}-${date}-${year}`;
      } else {
        return day[key];
      }
    });
  }
}

export default ChartBox;