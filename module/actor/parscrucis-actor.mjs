import { PC } from "../config.mjs";
import { RACIALS } from "../data/race-data.mjs";

/**
 * @extends { Actor }
 */
export class ParsCrucisActor extends Actor {
  /** @override */
  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);

    const actorType = this.type;

    let initData = {
      prototypeToken: {
        displayName: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
        displayBars: CONST.TOKEN_DISPLAY_MODES.HOVER,
        disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
        actorLink: true,
        sight: {
          enabled: true,
          range: 1,
        },
        texture: {
          scaleX: 0.9,
          scaleY: 0.9,
        },
      },
    };

    if (actorType === "pdm") {
      initData.prototypeToken.disposition = CONST.TOKEN_DISPOSITIONS.HOSTILE;
      initData.prototypeToken.actorLink = false;
    }

    this.updateSource(initData);
    // console.log("PRECREATE", this);
  }

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();

    // console.log("prepData:THIS", this);
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
    const systemData = actorData.system;
    const actorType = actorData.type;
    const flags = actorData.flags.parscrucis || {};

    const attributesData = systemData.attributes;
    const skillsData = systemData.skills;
    const minorsData = systemData.minors;
    const mitData = systemData.mitigation;
    const detailsData = systemData.details;
    const resourcesData = systemData.resources;
    const race = detailsData.race;
    const skillsExpSpent = [];
    const combatSkillsLevels = [];
    const combatSkillsPlusModifiers = [];

    // if (actorData.type == "persona") {
    //   this._prepareCharacterData(context);
    // }

    this._prepareItems(actorData);
    this._setLuck(resourcesData);
    const abilitiesExpSum = this._abilitiesExp(actorData);
    detailsData.points = this._passivesPts(actorData);
    detailsData.loadTotal = this._itemsLoad(actorData);

    // Handle skills.
    for (let [key, skill] of Object.entries(skillsData)) {
      skill.attLabel =
        game.i18n.localize(PC.attributes[skill.attribute]) ??
        PC.attributes[skill.attribute];

      // Setting perona skills.
      if (actorType == "persona") {
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
      } else {
        // Setting pdm skills
        skill.value !== null
          ? skill.value >= 0
            ? skill.value
            : (skill.value = null)
          : (skill.value = null);
      }

      if (
        key === "briga" ||
        key === "esgri" ||
        key === "hasta" ||
        key === "malha"
      ) {
        if (skill.value !== null) {
          combatSkillsLevels.push(skill.value);
          let levelPlusModifier = skill.value + skill.modifiers;
          combatSkillsPlusModifiers.push(levelPlusModifier);
        }
      }

      // Correcting attribute modifiers
      if (skill.value === null) {
        skill.modifiers = 0;
      } else if (typeof skill.modifiers !== "number") {
        skill.modifiers = 0;
      }

      // Setting CSS class to disabled skills
      skill.value === null ? (skill.disabled = true) : (skill.disabled = false);
    }

    // Handle attributes.
    for (let [key, att] of Object.entries(attributesData)) {
      if (key !== "movement" && key !== "def") {
        att.shortLabel = game.i18n.localize(PC.attributes[key]) ?? key;
        att.label = game.i18n.localize(PC.attributeNames[key]) ?? key;

        // Setting persona attributes.
        if (actorType == "persona") {
          // Update attribute values based on parameters.
          const attArray = [];
          for (let [_, skill] of Object.entries(skillsData)) {
            if (skill.attribute == key) {
              attArray.push(skill.attBaseValue);
            }
          }
          const attRaceValue = RACIALS[race].attributes[key];
          const attBaseValue = Math.max(...attArray);
          att.autoValue = attRaceValue + attBaseValue + (att.config || 0);
          // if (att.value === null) att.value = att.autoValue;
          // att.value = att.inputValue || att.autoValue;
          att.inputValue === null
            ? (att.value = att.autoValue)
            : (att.value = att.inputValue);
        } else {
          // Setting pdm attributes.
          att.inputValue === 0
            ? (att.value = 0)
            : (att.value = att.inputValue || null);
        }

        // Verifies attribute values, setting passive values or disabling tests
        this._setAttributes(att);
      }

      if (key === "movement" && actorType == "persona") {
        att.shortLabel = game.i18n.localize(PC.mv) ?? key;
        att.autoValue = RACIALS[race].attributes[key] + (att.config || 0);
        att.value = att.inputValue || att.autoValue;
        att.autoSprint = Math.ceil(
          RACIALS[race].attributes.sprint +
            Math.max(skillsData.atlet.value, skillsData.agili.value) / 2 +
            (att.config || 0) +
            (att.inputValue ? att.inputValue - att.autoValue : 0)
        );
        att.sprint = att.inputSprint || att.autoSprint;
      }

      if (key === "def") {
        att.shortLabel = game.i18n.localize(PC.def) ?? key;
        if (actorType == "persona") {
          const combatSkillValue = Math.max(...combatSkillsPlusModifiers);
          const reflex = attributesData.ref;
          const defBase = RACIALS[race].attributes.def + (att.config || 0);
          const attCombatDefValue = defBase + combatSkillValue;
          const attRefDefValue =
            defBase + reflex.value + reflex.modifiers + (reflex.config || 0);
          const attBaseValue = Math.max(attCombatDefValue, attRefDefValue);
          attBaseValue >= 0
            ? (att.autoValue = attBaseValue)
            : (att.autoValue = 0);
          att.value = att.inputValue || att.autoValue;
        } else {
          att.inputValue === 0
            ? (att.value = 0)
            : (att.value = att.inputValue || null);
        }
        this._setAttributes(att);
      }
    }

    // Handle minors.
    for (let [key, minor] of Object.entries(minorsData)) {
      minor.label = game.i18n.localize(PC.minors[key]) ?? key;
      minor.shortLabel = game.i18n.localize(PC.minorsAbv[key]) ?? key;

      // Checks playable characters attributes for minors.
      if (actorType == "persona") {
        let attributesValues = 0;

        for (let att of minor.attributes) {
          let attValue = attributesData[att].value || 0;
          attributesValues += attValue;
        }

        minor.autoValue = Math.ceil(attributesValues / 2) + (minor.config || 0);
        minor.value = minor.inputValue || minor.autoValue;
      } else {
        // Setting pdm minor attributes.
        minor.inputValue === 0
          ? (minor.value = 0)
          : (minor.value = minor.inputValue || null);
      }
      this._setAttributes(minor);
    }

    // Handle mitigation.
    for (let [_, armor] of Object.entries(mitData)) {
      if (armor.value === null) {
        armor.value = 0;
      }
    }

    if (actorType == "persona") {
      // Construct persona resources.
      resourcesData.pv.autoValue =
        25 +
        attributesData.fis.value * 2 +
        attributesData.ego.value +
        skillsData.resis.value * 2 +
        (resourcesData.pv.config || 0);
      resourcesData.pv.max =
        resourcesData.pv.inputValue ||
        resourcesData.pv.autoValue ||
        resourcesData.pv.max;

      resourcesData.pe.autoValue =
        25 +
        attributesData.cog.value +
        attributesData.esp.value * 2 +
        skillsData.amago.value * 2 +
        (resourcesData.pe.config || 0);
      resourcesData.pe.max =
        resourcesData.pe.inputValue ||
        resourcesData.pe.autoValue ||
        resourcesData.pe.max;

      // Calculate persona available experience.
      const skillsExpSum = skillsExpSpent.reduce((a, b) => a + b, 0);

      detailsData.expAvailable =
        detailsData.exp -
        detailsData.expReserve -
        skillsExpSum -
        abilitiesExpSum;
    } else {
      resourcesData.pv.max = resourcesData.pv.inputValue || 25;
      resourcesData.pe.max = resourcesData.pe.inputValue || 25;
    }

    // Set resources percentage.
    resourcesData.pv.currentPercent =
      (100 * resourcesData.pv.value) / resourcesData.pv.max;
    resourcesData.pe.currentPercent =
      (100 * resourcesData.pe.value) / resourcesData.pe.max;

    // console.log("prepDerivedData:ITEMSDATA", itemsData);
    // console.log("prepDerivedData:THIS", this);

    // Make separate methods for each Actor type (character, npc, etc.)
    // this._prepareCharacterData(actorData);
    // this._prepareNpcData(actorData);
    this._prepareInventoryData(actorData, attributesData, skillsData);
    detailsData.loadMax =
      20 + attributesData.fis.value + (detailsData.loadConfig || 0);
  }

  _prepareItems(actorData) {
    // Initialize containers.
    const weapons = [];
    const gear = [];
    const vest = [];
    const acc = [];
    const passives = [];
    const powers = [];
    const techniques = [];

    for (let i of actorData.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === "gear") {
        //  Separates equipped vest and acessories
        if (i.system.group === "vest" && i.system.equipped === true) {
          vest.push(i);
        } else if (
          i.system.group === "accessory" &&
          i.system.equipped === true
        ) {
          acc.push(i);
        } else gear.push(i);
      }
      // Append weapons
      else if (i.type === "weapon") {
        if (i.system.equipped === true || i.system.subgroup === "unarmed") {
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
        if (i.system.subtype === "power") {
          powers.push(i);
        } else techniques.push(i);
      }
    }

    // Assign items and return
    actorData.weapons = weapons;
    actorData.equippedVest = vest;
    actorData.equippedAcc = acc;
    actorData.gear = gear;
    actorData.passives = passives;
    actorData.powers = powers;
    actorData.techniques = techniques;
  }

  _setLuck(resourcesData) {
    if (resourcesData.sorte.max > 4) resourcesData.sorte.max = 4;
    if (resourcesData.sorte.max < 0) resourcesData.sorte.max = 0;
    if (resourcesData.sorte.max === null) resourcesData.sorte.disabled = true;
  }

  _abilitiesExp(actorData) {
    // console.log(actorData);
    let abilitiesExp = 0;
    for (let [_, power] of Object.entries(actorData.powers)) {
      abilitiesExp += power.system.expCost;
    }
    for (let [_, technique] of Object.entries(actorData.techniques)) {
      abilitiesExp += technique.system.expCost;
    }
    for (let [_, passive] of Object.entries(actorData.passives)) {
      if (passive.system.learned === true) {
        abilitiesExp += passive.system.expCost;
      }
    }
    return abilitiesExp;
  }

  _itemsLoad(actorData) {
    let totalLoad = 0;
    for (let i of actorData.items) {
      if (i.type === "gear" || i.type === "weapon") {
        let itemLoad = Math.ceil(i.system.load / (i.system.loadMax || 1));
        totalLoad += itemLoad;
      }
    }
    return totalLoad;
  }

  _passivesPts(actorData) {
    let passivesPts = 0;
    for (let [_, passive] of Object.entries(actorData.passives)) {
      passive.system.acquisition === "native"
        ? (passivesPts += passive.system.points)
        : passivesPts;
    }
    return passivesPts;
  }

  _setAttributes(att) {
    // Disabling null attributes tests and passive values
    if (att.value === null) {
      att.disabled = true;
      att.passive = null;
    } else {
      att.passive = 10 + att.value + att.modifiers;
      att.passive >= 10 ? att.passive : (att.passive = 10);
    }
    // Correcting modifiers
    if (att.value === null) {
      att.modifiers = null;
    } else if (typeof att.modifiers !== "number") {
      att.modifiers = 0;
    }
  }

  _prepareCharacterData(actorData) {
    if (actorData.type !== "persona") return;
  }

  _prepareInventoryData(actorData, attributesData, skillsData) {
    const weaponsData = actorData.weapons;
    const gearData = actorData.gear;

    function calculate(dmgAttDiv) {
      if (dmgAttDiv === "att100") return 1;
      if (dmgAttDiv === "att200") return 2;
      if (dmgAttDiv === "att300") return 3;
      if (dmgAttDiv === "att400") return 4;
      if (dmgAttDiv === "att50") return 1 / 2;
      if (dmgAttDiv === "att33") return 1 / 3;
      if (dmgAttDiv === "att25") return 1 / 4;
      if (dmgAttDiv === "att500") return 5;
      if (dmgAttDiv === "att600") return 6;
      if (dmgAttDiv === "att700") return 7;
      if (dmgAttDiv === "att800") return 8;
      return 1;
    }

    // Prepare character weapon data
    for (let [_, wep] of Object.entries(weaponsData)) {
      const wepSD = wep.system;
      for (let [_, ac] of Object.entries(wepSD.actions)) {
        if (ac.altDamage) {
          const attValue = attributesData[ac.dmgAtt]
            ? attributesData[ac.dmgAtt].value +
              attributesData[ac.dmgAtt].modifiers
            : 0;
          const attValue2 = attributesData[ac.dmgAtt2]
            ? attributesData[ac.dmgAtt2].value +
              attributesData[ac.dmgAtt2].modifiers
            : 0;
          const attMixer = calculate(ac.dmgDiv);
          const attMixer2 = calculate(ac.dmgDiv2);
          const dmgResult = Math.ceil(ac.dmgBase + attValue * attMixer);
          const dmgResult2 = Math.ceil(ac.dmgBase2 + attValue2 * attMixer2);
          const attBaseValue = Math.max(dmgResult, dmgResult2);

          ac.derivedDamage = attBaseValue;
        } else {
          const attValue = attributesData[ac.dmgAtt]
            ? attributesData[ac.dmgAtt].value +
              attributesData[ac.dmgAtt].modifiers
            : 0;
          const attMixer = calculate(ac.dmgDiv);
          const dmgResult = Math.ceil(ac.dmgBase + attValue * attMixer);

          ac.derivedDamage = dmgResult >= 0 ? dmgResult : 0;
        }
      }
    }
  }

  /**
   * @Override getRollData() -> supplied to rolls.
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
    if (this.type !== "persona") return;
  }
}
