import $ from 'jquery';
import store from 'store2';
import { getPageId } from '../../utility/utility';
import Search from './search.js';

class AddStockButton {
  constructor(buttonContainerId) {
    this.$buttonContainer = $(buttonContainerId);
    this.$button;

    this.renderHTML();
    this.openSearchOnClick();
  }

  renderHTML() {
    let html = `
      <button id="addStockButton" class="buttonGhost">Add</button>
    `;

    this.$buttonContainer.append(html);
    this.$button = $('#addStockButton');


  }

  openSearchOnClick() {
    this.$button.on('click', function(event) {
      event.stopPropagation();

      new Search('#addStockContainer');
    })
  }

  addToWatchlist() {

  }
}

export default AddStockButton;