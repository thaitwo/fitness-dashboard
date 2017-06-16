/**
* Dropdown Menu
*
* @class
* @param ($container) string - Id of container to create dropdown menu
* @param (data) array - Array of menu items
* @param (callback) function - Callback function
* @returns (HTML) - Returns HTML for a dropdown menu w/ click handlers
*/

class Dropdown {
  constructor(containerId, data, callback) {
    this.containerId = containerId;
    this.data = data;
    this.callback = callback;
    this.$topContainer = $('.container-fluid');
    this.$menuContainer = $(`#${containerId}`);

    // RENDER DROPDOWN HTML (<button>, <ul>, <li>)
    this.renderDropdownHTML();

    // REGISTER ELEMENTS OF DROPDOWN MENU
    this.$buttonContainer = $(`button#${containerId}`);
    this.$buttonContainerLabel = $(`button#${containerId} .dropdown-button-label`);
    this.$ulContainer = $(`ul#${containerId}`);
    this.$listItems = $(`ul#${containerId} > li`);
    this.$firstListItem = $(`ul#${containerId} > li:first`);

    // ACTIVATE MENU
    this.activateDropdownButton();
    this.activateMenuLinks(this.$ulContainer);
  }


  // UPDATE DROPDOWN BUTTON LABEL AND SELECTED <LI>
  activateMenuLinks(listId) {
    const that = this;


    listId.on('click', 'li', (event) => {
      // GET DROPDOWN BUTTON VALUE
      const selectedItem = $(event.target);
      const id = event.target.id;
      const selectedItemTextValue = selectedItem[0].innerText;

      // UPDATE DROPDOWN BUTTON LABEL
      this.$buttonContainerLabel.text(selectedItemTextValue);

      // REMOVE 'IS-ACTIVE' CLASS FROM ALL <LI>
      this.$listItems.removeClass('is-active');

      // ADD 'IS-ACTIVE' CLASS TO SELECTED <LI>
      selectedItem.addClass('is-active');

      that.callback(id);
    })
  }



  // ADD 'IS-ACTIVE' CLASS TO FIRST <LI>
  // SHOW <UL> ON DROPDOWN BUTTON CLICK
  activateDropdownButton() {
    this.$firstListItem.addClass('is-active');

    this.$buttonContainer.on('click', (event) => {
      event.stopPropagation();
      this.$ulContainer.toggleClass('is-visible');
    })

    this.$topContainer.on('click', () => { this.$ulContainer.removeClass('is-visible')})
  }



  // GENERATE HTML OF LIST ITEMS WITHIN <UL>
  renderListItemsHTML() {
    return this.data.map((item) => {
      // this.$ulContainer.append(`<li id="${item.toLowerCase()}"><i class="fa fa-check" aria-hidden="true"></i>${item}</li>`);
      return `<li id="${item.toLowerCase()}"><i class="fa fa-check" aria-hidden="true"></i>${item}</li>`;
    }).join('');
  }


  // GENERATE HTML FOR DROPDOWN BUTTON AND <UL>
  renderDropdownHTML() {

    // Render <li> elements
    const listItems = this.renderListItemsHTML();

    // Render entire dropdown HTML
    const dropdownHTML =
      `
      <button id="${this.containerId}">
        <span class="dropdown-button-label">${this.data[0]}</span>
        <i class="fa fa-angle-down" aria-hidden="true"></i>
      </button>

      <ul id="${this.containerId}">
        ${listItems}
      </ul>
      `;

    this.$menuContainer.append(dropdownHTML);
  }
}

export default Dropdown;
