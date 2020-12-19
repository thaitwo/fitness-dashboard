import $ from 'jquery';
import Navigo from 'navigo';
import Suggestions from './search-suggestions';

class SearchAddStock {
  constructor(containerId) {
    this.containerId = containerId.substring(1);
    this.$container = $(containerId);
    this.renderHtml();
    this.$searchBox = $(`#searchFormAddStock`);
    this.$searchSuggestions = $(`#search-suggestions`);
    this.$addStockButton = $('#addStockButton');
    this.$addStockContainer = $('#addStockContainer');
    this.router = new Navigo(null, true);
    this.value;
    this.ENTER_KEY = 13;
    this.ESCAPE_KEY = 27;

    new Suggestions(`#searchBoxSecondary`, `#searchSuggestionsSecondary`, 'secondary');
    // this.hideSearchOnOutterClick();
  }

  renderHtml() {

    const html = `
      <form id="searchFormAddStock" class="search-form isHidden">
        <input type="text" id="searchBoxSecondary" class="search-box" placeholder="Search companies">
        <div id="searchSuggestionsSecondary" class="search-suggestions"></div>
      </form>
    `;

    this.$container.append(html);
  }


  // RETREIVE VALUE FROM SEARCH AND CREATE NEW URL
  getInputAndCreateUrl() {
    // When user types input and presses 'Enter'
    this.$searchBox.keyup((event) => {
      const keyPressed = event.which || event.keyCode;
      this.value = event.target.value;

      if (keyPressed === this.ENTER_KEY && !this.$searchSuggestions.hasClass('active')) {
        // Add routing to URL. Router will read URL and create new Stock page.
        this.router.navigate(`stocks/${this.value}`);
        // Clear search box
        this.$searchBox.val('');
      }
    })
  }


  // HIDE SUGGESTIONS
  hideSearchOnOutterClick() {
    const that = this;
    
    $(document).on('click', function(event) {
      const searchBox = $(event.target).closest(`#searchFormAddStock`).length;
      const addStockButton = $(event.target).closest('#addStockButton').length;

      // If the click is not on the suggestions and the search box, close suggestions
      if (!addStockButton && !searchBox) {
        that.$searchBox.addClass('isHidden');
        that.$addStockButton.removeClass('isHidden');
        that.$addStockContainer.removeClass('fullWidth');
      }
    });
  }
}

export default SearchAddStock;