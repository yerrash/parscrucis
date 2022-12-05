import { PC } from "../config.mjs";
import { RACIALS } from "../base-data.mjs";

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
    const systemData = context.systemData;
    const attributesData = systemData.attributes;
    const skillsData = systemData.skills;
    const minorsData = systemData.minors;
    const detailsData = systemData.details;
    const race = detailsData.race;
    const skillsExpSpent = [];

    // Handle skills.
    for (let [_, skill] of Object.entries(skillsData)) {
      skill.attLabel =
        game.i18n.localize(PC.attributes[skill.attribute]) ??
        PC.attributes[skill.attribute];

      // Skill value cannot be null or lower than 0;
      skill.value
        ? skill.value >= 0
          ? skill.value
          : (skill.value = 0)
        : (skill.value = 0);

      // Update skill attribute base value.
      skill.attBaseValue = Math.ceil(skill.value / skill.growth);

      // Update skill experience spent.
      skill.expSpent = 0;
      const startingCost = skill.aprendizado === "PC.Hard" ? 2 : 1;
      for (let e = startingCost; e < skill.value + startingCost; e++) {
        if (skill.favor) {
          skill.expSpent += e - 1;
        } else {
          skill.expSpent += e;
        }
      }
      skillsExpSpent.push(skill.expSpent);
    }

    // Handle attributes.
    for (let [key, att] of Object.entries(attributesData)) {
      if (key !== "movement") {
        att.shortLabel = game.i18n.localize(PC.attributes[key]) ?? key;
        att.label = game.i18n.localize(PC.attributeNames[key]) ?? key;

        // Update attribute values based on parameters.
        const attArray = [];
        for (let [_, skill] of Object.entries(skillsData)) {
          if (skill.attribute == key) {
            attArray.push(skill.attBaseValue);
          }
        }
        const attRaceValue = RACIALS[race].attributes[key];
        const attBaseValue = Math.max(...attArray);
        att.autoValue = attRaceValue + attBaseValue;
      }
      if (key === "movement") {
        att.autoValue = RACIALS[race].attributes[key].move;
        att.autoSprint = RACIALS[race].attributes[key].sprint;
      }
    }

    // Handle minors.
    for (let [key, minor] of Object.entries(minorsData)) {
      minor.label = game.i18n.localize(PC.minors[key]) ?? key;

      const baseAtt = minor.base;
      const minorBaseValue =
        attributesData[baseAtt].value || attributesData[baseAtt].autoValue;
      minor.autoValue = minorBaseValue;
    }

    // Calculate available experience.
    const skillsExpSum = skillsExpSpent.reduce((a, b) => a + b, 0);
    detailsData.expAvailable =
      detailsData.exp - detailsData.expReserve - skillsExpSum;

    // Prints target actor DATA.
    console.log("atualiza ->", systemData);
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
    const attValue = attData.value || attData.autoValue;
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
    const label = `Teste de ${dataset.label}`;
    const roll = await Roll.create(
      `2d10+${skillData.value}+${skillData.modifiers}`
    ).evaluate({ async: true });

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: label,
      rollMode: game.settings.get("core", "rollMode"),
    });

    return roll;
  }
}
