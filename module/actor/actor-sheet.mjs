import { PC } from "../config.mjs";

export default class ParsCrucisActorSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["parscrucis", "sheet", "actor"],
      template: "systems/parscrucis/templates/actor/actor-sheet.hbs",
      width: 800,
      height: 680,
      tabs: [
        {
          navSelector: ".navigation",
          contentSelector: ".tab-content",
          initial: "pericias",
        },
      ],
    });
  }

  // /** @override */
  // get template() {
  //   return `systems/boilerplate/templates/actor/actor-${this.actor.type}-sheet.html`;
  // }

  getData() {
    const context = super.getData();
    const actorData = context.actor;

    context.systemData = actorData.system;
    context.flags = actorData.flags;

    // console.log(context);

    // Prepare character data and items.
    if (actorData.type == "personagem") {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    context.config = CONFIG.parscrucis;

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    // context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const passives = [];
    const abilities = [];

    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === "gear") {
        //  Ajustar os tipos de itens de acordo
        gear.push(i);
      }
      // Append passive features - Benefits and Detriments
      else if (i.type === "passive") {
        passives.push(i);
      }
      // Append abilities - Techniques and Powers
      else if (i.type === "ability") {
        abilities.push(i);
      }
    }

    // Assign items and return
    context.gear = gear;
    context.passives = passives;
    context.abilities = abilities;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle attribute scores.
    for (let [key, att] of Object.entries(context.systemData.attributes)) {
      if (key !== "movement") {
        att.label = game.i18n.localize(PC.attributes[key]) ?? key;
      }
    }
  }

  activateListeners(html) {
    super.activateListeners(html);

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find(".item-create").click(this._onItemCreate.bind(this));

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find(".item-edit").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find(".item-delete").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    html.find("[data-att-key]").click(this._onAttClick.bind(this));
    html.find("[data-minor-key]").click(this._onMinorClick.bind(this));
    html.find("[data-skill-key]").click(this._onSkillClick.bind(this));
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const type = element.dataset.type;
    const data = duplicate(element.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Creates the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  async _onAttClick(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const key = element.dataset.attKey;
    const att = this.actor.system.attributes[key];

    return this.actor.rollAtt(att);
  }

  async _onMinorClick(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const key = element.dataset.minorKey;
    const minor = this.actor.system.minors[key];

    return this.actor.rollMinor(minor);
  }

  async _onSkillClick(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const key = dataset.skillKey;
    const skill = this.actor.system.skills[key];

    console.log("-> DATASET", dataset);

    // if (dataset.roll) {
    //   const roll = new Roll(dataset.roll, this.actor.system).evaluate({
    //     async: true,
    //   });

    //   const label = dataset.label ? `Rolling ${dataset.label}` : "";
    //   roll().toMessage({
    //     speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    //     flavor: label,
    //     // rollMode: game.settings.get("core", "rollMode"),
    //   });
    //   return roll;
    // }

    return this.actor.rollSkill(skill);

    // const skipDialog = event.ctrlKey; // false

    // console.log("->", key, skill);

    // return this.actor.rollSkill(skill, { event: event });

    // return this.actor.rollSkill(skill, { skipDialog });

    // let { rollResults, cardData } = await this.actor.rollSkill(skill, {
    //   skipDialog,
    // });
    // DegenesisChat.renderRollCard(rollResults, cardData);
  }
}
