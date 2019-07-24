import $ from 'jquery';
import store from 'store2';
import axios from 'axios';
import Graph from './graph';
import { URL_BASE, API_TOKEN } from '../const';

class GraphCard {
  constructor(containerId, symbol) {
    this.container = $(containerId);
    this.symbol = symbol;
    this.interval;
    this.renderCard();
    this.$cardHeader = this.container.find('.graphCard-header');
    this.$cardGraphContainer = $('.graphCard-graph-container');
    this.renderData();
  }


  // RENDER HTML FOR CARD
  renderCard() {
    const cardHtml = `
      <div class="graphCard-small box">
        <div class="graphCard-header"></div>
        <div class="graphCard-graph-container">
          <canvas id="graphCard-graph-${this.symbol}" width="300" height="140"></canvas>  
        </div>
      </div>
    `;

    this.container.append(cardHtml);
  }

  renderData() {
    if (store.get(this.symbol) !== null) {
      this.renderHeader();
      this.renderChart();
    } else {
      this.fetchGraphPoints();
    }
  }


  // FETCH DATA FOR SYMBOL
  fetchGraphPoints() {
    axios.all([
      axios.get(`${URL_BASE}/${this.symbol}/batch?types=quote,news,chart&last=5&range=1m&token=${API_TOKEN}`)
    ])
    .then((response) => {
      const data = response[0].data;
      const dataToStore = {
        chart: {
          '1m': data.chart
        },
        news: data.news,
        quote: data.quote
      }
      store.set(this.symbol, dataToStore);
    })
    .catch(error => console.log(error))
    .then(() => {
      this.renderHeader();
      this.renderChart();
    })
  }


  // RENDER STOCK HEADER INFO
  renderHeader() {
    const storedData = store.get(this.symbol);
    const symbol = storedData.quote.symbol;
    const company = storedData.quote.companyName;
    const latestPrice = storedData.quote.latestPrice;

    const html = `
      <div>
        <h2 class="graphCard-company">${company}</h2>
        <h3 class="graphCard-symbol">${symbol}</h3>
      </div>
    `;

    this.$cardHeader.append(html);
  }


  // RENDER CHART IN CARD
  renderChart() {
    const storedData = store.get(this.symbol);
    const graphPoints = storedData.chart['1m'];
    const prices = this.getChartData(graphPoints, 'close');
    let dates = this.getChartData(graphPoints, 'date');
    dates = dates.map((date) => {
      return `${date.split('-')[0]}-${date.split('-')[1]}`;
    });

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 40,
          bottom: 0,
        }
      },
      legend: {
        display: false,
        labels: {
          // This more specific font property overrides the global property
          fontColor: 'black',
          fontFamily: 'Montserrat, sans-serif',
        }
      },
      scales: {
        xAxes: [{
          gridLines : {
            color: 'rgba(255,255,255,0.03)',
            display : false,
            tickMarkLength: 10
          },
          ticks: {
            display: false,
            fontColor: '#B0BEC5',
            fontFamily: 'Mukta, sans-serif',
            fontStyle: 'normal',
            autoSkip: true,
            maxTicksLimit: 6
          }
        }],
        yAxes: [{
          position: 'right',
          gridLines: {
            color: 'rgba(255,255,255,0.03)',
            drawBorder: false,
            zeroLineColor: 'rgba(0,0,0,0.04)',
            tickMarkLength: 0
          },
          ticks: {
            beginAtZero: false,
            fontColor: '#B0BEC5',
            fontFamily: 'Mukta, sans-serif',
            fontStyle: 'normal',
            padding: 15
          }
        }]
      }
    };

    new Graph(`#graphCard-graph-${this.symbol}`, prices, dates, 'line', options);
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
}

export default GraphCard;