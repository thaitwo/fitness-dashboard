import $ from 'jquery';
import store from 'store2';
import axios from 'axios';
import ChartBox from './chartbox';
import KeyStats from './keystats.js';
import News from './news.js';

class Stock {
  constructor(symbol) {
    this.symbol = symbol;
    this.$canvas = $('.canvas');
    this.interval = '1m';
    this.renderHtml();

    // If data exists in local storage...
    if (store.get(this.symbol) !== null) { 
      new ChartBox('#singlestock-chart-container', this.symbol);
      new KeyStats('#singlestock-keystats-container', this.symbol);
      new News('#singlestock-news-container', [this.symbol], this.symbol);
    }
    // If data doesn't exist...
    else {
      this.fetchData();
    }
  }


  // RENDER HTML LAYOUT
  renderHtml() {
    const html = `
      <div>
        <div>
          <div>
            <div id="singlestock-chart-container" class="box"></div>
          </div>
          <div class="stock-summary-container">
            <div id="singlestock-keystats-container" class="box margin-right"></div>
            <div id="singlestock-news-container" class="news-container box">
            </div>
          </div>
        </div>
      </div>
    `;

    this.$canvas.empty();
    this.$canvas.append(html);
  }


  // FETCH DATA WITH AJAX
  fetchData() {
    axios.get(`https://cloud.iexapis.com/v1/stock/${this.symbol}/batch?types=quote,news,chart&range=1m&token=pk_a12f90684f2a44f180bcaeb4eff4086d`)
    .then((response) => {
      const symbol = this.symbol.toUpperCase();
      const dataToStore = {
        chart: {
          [this.interval]: response.data.chart
        },
        news: response.data.news,
        quote: response.data.quote,
        time: Date.now()
      };
      store.set(symbol, dataToStore);
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      new ChartBox('#singlestock-chart-container', this.symbol);
      new KeyStats('#singlestock-keystats-container', this.symbol);
      new News('#singlestock-news-container', [this.symbol], this.symbol);
    })
  }
}

export default Stock;