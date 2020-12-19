import $ from 'jquery';
import Search from "./search";


class TopBar {
  constructor(containerId) {
    this.$container = $(containerId);

    this.renderHTML();
    // new Search('#topSearchContainer');
  }

  renderHTML() {
    let html = `
      <div>
        <div id="topSearchContainer"></div>
        <div id="avatar"></div>
      </div>
    `;

    this.$container.html(html);
  }
}

export default TopBar;