import $ from 'jquery';
import store from 'store2';
import axios from 'axios';
import ChartBox from './chartbox';

class Stock {
  constructor(symbol) {
    this.symbol = symbol;
    this.$canvas = $('.canvas');
    this.renderHtml();

    // If data exists in local storage...
    if (store.get(this.symbol) !== null) { 
      new ChartBox('#singlestock-chart-container', this.symbol);
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
      store.set(symbol, response.data);
      new ChartBox('#singlestock-chart-container', this.symbol);
    })
    .catch((error) => {
      console.log(error);
    })
  }
}

export default Stock;