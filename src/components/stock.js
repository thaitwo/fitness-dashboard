import $ from 'jquery';
import store from 'store2';
import axios from 'axios';

class Stock {
  constructor(symbol) {
    this.symbol = symbol;
    this.$canvas = $('.canvas');
  }

  renderHtmlLayout() {
    const html = `
      <div>
        <div>
          <div class="">
            <div class="box">
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
                  <div id="singlestock-latestprice"></div>
                  <div id="singlestock-changepercent"></div>
                </div>
              </div>
              <canvas id="singlestock-chart" width="900" height="320"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;
  }


  renderChart() {

  }

  
}

export default Stock;