import $ from 'jquery';
import store from 'store2';
import axios from 'axios';

class Intervals {
  constructor(intervalsContainer) {
    this.intervalsContainer = intervalsContainer;

    this.renderIntervals();

    this.intervalsList = $('#popup-intervals');
    this.intervalsItems = this.intervalsList.find('li');
  }

  
  // INSERT INTERVALS LIST IN POPUP
  renderIntervals() {
    const html = `
      <ul id="popup-intervals">
        <li class="selected">1M</li>
        <li>3M</li>
        <li>6M</li>
        <li>YTD</li>
        <li>1Y</li>
        <li>2Y</li>
        <li>5Y</li>
        <li>Max</li>
      </ul>
    `;

    this.intervalsContainer.html(html);
  }


  returnSelectedInterval() {
    const that = this;

    this.intervalsList.on('click', 'li', function(event) {
      event.stopPropagation();
      const $this = $(this);
      const selectedIntervalValue = $this.text().toLowerCase();
      that.updateIntervals(this);

      return selectedIntervalValue;
    })
  }


  // UPDATE STYLEING FOR SELECTED INTERVAL
  updateIntervals(selectedInterval) {
    const $selectedInterval = $(selectedInterval);

    this.intervalsItems.removeClass('selected');
    $selectedInterval.addClass('selected');
  }
}

export default Intervals;