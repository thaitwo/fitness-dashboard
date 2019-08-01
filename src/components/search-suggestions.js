import $ from 'jquery';
import axios from 'axios';
import Navigo from 'navigo';

class Suggestions {
  constructor(searchBoxId) {
    this.$searchBox = $(searchBoxId);
    this.value;
    this.currentFocus = -1;
    this.$searchSuggestions = $('#search-suggestions');
    this.ENTER_KEY = 13;
    this.ESCAPE_KEY = 27;
    this.router = new Navigo(null, true);
    this.getSearchValue();
    this.hideSuggestionsOnOutsideClick();
  }


  // FETCH SEARCH SUGGESTIONS
  fetchSuggestions() {
    axios.get(`https://ticker-2e1ica8b9.now.sh/keyword/${this.value}`)
    .then((response) => {
      this.renderSuggestions(response.data);
      if (!response.data.length) {
        this.$searchBox.removeClass('active');
        this.$searchSuggestions.removeClass('active');
      }
    })
    .catch(error => console.log(error))
  }


  // DISPLAY SUGGESTIONS DROPDOWN
  renderSuggestions(items) {
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
    // When user types input
    this.$searchBox.keydown((event) => {
      const keyPressed = event.which || event.keyCode;
      this.value = event.target.value;
      const arrowKeyCodes = [37, 38, 39, 40];
      const isArrowKeys = arrowKeyCodes.indexOf(keyPressed) > -1;

      /* Fetch suggestions only if value is not empty and keypress is not an arrow key.
      We need to make sure it's not an arrow key because we need to use the arrow keys to
      navigate the suggestions list. Otherwise pressing any arrow key will put the focus
      back in the search box, thus preventing the navigation of suggestion items.
      Also, the keyPress must not be the 'Enter' button because this triggers the suggestion
      container to be visible after user selects a suggestion item by pressing 'Enter'.
      */
      if (this.value && !isArrowKeys && keyPressed !== this.ENTER_KEY) {
        this.fetchSuggestions(this.value);
      }

      this.toggleSuggestionsVisibility();

      switch (keyPressed) {
        case 40:
          this.currentFocus++;
          console.log(this.currentFocus);
          this.addActiveClass();
          break;
        case 38:
          this.currentFocus--;
          console.log(this.currentFocus);
          this.addActiveClass();
          break;
        case 13:
          event.preventDefault();
          if (this.currentFocus > -1) {
            /* In order to be able to select from suggestions list with arrow keys,
            the value of 'this.currentFocus' has to be at least 0. Therefore, only
            simulate a click event if the suggestions list is being actively navigated.
            */
            this.$searchSuggestions[0].children[this.currentFocus].click();
          }
          break;
        default:
          break;
      }
    })

    // When user selects a suggestion
    this.$searchSuggestions.on('click', 'div', (event) => {
      event.preventDefault();
      this.value = event.currentTarget.children[0].innerText;
      this.router.navigate(`stocks/${this.value}`);
      this.$searchBox.val('');
      this.toggleSuggestionsVisibility();
    })
  }


  // SPECIFY THE ACTIVE SUGGESTION
  addActiveClass() {
    this.removeActiveClass();
    const suggestionItems = this.$searchSuggestions[0].children;

    if (this.currentFocus >= suggestionItems.length) {
      this.currentFocus = 0;
    }
    if (this.currentFocus < 0) {
      this.currentFocus = suggestionItems.length - 1;
    }

    $(this.$searchSuggestions[0].children[this.currentFocus]).addClass('suggestions-active');
  }

  
  // REMOVE ACTIVE CLASS FROM SUGGESTION ITEMS
  removeActiveClass() {
    $(this.$searchSuggestions[0].children).removeClass('suggestions-active');
  }


  // DISPLAY OR HIDE SUGGESTIONS
  toggleSuggestionsVisibility() {
    this.value = this.$searchBox.val();

    if (this.value === '') {
      this.$searchSuggestions.empty();
      this.$searchBox.removeClass('active');
      this.$searchSuggestions.removeClass('active');
    } else {
      this.$searchBox.addClass('active');
      this.$searchSuggestions.addClass('active');
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
        that.$searchSuggestions.removeClass('active');
      }
    });
  }
}

export default Suggestions;