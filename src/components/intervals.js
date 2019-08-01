import $ from 'jquery';
import store from 'store2';
import axios from 'axios';
import Graph from './graph.js';
import { URL_BASE, API_TOKEN } from '../const.js';

class Intervals {
  constructor(intervalsContainerId, symbol, chartContainerId) {
    this.$intervalsContainer = $(intervalsContainerId);
    this.$chartContainer = $(chartContainerId);
    this.chartCanvas = document.getElementById(chartContainerId.substring(1)); // Used to clear initial canvas. See updateIntervalData()
    this.$loadingIcon = $('.icon-loading');
    this.symbol = symbol;
    this.chart;
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

      /* The chart canvas is being cleared in this specific place and order
      to allow the display of the spinning icon while new data is being fetched,
      without having both the icon and the old chart being displayed simulataneously.
      On the initial load, that.chart will be null so in this case, we have to
      clear the chart canvas by using JS's clearRect() method. Once an interval
      selected, that.chart will now equal a new Chart component which includes 
      the destroy() method that we can use to empty the chart canvas.
      */
      if (!that.chart) {
        const context = that.chartCanvas.getContext('2d');
        context.clearRect(0, 0, that.chartCanvas.width, that.chartCanvas.height);
      } else if (that.chart) {
        that.chart.destroy();
      }

      that.updateIntervals(this);
      that.renderChart();
    });
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
      
      this.chart = new Graph(this.$chartContainer, prices, dates);
    }
    // if it doesn't exist, make data request
    else {
      this.fetchChartData();
    }
  }


  // FETCH NEW DATA FOR SELECTED INTERVAL
  fetchChartData() {
    this.$loadingIcon.addClass('is-visible');
    
    axios.get(`${URL_BASE}/${this.symbol}/chart/${this.selectedInterval}?token=${API_TOKEN}`)
    .then((response) => {
      const storedData = store.get(this.symbol);
      storedData.chart[this.selectedInterval] = response.data;
      store.set(this.symbol, storedData);

      if (response.status == 200) {
        this.renderChart();
      }
    })
    .catch(error => console.log(error))
    .then(() => {
      this.$loadingIcon.removeClass('is-visible');      
    })
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


  // UPDATE STYLEING FOR SELECTED INTERVAL
  updateIntervals(selectedInterval) {
    const $selectedInterval = $(selectedInterval);

    this.intervalsItems.removeClass('selected');
    $selectedInterval.addClass('selected');
  }
}

export default Intervals;