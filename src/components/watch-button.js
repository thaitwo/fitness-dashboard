import $ from 'jquery';
import store from 'store2';

class WatchButton {
  constructor(containerId, symbol) {
    this.$buttonContainer = $(containerId);
    this.symbol = symbol;
    this.watchlist = store.get('watchlist') || [];
    this.isInWatchlist = this.isInWatchlist();

    this.insertButton();
    this.$watchButton = $('#watch-button');
    this.addOrRemoveFromWatchlistHandler();
  }


  // INSERT BUTTON IN DOM
  insertButton() {
    let isWatched,
        label,
        iconClass;

    if (this.isInWatchlist) {
      isWatched = 'isWatched';
      label = 'Unwatch';
      iconClass = 'fa-eye-slash';
    } else {
      isWatched = '';
      label = 'Watch';
      iconClass = 'fa-eye';
    }

    const html = `
      <button id="watch-button" class="button button-popup-watchlist ${isWatched}">
        <i class="far ${iconClass}"></i>
        <span>${label}</span>
      </button>
    `;

    this.$buttonContainer.append(html);
  }


  // CHECK IF WATCHLIST HAS THIS STOCK
  isInWatchlist() {
    return this.watchlist.some(stock => stock.symbol === this.symbol);
  }


  // ADD/REMOVE FROM WATCHLIST CLICK HANDLER
  addOrRemoveFromWatchlistHandler() {
    const that = this;
    this.toggleButtonState(this.isInWatchlist);

    // Add/remove stock from watchlist
    this.$watchButton.on('click', function(event) {
      event.preventDefault();
      const $this = $(this);
      const $starIconContainer = $(`#stocks-list button#${that.symbol} .icon-add-watchlist`);
      const $starIcon = $(`#stocks-list button#${that.symbol} i`);

      // if stock is not in watchlist, then add to watchlist
      if (!that.isInWatchlist) {
        that.watchlist.push({
          symbol: that.symbol,
          name: that.companyName
        });
        store.set('watchlist', that.watchlist);

        // update watchlist button to REMOVE
        $this.addClass('isWatched');
        $this.html('<i class="fas fa-eye-slash"></i>Unwatch');

        $starIcon.removeClass('far').addClass('fas');
        $starIconContainer.toggleClass('is-selected');
      }
      // if stock exist, then remove it from watchlist
      else {
        // remove stock from watchlist array
        let index = that.watchlist.findIndex(stock => stock.symbol === that.symbol);
        if (index != -1) {
          that.watchlist.splice(index, 1);
        }

        // store upated watchlist array
        store.set('watchlist', that.watchlist);

        // update watchlist button to ADD
        $this.removeClass('isWatched');
        $this.html('<i class="far fa-eye"></i>Watch');
        $starIconContainer.toggleClass('is-selected');
        $starIcon.removeClass('fas').addClass('far');
      }
    });
  }

  // UPDATE WATCHLIST BUTTON STATE - TRUE: STOCK IN WATCHLIST, FALSE: STOCK NOT IN WATCHLIST
  toggleButtonState(boolean) {
    // if stock exist in watchlist, display 'remove from watchlist' button
    if (boolean === true) {
      this.$watchButton.addClass('isWatched');
      this.$watchButton.html('<i class="fas fa-eye-slash"></i>Unwatch');
    }
    // if stock doesn't exist in watchlist, display 'add to watchlist' button
    else {
      this.$watchButton.removeClass('isWatched');
      this.$watchButton.html('<i class="far fa-eye"></i>Watch');
    }
  }
}

export default WatchButton;