import { PC_Utility } from "../utility.js";

export default class ParsCrucisActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["parscrucis", "sheet", "parscrucis-actor-sheet"],
      width: 800,
      height: 680,
      scrollY: ["section.inventory", "section.abilities", "section.constants"],
      title: "BULLSHIT",
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
    this._prepareItems(context);
    this._prepareSheetData(context);

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
    const vest = [];
    const acc = [];
    const passives = [];
    const powers = [];
    const techniques = [];

    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;

      // Append to gear.
      if (i.type === "gear") {
        // Separates equipped vest and accessories
        if (i.system.category === "vest" && i.system.equipped === true) {
          vest.push(i);
        } else if (
          i.system.category === "accessory" &&
          i.system.equipped === true
        ) {
          acc.push(i);
        } else gear.push(i);
        // Append weapons
      } else if (i.type === "weapon") {
        if (i.system.equipped === true || i.system.subtype === "unarmed") {
          weapons.push(i);
        } else {
          gear.push(i);
        }
      }

      // Append passive features - Benefits and Detriments
      else if (i.type === "passive") {
        passives.push(i);
      }

      // Append abilities - Techniques and Powers
      else if (i.type === "ability") {
        if (i.system.category === "power") {
          powers.push(i);
        } else techniques.push(i);
      }
    }

    // Assign items and return
    context.weapons = weapons;
    context.equippedVest = vest;
    context.equippedAcc = acc;
    context.gear = gear;
    context.passives = passives;
    context.powers = powers;
    context.techniques = techniques;
  }

  /**
   * Organize and classify parts of Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareSheetData(context) {
    console.log(context.systemData.resources.sorte);

    PC_Utility.addBooleans(context.systemData.resources.sorte);

    // Prints target actor DATA.
    // console.log("atualiza ->", context);
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find(".item-create").click(this._onItemCreate.bind(this));
    html.find(".item-equip").click(this._onItemEquip.bind(this));
    html.find(".item-unequip").click(this._onItemUnequip.bind(this));

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

    html.find("[data-luck-index]").click(this._onLuckClick.bind(this));
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

    const name = `${(game.i18n.localize(`PC.${type}`) ?? type).capitalize()}`;
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

  async _onItemEquip(event) {
    event.preventDefault();
    const itemId = event.currentTarget.dataset.itemId;
    const item = this.actor.items.get(itemId);
    return item.update({ ["system.equipped"]: true });
  }

  async _onItemUnequip(event) {
    event.preventDefault();
    const itemId = event.currentTarget.dataset.itemId;
    const item = this.actor.items.get(itemId);
    return item.update({ ["system.equipped"]: false });
  }

  async _onNoteChange(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const itemId = dataset.itemUpdate;
    const target = dataset.itemTarget;
    const item = this.actor.items.get(itemId);
    item.update({ [`${target}`]: event.currentTarget.value });
  }

  dice(event) {
    let dice = "2d10";
    if (event.shiftKey === true) {
      dice = "3d10kh2";
    } else if (event.ctrlKey === true) {
      dice = "3d10kl2";
    }
    return dice;
  }

  async _onLuckClick(event) {
    event.preventDefault();
    let actorData = this.actor.toObject();
    let luckIndex = Number(event.currentTarget.dataset.luckIndex);
    let target = $(event.currentTarget)
      .parents(".luck-num")
      .attr("data-target");

    let value = getProperty(actorData, target);
    console.log(`${value} = ${target}`);

    let newValue = luckIndex + 1;
    console.log(newValue);

    if (value === newValue) {
      setProperty(actorData, target, 0);
    } else setProperty(actorData, target, newValue);
    // setProperty(actorData);
    // setProperty(actorData, target, value);

    this.actor.update(actorData);

    console.log(actorData);
  }

  _onDiamondClick(event) {
    let actorData = this.actor.toObject();
    let index = Number($(event.currentTarget).attr("data-index"));
    let target = $(event.currentTarget)
      .parents(".diamond-row")
      .attr("data-target");

    // Fix for condition values being changed over their max/min value.
    if (target.split(".")[1] === "condition") {
      if (index + 1 <= maximum && index + 1 > minimum) {
        if (parentValues.value == index + 1)
          // If the last one was clicked, decrease by 1
          setProperty(actorData, target, index);
        // Otherwise, value = index clicked
        else setProperty(actorData, target, index + 1); // If attribute selected
        let attributeElement = $(event.currentTarget).parents(".attribute");
        if (attributeElement.length) {
          // Constrain attributes to be greater than 0
          if (getProperty(actorData, target) <= 0)
            setProperty(actorData, target, 1);
        }
      }
    } else {
      let value = getProperty(actorData, target);
      if (value == index + 1)
        // If the last one was clicked, decrease by 1
        setProperty(actorData, target, index);
      // Otherwise, value = index clicked
      else setProperty(actorData, target, index + 1); // If attribute selected
      let attributeElement = $(event.currentTarget).parents(".attribute");
      if (attributeElement.length) {
        // Constrain attributes to be greater than 0
        if (getProperty(actorData, target) <= 0)
          setProperty(actorData, target, 1);
      }
    }
    this.actor.update(actorData);
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
    let dice = this.dice(event);
    const roll = await Roll.create(
      `${dice}+${attValue}+${attData.modifiers}`
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

    const flavor = `Teste de ${dataset.label}`;
    let dice = this.dice(event);
    const roll = await Roll.create(
      `${dice}+${skillValue}+${skillData.modifiers}`
    ).evaluate({ async: true });

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: flavor,
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

    const flavor = `${itemData.name}, ${actionData.actionSkillLabel} - ${actionData.actionTypeLabel}`;
    let dice = this.dice(event);
    const roll = await Roll.create(
      `${dice}+${skillResult}+${actionData.actionModifier}`
    ).evaluate({ async: true });

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: flavor,
      rollMode: game.settings.get("core", "rollMode"),
    });

    return roll;
  }
}
