import $ from 'jquery';
import Navigo from 'navigo';
import axios from 'axios';
import { URL_BASE, API_TOKEN } from '../const';

class Search {
  constructor() {
    this.$searchBox = $('#search-box');
    this.$searchSuggestions = $('#search-suggestions');
    this.value;
    this.currentFocus = 0;
    this.ENTER_KEY = 13;
    this.ESCAPE_KEY = 27;
    this.getSearchValue();
    this.router = new Navigo(null, true);
    this.hideSuggestionsOnOutsideClick();
  }


  // FETCH SEARCH SUGGESTIONS
  activateSuggestions(value) {
    axios.get(`https://ticker-2e1ica8b9.now.sh/keyword/${value}`)
    .then((response) => {
      this.renderSuggestionItems(response.data);
    })
    .catch(error => console.log(error))
  }


  // DISPLAY SUGGESTIONS DROPDOWN
  renderSuggestionItems(items) {
    const suggestions = items.slice(0,10).map((suggestion) => {
      return `
        <div>
          <span class="symbol">${suggestion.symbol}</span>
          <span class="name">${suggestion.name}</span>
        </div>
      `;
    });

    this.$searchSuggestions.empty();
    this.$searchSuggestions.append(suggestions);
  }


  // RETREIVE VALUE FROM SEARCH AND CREATE NEW URL
  getSearchValue() {
    // When user selects a suggestion
    this.$searchSuggestions.on('click', 'div', (event) => {
      event.preventDefault();
      this.value = event.currentTarget.children[0].innerText;
      this.router.navigate(`stocks/${this.value}`);
      this.$searchBox.val('');
      this.toggleSuggestionsVisibility();
    })

    // When user types input and presses 'Enter'
    this.$searchBox.keyup((event) => {
      const keyPressed = event.which || event.keyCode;
      this.value = event.target.value;

      if (this.value !== '' && keyPressed !== 40) {
        this.activateSuggestions(this.value);
      }

      this.toggleSuggestionsVisibility();

      if (keyPressed === 40) {
        
        // console.log(this.$searchSuggestions[0].children);
        $(this.$searchSuggestions[0].children[0]).addClass('suggestions-active');
      }

      if (keyPressed === this.ENTER_KEY) {
        // Add routing to URL. Router will read URL and create new Stock page.
        this.router.navigate(`stocks/${this.value}`);
        // Clear search box
        this.$searchBox.val('');
      }
    })
  }


  // DISPLAY OR HID SUGGESTIONS
  toggleSuggestionsVisibility() {
    this.value = this.$searchBox.val();

    if (this.value === '') {
      this.$searchSuggestions.empty();
      this.$searchBox.removeClass('active');
    } else {
      this.$searchBox.addClass('active');
    }
  }


  // HIDE SUGGESTIONS
  hideSuggestionsOnOutsideClick() {
    const that = this;

    $(document).on('click', function(event) {
      const suggestionsContainer = $(event.target).closest('#search-suggestions').length;
      const searchBox = $(event.target).closest('#search-box').length;

      // If it is not the suggestions and the search box, close suggestions
      if (!suggestionsContainer && !searchBox) {
        that.$searchSuggestions.empty();
        that.$searchBox.removeClass('active');
      }
    });

    this.$searchBox.focus(function(event) {
      const value = $(this).val();

      if (value.length > 0) {
        that.$searchBox.addClass('active');
        that.activateSuggestions(this.value);
      }
    })
  }
}

export default Search;