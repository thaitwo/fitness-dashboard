import $ from 'jquery';
import store from 'store2';
import { formatLargeNumber, formatNumberWithCommas } from '../../utility/utility.js';

class KeyStats {
  constructor(containerId, symbol) {
    this.$container = $(containerId);
    // If data for stock exists in localStorage, retrieve it.
    if (store.get(symbol).quote !== null) {
      this.data = store.get(symbol).quote;
      this.close = this.data.close || '--';
      this.open = this.data.open || '--';
      this.high = this.data.high || '--';
      this.low = this.data.low || '--';
      this.marketCap = formatLargeNumber(this.data.marketCap);
      this.peRatio = this.data.peRatio;
      this.wk52High = this.data.week52High;
      this.wk52Low = this.data.week52Low;
      this.volume = formatNumberWithCommas(Math.round(this.data.latestVolume));
    }

    this.renderKeyStats();
  }


  // RENDER KEY STATS FOR STOCKS
  renderKeyStats() {

    const keyStatsHTML = `
      <h2 class="text-header">Key Statistics</h2>
      <table id="key-stats-table">
        <tr>
          <td>Close</td>
          <td>${this.close}</td>
        </tr>
        <tr>
          <td>Open</td>
          <td>${this.open}</td>
        </tr>
        <tr>
          <td>High</td>
          <td>${this.high}</td>
        </tr>
        <tr>
          <td>Low</td>
          <td>${this.low}</td>
        </tr>
        <tr>
          <td>Market Cap</td>
          <td>${this.marketCap}</td>
        </tr>
        <tr>
          <td>P/E Ratio</td>
          <td>${this.peRatio}</td>
        </tr>
        <tr>
          <td>52 Wk High</td>
          <td>${this.wk52High}</td>
        </tr>
        <tr>
          <td>52 Wk Low</td>
          <td>${this.wk52Low}</td>
        </tr>
        <tr>
          <td>Volume</td>
          <td>${this.volume}</td>
        </tr>
      </table>
    `;

    this.$container.empty();
    this.$container.append(keyStatsHTML);
  }
}

export default KeyStats;