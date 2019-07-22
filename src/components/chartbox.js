import $ from 'jquery';
import store from 'store2';
import { trimString } from '../helpers/helpers.js';

class ChartBox {
  constructor(containerId, symbol) {
    this.$container = $(containerId);
    this.symbol = symbol;
    this.graph;
    this.interval = '1m';
    this.renderHtml();
    this.$stockName = $('#singlestock-chart-name');
    this.$stockSymbol = $('#singlestock-chart-symbol');
    this.$changePercentContainer = $('#singlestock-chart-changepercent');
    this.$latestPriceContainer = $('#singlestock-chart-latestprice');
    this.renderHeader();
    this.renderGraph();
  }


  // RENDER HTML LAYOUT
  renderHtml() {
    const html = `
      <div class="singlestock-chart-header">
        <div id="singlestock-chart-header-toprow">
          <div class="singlestock-chart-name-container">
            <h2 id="singlestock-chart-name"></h2>
            <h3 id="singlestock-chart-symbol"></h3>
          </div>
          <div id="singlestock-chart-watch-intervals">
            <div id="singlestock-chart-watch-button"></div>
            <div id="singlestock-intervals-container"></div>
          </div>
        </div>
        <div class="flex-hori-start" style="height: 32px;">
          <div id="singlestock-chart-latestprice"></div>
          <div id="singlestock-chart-changepercent"></div>
        </div>
      </div>
      <canvas id="singlestock-chart" width="900" height="320"></canvas>
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


  // RENDER GRAPH
  renderGraph() {
    const storedData = store.get(this.symbol).chart[this.interval];
    // get closing prices for stock
    const prices = this.getHistoricalData(storedData, 'close');
    // get dates for closing prices
    const dates = this.getHistoricalData(storedData, 'date');
    
    // delete graph if any exists and create new graph
    if (this.graph) {
      this.graph.destroy();
    }
    this.graph = new Graph('#singlestock-chart', prices, dates);
    this.intervalsBar = new Intervals(this.$intervalsContainer, this.symbol, '#singlestock-chart');
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
}

export default ChartBox;