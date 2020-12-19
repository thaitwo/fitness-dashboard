import $ from 'jquery';
import store from 'store2';
import { getPageId } from '../../utility/utility';
import SearchAddStock from './searchAddStock';

class AddStockButton {
  constructor(buttonContainerId) {
    this.$buttonContainer = $(buttonContainerId);
    this.$button;

    this.renderHTML();
    this.$searchForm = $('#searchFormAddStock');
    this.openSearchOnClick();
  }

  renderHTML() {
    let html = `
      <button id="addStockButton" class="buttonGhost">Add</button>
    `;

    this.$buttonContainer.append(html);
    this.$button = $('#addStockButton');
    new SearchAddStock('#addStockContainer');
  }

  openSearchOnClick() {
    this.$button.on('click', (event) => {
      // event.stopPropagation();
      // console.log(this.$button[0].id);

      $('#addStockContainer').addClass('fullWidth');
      this.$button.addClass('isHidden');
      this.$searchForm.removeClass('isHidden');
      document.getElementById('searchBoxSecondary').focus();
    })
  }

  addToWatchlist() {

  }
}

export default AddStockButton;