export default class ParsCrucisActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["parscrucis", "sheet", "parscrucis-actor-sheet"],
      width: 800,
      height: 680,
      tabs: [
        {
          navSelector: ".navigation",
          contentSelector: ".tab-content",
          initial: "skills",
        },
      ],
    });
  }

  /** @override */
  get template() {
    const path = "systems/parscrucis/templates/actor";
    return `${path}/${this.actor.type}-sheet.hbs`;
  }

  getData() {
    const context = super.getData();
    const actorData = context.actor;

    context.systemData = actorData.system;
    context.flags = actorData.flags;

    // Prepare  data and items.
    // if (actorData.type == "persona") {}
    this._prepareItems(context);
    this._prepareCharacterData(context);

    context.config = CONFIG.parscrucis;

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    // context.effects = prepareActiveEffectCategories(this.actor.effects);

    // console.log("getData:ISSO", context);

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
    const weapons = [];
    const gear = [];
    const passives = [];
    const abilities = [];

    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === "gear") {
        //  Ajustar os tipos de itens de acordo
        gear.push(i);
        // Append weapons
      } else if (i.type === "weapon") {
        weapons.push(i);
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
    context.weapons = weapons;
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
    const systemData = context.systemData;

    // Prints target actor DATA.
    // console.log("atualiza ->", context);
  }

  activateListeners(html) {
    super.activateListeners(html);

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

    // Edit Inventory Item notes
    html.find("[data-item-update]").change(this._onNoteChange.bind(this));

    // Delete Inventory Item
    html.find(".item-delete").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    html.find("[data-att-key]").click(this._onAttClick.bind(this));
    html.find("[data-skill-key]").click(this._onSkillClick.bind(this));
    html.find("[data-action]").click(this._onActionClick.bind(this));
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

  async _onNoteChange(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const id = dataset.itemUpdate;
    const target = dataset.itemTarget;
    const item = this.actor.items.get(id);
    item.update({ [`${target}`]: event.currentTarget.value });
  }

  /**
   * Handle clickable attribute rolls.
   * @param {Event} event The originating click event
   * @private
   */
  async _onAttClick(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const dataset = element.dataset;
    const attKey = dataset.attKey;
    const attType = dataset.attType;
    const attData = this.actor.system[attType][attKey];
    const attValue = attData.value;
    const label = attData.label;
    const flavor = `Teste de ${label}`;

    const roll = await Roll.create(
      `2d10+${attValue}+${attData.modifiers}`
    ).evaluate({ async: true });

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: flavor,
      rollMode: game.settings.get("core", "rollMode"),
    });

    return roll;
  }

  async _onSkillClick(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const dataset = element.dataset;
    const key = dataset.skillKey;
    const skillData = this.actor.system.skills[key];
    const skillValue = skillData.value;

    if (skillValue === null) {
      return;
    }

    const label = `Teste de ${dataset.label}`;
    const roll = await Roll.create(
      `2d10+${skillValue}+${skillData.modifiers}`
    ).evaluate({ async: true });

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: label,
      rollMode: game.settings.get("core", "rollMode"),
    });

    return roll;
  }

  async _onActionClick(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const dataset = element.dataset;
    const skillKey = dataset.action;
    const actionKey = dataset.actionKey;
    const skillData = this.actor.system.skills[skillKey];
    const skillResult = skillData.value + skillData.modifiers;
    const itemId = dataset.itemId;
    const itemData = this.actor.items.get(itemId);
    const actionData = itemData.system.actions[actionKey];
    const label = `${itemData.name}, ${actionData.actionSkillLabel} - ${actionData.actionTypeLabel}`;
    const roll = await Roll.create(
      `2d10+${skillResult}+${actionData.actionModifier}`
    ).evaluate({ async: true });

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: label,
      rollMode: game.settings.get("core", "rollMode"),
    });

    return roll;
  }
}
