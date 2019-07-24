import $ from 'jquery';
import store from 'store2';
import axios from 'axios';
import Graph from './graph.js';

class Intervals {
  constructor(intervalsContainerId, symbol, chartContainer) {
    this.$intervalsContainer = $(intervalsContainerId);
    this.symbol = symbol;
    this.$chartContainer = $(chartContainer);
    this.graph;
    this.selectedInterval;
    this.renderIntervals();

    this.intervalsList = $('#time-intervals');
    this.intervalsItems = this.intervalsList.find('li');
    this.updateIntervalData();
  }

  
  // INSERT INTERVALS LIST IN POPUP
  renderIntervals() {
    const html = `
      <ul id="time-intervals">
        <li class="selected">1M</li>
        <li>3M</li>
        <li>6M</li>
        <li>YTD</li>
        <li>1Y</li>
        <li>2Y</li>
        <li>5Y</li>
        <li>Max</li>
      </ul>
    `;

    this.$intervalsContainer.html(html);
  }


  // CLICK HANDLER TO UPDATE GRAPH
  updateIntervalData() {
    const that = this;

    this.intervalsList.on('click', 'li', function(event) {
      const $this = $(this);
      const selectedInterval = $this.text().toLowerCase();
      that.selectedInterval = selectedInterval;

      that.updateIntervals(this);
      that.renderChart();
    });
  }


  // FETCH NEW DATA FOR SELECTED INTERVAL
  fetchChartData() {
    axios.get(`https://cloud.iexapis.com/v1/stock/${this.symbol}/chart/${this.selectedInterval}?token=pk_a12f90684f2a44f180bcaeb4eff4086d`)
    .then((response) => {
      const storedData = store.get(this.symbol);
      storedData.chart[this.selectedInterval] = response.data;
      store.set(this.symbol, storedData);
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      this.renderChart();
    })
  }


  // RENDER CHART
  renderChart() {
    const storedData = store.get(this.symbol);

    // if historical prices for selected interval does exist in localStorage
    if (this.selectedInterval in storedData.chart) {
      const storedData = store.get(this.symbol).chart[this.selectedInterval];
      // get closing prices for stock
      const prices = this.getChartData(storedData, 'close');
      // get dates for closing prices
      const dates = this.getChartData(storedData, 'date');
      
      // delete graph if any exists and create new graph
      if (this.graph) {
        this.graph.destroy();
      }
      this.graph = new Graph(this.$chartContainer, prices, dates);
    }
    // if it doesn't exist, make data request
    else {
      this.fetchChartData();
    }
  }


  // GET SPECIFIC DATA ARRAY OF COMPANY (STOCK OPEN PRICES, DATES, ETC.)
  getChartData(data, key) {
    // console.log(data);
    return data.map((day) => {
      if (key === 'date') {
        const date = day[key].split('-');
        return `${date[1].replace(/^0+/, '')}-${date[2]}-${date[0]}`;
      } else {
        return day[key];
      }
    });
  }


  // UPDATE STYLEING FOR SELECTED INTERVAL
  updateIntervals(selectedInterval) {
    const $selectedInterval = $(selectedInterval);

    this.intervalsItems.removeClass('selected');
    $selectedInterval.addClass('selected');
  }
}

export default Intervals;