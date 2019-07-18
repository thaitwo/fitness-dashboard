import $ from 'jquery';
import store from 'store2';

class WatchButton {
  constructor(containerId, symbol, companyName, refreshPage) {
    this.$buttonContainer = $(containerId);
    this.symbol = symbol;
    this.companyName = companyName;
    this.refreshPage = refreshPage;
    this.watchlist = store.get('watchlist') || [];
    this.isWatched = this.isInWatchlist();
    this.$watchlist = $('.watchlist-list');

    this.insertButton();
    this.$watchButton = $('#watch-button');
    this.$starIcon = this.$watchButton.find('i');
    this.addOrRemoveFromWatchlistHandler();
  }


  // INSERT BUTTON IN DOM
  insertButton() {
    let watchStatus,
        iconStyle;

    if (this.isWatched) {
      watchStatus = 'isWatched';
      iconStyle = 'fas';
    } else {
      watchStatus = '';
      iconStyle = 'far';
    }

    const html = `
      <button id="watch-button" class="button button-popup-watchlist ${watchStatus}">
        <i class="${iconStyle} fa-star"></i>
      </button>
    `;

    this.$buttonContainer.empty();
    this.$buttonContainer.append(html);
  }


  // CHECK IF WATCHLIST HAS THIS STOCK
  isInWatchlist() {
    return this.watchlist.some(stock => stock.symbol === this.symbol);
  }


  // ADD/REMOVE FROM WATCHLIST CLICK HANDLER
  addOrRemoveFromWatchlistHandler() {
    const that = this;

    // Add/remove stock from watchlist
    this.$watchButton.on('click', function(event) {
      event.preventDefault();
      that.toggleButtonState(that.isWatched);

      // if stock is not in watchlist, then add to watchlist
      if (!that.isWatched) {
        that.watchlist.push({
          symbol: that.symbol,
          name: that.companyName
        });
        store.set('watchlist', that.watchlist);
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
        
        // use case for Watchlist page to refresh page when stock is removed from watchlist
        if (that.refreshPage) {
          window.location.reload();
        }
      }
      that.isWatched = that.isInWatchlist();
    });
  }


  // UPDATE WATCHLIST BUTTON STATE - TRUE: STOCK IN WATCHLIST, FALSE: STOCK NOT IN WATCHLIST
  toggleButtonState(boolean) {
    // if stock exist in watchlist, display 'remove from watchlist' button
    if (boolean === true) {
      this.$starIcon.removeClass('fas').addClass('far');
      this.$watchButton.removeClass('isWatched');
    }
    // if stock doesn't exist in watchlist, display 'add to watchlist' button
    else {
      this.$starIcon.removeClass('far').addClass('fas');
      this.$watchButton.addClass('isWatched');
    }
  }
}

export default WatchButton;