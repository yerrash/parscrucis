import { PC } from "../config.mjs";
import { RACIALS } from "../base-data.mjs";

/**
 * Extend the base Actor document with custom roll data.
 * @extends {Actor}
 */
export class ParsCrucisActor extends Actor {
  /** @override */
  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);

    let initData = {
      prototypeToken: {
        displayName: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
        displayBars: CONST.TOKEN_DISPLAY_MODES.HOVER,
        disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
        actorLink: true,
        texture: {
          scaleX: 0.9,
          scaleY: 0.9,
        },
      },
    };

    this.updateSource(initData);
  }

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const data = actorData.system;
    const flags = actorData.flags.parscrucis || {};

    const systemData = actorData.system;

    const attributesData = systemData.attributes;
    const skillsData = systemData.skills;
    const minorsData = systemData.minors;
    const detailsData = systemData.details;
    const resourcesData = systemData.resources;
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
        att.autoSprint =
          RACIALS[race].attributes[key].sprint + skillsData.atlet.value / 2;
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

    // Construct resources
    resourcesData.pv.autoValue =
      15 +
        (attributesData.fis.value || attributesData.fis.autoValue) +
        skillsData.resis.value || skillsData.resis.autoValue;
    resourcesData.pv.max =
      resourcesData.pv.inputValue || resourcesData.pv.autoValue;
    resourcesData.pv.currentPercent =
      (100 * resourcesData.pv.value) / resourcesData.pv.max;

    resourcesData.pe.autoValue =
      15 +
        (attributesData.esp.value || attributesData.esp.autoValue) +
        skillsData.amago.value || skillsData.amago.autoValue;
    resourcesData.pe.max =
      resourcesData.pe.inputValue || resourcesData.pe.autoValue;
    resourcesData.pe.currentPercent =
      (100 * resourcesData.pe.value) / resourcesData.pe.max;

    console.log(resourcesData);

    // Calculate available experience.
    const skillsExpSum = skillsExpSpent.reduce((a, b) => a + b, 0);
    detailsData.expAvailable =
      detailsData.exp - detailsData.expReserve - skillsExpSum;

    console.log(actorData);

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    // this._prepareNpcData(actorData);
  }

  _prepareCharacterData(actorData) {
    if (actorData.type !== "personagem") return;

    console.log("PORRA");
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    // this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== "personagem") return;

    // // Copy the ability scores to the top level, so that rolls can use
    // // formulas like `@atlet.value + 2`.
    // if (data.skills) {
    //   for (let [key, v] of Object.entries(data.skills)) {
    //     data[key] = foundry.utils.deepClone(v);
    //   }
    // }
  }
}
