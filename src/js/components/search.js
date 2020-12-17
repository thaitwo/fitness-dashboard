import $ from 'jquery';
import Navigo from 'navigo';
import Suggestions from './search-suggestions';

class Search {
  constructor(containerId) {
    this.containerId = containerId.substring(1);
    this.$container = $(containerId);
    this.renderHtml();
    this.$searchBox = $(`#${this.containerId}-search-box`);
    this.$searchSuggestions = $(`#${this.containerId}-search-suggestions`);
    this.router = new Navigo(null, true);
    this.value;
    this.ENTER_KEY = 13;
    this.ESCAPE_KEY = 27;
    // this.getInputAndCreateUrl();
    new Suggestions(`#${this.containerId}-search-box`, `#${this.containerId}-search-suggestions`);
  }

  renderHtml() {
    const html = `
      <form id="${this.containerId}-search-form" class="search-form">
        <input type="text" id="${this.containerId}-search-box" class="search-box" placeholder="Search companies">
        <div id="${this.containerId}-search-suggestions" class="search-suggestions"></div>
      </form>
    `;

    this.$container.empty();
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
}

export default Search;