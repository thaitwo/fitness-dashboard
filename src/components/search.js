import $ from 'jquery';
import Navigo from 'navigo';

class Search {
  constructor() {
    this.$searchBox = $('#search-box');
    this.ENTER_KEY = 13;
    this.ESCAPE_KEY = 27;
    this.getSearchValue();
    this.router = new Navigo(null, true);
  }


  // RETREIVE VALUE FROM SEARCH BOX
  getSearchValue() {
    this.$searchBox.keypress((event) => {
      const keyPressed = event.which || event.keyCode;
      const value = event.target.value.trim();

      if (keyPressed === this.ENTER_KEY) {
        event.preventDefault();
        // Add routing to URL. Router will read URL and create new Stock page.
        this.router.navigate(`stocks/${value}`);
        // Clear search box
        this.$searchBox.val('');
      }
    })
  }
}

export default Search;