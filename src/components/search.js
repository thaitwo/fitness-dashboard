import $ from 'jquery';

class Search {
  constructor() {
    this.$searchBox = $('#search-box');
    this.ENTER_KEY = 13;
    this.ESCAPE_KEY = 27;
    this.getSearchValue();
  }


  // RETREIVE VALUE FROM SEARCH BOX
  getSearchValue() {
    const that = this;

    this.$searchBox.on('keypress', function(event) {
      const keyPressed = event.which || event.keyCode;

      if (keyPressed === that.ENTER_KEY) {
        const value = event.target.value.trim();
        console.log(value);
      }
    })
  }
}

export default Search;