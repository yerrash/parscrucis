import { ActionSchema } from "./item-schema.mjs";

export default class ParsCrucisItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["parscrucis", "sheet", "parscrucis-item-sheet"],
      width: 600,
      height: 440,
      tabs: [
        {
          navSelector: ".navigation",
          contentSelector: ".tab-content",
          initial: "details",
        },
      ],
    });
  }

  /** @override */
  get template() {
    const path = "systems/parscrucis/templates/item";
    return `${path}/${this.item.type}-sheet.hbs`;
  }

  /** @override */
  getData() {
    const context = super.getData();
    context.config = CONFIG.parscrucis;

    const itemData = context.item;

    // console.log(context);
    // console.log(itemData);

    console.log(context);

    return context;
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

    // Delete Self
    html.find(".self-destruct").click((ev) => {
      const id = $(ev.currentTarget).attr("self");
      if (this.actor != null) {
        this.actor.items.get(id).delete();
      }
    });
    html.find(".action-create").click(this._createAction.bind(this));
    html.find(".action-delete").click(this._deleteAction.bind(this));
  }

  _createAction(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const dataset = element.dataset;
    const type = dataset.type;

    const objectData = this.object;

    const actions = objectData.system[type];
    const updateData = {};

    actions.push(new ActionSchema());
    updateData["system.actions"] = actions;

    this.object.update(updateData);
  }

  _deleteAction(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const dataset = element.dataset;
    const type = dataset.type;
    const index = parseInt(dataset.index);

    const objectData = this.object;

    const actions = objectData.system[type];
    const updateData = {};

    actions.splice(index, 1);

    updateData["system.actions"] = actions;

    this.object.update(updateData);
  }
}
