import $ from 'jquery';
import store from 'store2';
import axios from 'axios';
import Graph from './graph';

class GraphCard {
  constructor(containerId, symbol) {
    this.container = $(containerId);
    this.symbol = symbol;

    this.renderCard();
    this.$cardHeader = this.container.find('.graphCard-header');
    this.$cardGraphContainer = $('.graphCard-graph-container');
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
    this.fetchGraphPoints();
  }


  // FETCH DATA FOR SYMBOL
  fetchGraphPoints() {
    axios.all([
      axios.get(`https://cloud.iexapis.com/v1/stock/${this.symbol}/batch?types=quote,chart&range=1m&token=pk_a12f90684f2a44f180bcaeb4eff4086d`),
      axios.get(`https://cloud.iexapis.com/v1/stock/market/sector-performance?token=pk_a12f90684f2a44f180bcaeb4eff4086d`),
    ])
    .then(axios.spread((data, sector) => {
      // console.log(sector);
      this.renderHeader(data);
      this.renderGraph(data);
    }))
    .catch(error => console.log(error))
  }


  // RENDER STOCK HEADER INFO
  renderHeader(data) {
    const symbol = data.data.quote.symbol;
    const company = data.data.quote.companyName;
    const latestPrice = data.data.quote.latestPrice;

    const html = `
      <div>
        <h2 class="graphCard-company">${company}</h2>
        <h3 class="graphCard-symbol">${symbol}</h3>
      </div>
    `;

    this.$cardHeader.append(html);
  }


  // RENDER GRAPH IN CARD
  renderGraph(data) {
    const graphPoints = data.data.chart;
    const prices = this.getHistoricalData(graphPoints, 'close');
    let dates = this.getHistoricalData(graphPoints, 'date');
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

export default GraphCard;