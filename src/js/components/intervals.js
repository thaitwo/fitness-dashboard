import $ from 'jquery';
import store from 'store2';
import axios from 'axios';
import Graph from './graph.js';
import { URL_BASE, API_TOKEN } from '../../const.js';
import { getPageId } from '../../utility/utility.js';

/* Any chart that is displayed along with a list of intervals will be created
by this Intervals component. This allows this Intervals component to have
reference to the chart so that it can update the chart data instead of having
to create new chart.
*/

class Intervals {
  constructor(intervalsContainerId, symbol, chartContainerId) {
    this.chartContainerId = chartContainerId;
    this.$intervalsContainer = $(intervalsContainerId);
    this.$chartContainer = $(chartContainerId);
    this.chartCanvas = document.getElementById(chartContainerId.substring(1)); // Used to clear initial canvas. See updateIntervalData()
    this.symbol = symbol;
    this.pageId = getPageId();
    this.chart;
    this.currentInterval;
    /* Only save the current interval when on the Watchlist page since this
    is the only page where you users can shuffle through a list of stocks.
    For any other page, just reset the current interval to '1m'. 
    */
    if (this.pageId === 'watchlist') {
      this.currentInterval = store.get('current-interval');
    } else {
      store.set('current-interval', '1m');
    }
    this.renderChart();
    this.renderIntervals();
    this.$intervalsList = $('#time-intervals');
    this.$intervalsItems = this.$intervalsList.find('li');
    this.addActiveClass();
    this.updateIntervalData();
  }

  
  // INSERT INTERVALS LIST IN POPUP
  renderIntervals() {
    const html = `
      <ul id="time-intervals">
        <li id="1m">1m</li>
        <li id="3m">3m</li>
        <li id="6m">6m</li>
        <li id="ytd">ytd</li>
        <li id="1y">1y</li>
        <li id="2y">2y</li>
        <li id="5y">5y</li>
        <li id="max">max</li>
      </ul>
    `;

    this.$intervalsContainer.html(html);
  }


  // CLICK HANDLER TO UPDATE GRAPH
  updateIntervalData() {
    const that = this;

    this.$intervalsList.on('click', 'li', function(event) {
      const selectedInterval = $(this).attr('id');
      that.currentInterval = selectedInterval;
      store.set('current-interval', selectedInterval);

      that.addActiveClass();
      that.renderChart();
    });
  }


  // RENDER CHART
  renderChart() {
    const storedData = store.get(this.symbol);
    this.currentInterval = store.get('current-interval');

    // if historical prices for selected interval does exist in localStorage
    if (this.currentInterval in storedData.chart) {
      const storedData = store.get(this.symbol).chart[this.currentInterval];
      // get closing prices for stock
      const prices = this.getChartData(storedData, 'close');
      // get dates for closing prices
      const dates = this.getChartData(storedData, 'date');

      // If a chart already exists, just update chart with new data
      if (this.chart) {
        this.chart.updateChart(prices, dates);
      }
      // Otherwise, if no chart exists, create a new one.
      else {
        this.chart = new Graph(this.chartContainerId, prices, dates);
      }
    }
    // if it doesn't exist, make data request
    else {
      this.fetchChartData();
    }
  }


  // FETCH NEW DATA FOR SELECTED INTERVAL
  fetchChartData() {
    this.currentInterval = store.get('current-interval');
    
    axios.get(`${URL_BASE}/${this.symbol}/chart/${this.currentInterval}?token=${API_TOKEN}`)
    .then((response) => {
      const storedData = store.get(this.symbol);
      storedData.chart[this.currentInterval] = response.data;
      store.set(this.symbol, storedData);

      if (response.status == 200) {
        this.renderChart();
      }
    })
    .catch(error => console.log(error))
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


  // ADD ACTIVE CLASS TO SELECTED INTERVAL
  addActiveClass() {
    this.currentInterval = store.get('current-interval');
    const $selectedInterval = this.$intervalsList.find(`li#${this.currentInterval}`);
    this.$intervalsItems.removeClass('selected');
    $selectedInterval.addClass('selected');
  }
}

export default Intervals;