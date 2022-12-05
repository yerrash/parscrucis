export default class ParsCrucisItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["parscrucis", "sheet", "item"],
      // width: 520,
      // height: 480,
      // tabs: [
      //   {
      //     navSelector: ".sheet-tabs",
      //     contentSelector: ".sheet-body",
      //     initial: "description",
      //   },
      // ],
    });
  }

  /** @override */
  get template() {
    const path = "systems/parscrucis/templates/item";
    return `${path}/${this.item.type}-sheet.hbs`;
  }

  /** @override */
  getData() {
    const data = super.getData();
    data.config = CONFIG.parscrucis;
    console.log(data);
    return data;
  }

  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 192;
    sheetBody.css("height", bodyHeight);
    return position;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Weapon actions

    // Roll handlers, click handlers, etc. would go here.
  }
}
