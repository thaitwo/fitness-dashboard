import $ from 'jquery';
import store from 'store2';

class WatchButton {
  constructor(containerId, symbol, companyName, refreshPage = false) {
    this.$buttonContainer = $(containerId);
    this.symbol = symbol;
    this.companyName = companyName;
    this.refreshPage = refreshPage;
    this.watchlist = store.get('watchlist') || [];
    this.isWatched = this.isInWatchlist();
    this.$watchlist = $('.watchlist-list');

    this.insertButton();
    this.$watchButton = $(`#${this.symbol}-watchbutton`);
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
      <button id="${this.symbol}-watchbutton" class="button button-watchlist ${watchStatus}">
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

  // Fix watch button class name, remove 'popup'

  // ADD/REMOVE FROM WATCHLIST CLICK HANDLER
  addOrRemoveFromWatchlistHandler() {
    const that = this;

    // Add/remove stock from watchlist
    this.$watchButton.on('click', function(event) {
      event.stopPropagation();
      const pageUrl = document.URL.split('#')[1];
      that.watchlist = store.get('watchlist');
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
        
        /* For the Watchlist page, when the Watch button is clicked to remove the stock from the list,
        reload the page so that it is no longer showing data for the stock that the user just removed.
        */
        if (pageUrl === 'watchlist') {
          window.location.reload();
        }
      }
      that.isWatched = that.isInWatchlist();
    });
  }


  // UPDATE STAR ICON STYLE ON DASHBOARD PAGE BASED ON POPUP STAR ICON
  updateStarIcon(isWatched) {
    const $starIconWrapper = $('.stock-list').find(`li#${this.symbol} .icon-watchlist`);
    const $starIcon = $starIconWrapper.find('i');

    if (isWatched) {
      $starIconWrapper.removeClass('is-selected');
      $starIcon.removeClass('fas').addClass('far');
    } else {
      $starIconWrapper.addClass('is-selected');
      $starIcon.removeClass('far').addClass('fas');
    }
  }


  // UPDATE WATCHLIST BUTTON STATE - TRUE: STOCK IN WATCHLIST, FALSE: STOCK NOT IN WATCHLIST
  toggleButtonState(isWatched) {
    // if stock exist in watchlist, make star icon hollow
    if (isWatched === true) {
      this.$starIcon.removeClass('fas').addClass('far');
      this.$watchButton.removeClass('isWatched');
      
      // this.refreshPage will only be true for the Watchlist page.
      // if on Dashboard page, update star icon style based on Watchlist status of Popup
      if (!this.refreshPage) {
        this.updateStarIcon(isWatched);
      }
    }
    // if stock doesn't exist in watchlist, make star icon solid
    else {
      this.$starIcon.removeClass('far').addClass('fas');
      this.$watchButton.addClass('isWatched');

      // this.refreshPage will only be true for the Watchlist page.
      // if on Dashboard page, update star icon style based on Watchlist status of Popup
      if (!this.refreshPage) {
        this.updateStarIcon(isWatched);
      }
    }
  }
}

export default WatchButton;