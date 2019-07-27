import $ from 'jquery';
import Navigo from 'navigo';
import axios from 'axios';
import Suggestions from './search-suggestions';

class Search {
  constructor(containerId) {
    this.$container = $(containerId);
    this.renderHtml();
    this.$searchBox = $('#search-box');
    this.$searchSuggestions = $('#search-suggestions');
    this.router = new Navigo(null, true);
    this.value;
    this.ENTER_KEY = 13;
    this.ESCAPE_KEY = 27;
    // this.getInputAndCreateUrl();
    new Suggestions('#search-box');
  }

  renderHtml() {
    const html = `
      <form id="search-form">
        <input type="text" id="search-box" placeholder="Search">
        <div id="search-suggestions"></div>
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