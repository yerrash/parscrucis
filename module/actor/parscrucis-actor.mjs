import { PC } from "../config.mjs";
import { RACIALS } from "../base-data.mjs";

/**
 * @extends {Actor}
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
        skill.modifiers = null;
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
          att.autoValue = attRaceValue + attBaseValue;
          att.value = att.inputValue || att.autoValue;
        } else {
          if (att.inputValue === 0) {
            att.value = 0;
          } else {
            att.value = att.inputValue || null;
          }
        }

        if (att.value === null) {
          att.disabled = true;
        }

        // Correcting attribute modifiers
        if (att.value === null) {
          att.modifiers = null;
        } else if (typeof att.modifiers !== "number") {
          att.modifiers = 0;
        }
      }
      if (key === "movement" && actorType == "persona") {
        // if (actorType == "persona") {
        att.autoValue = RACIALS[race].attributes[key].move;
        att.value = att.inputValue || att.autoValue;
        att.autoSprint = Math.ceil(
          RACIALS[race].attributes[key].sprint + skillsData.atlet.value / 2
        );
        att.sprint = att.inputSprint || att.autoSprint;
        // }
      }
      if (key === "def") {
        if (actorType == "persona") {
          const combatSkillValue = Math.max(...combatSkillsPlusModifiers);
          const attBaseValue =
            10 + RACIALS[race].attributes.def + combatSkillValue;
          attBaseValue >= 10
            ? (att.autoValue = attBaseValue)
            : (att.autoValue = 10);
          att.value = att.inputValue || att.autoValue;
        } else {
          att.inputValue === 0
            ? (att.value = 0)
            : (att.value = att.inputValue || null);
        }

        if (att.value === null) {
          att.disabled = true;
          att.ranged = null;
        } else {
          att.autoRanged = att.value - 4;
          att.autoRanged >= 10 ? att.autoRanged : (att.autoRanged = 10);
          att.ranged = att.inputRanged || att.autoRanged;
        }

        if (att.value === null) {
          att.modifiers = null;
        } else if (typeof att.modifiers !== "number") {
          att.modifiers = 0;
        }
      }
    }

    // Handle minors.
    for (let [key, minor] of Object.entries(minorsData)) {
      minor.label = game.i18n.localize(PC.minors[key]) ?? key;

      // Setting playable characters minor attributes.
      if (actorType == "persona") {
        const baseAtt = minor.base;
        minor.autoValue = attributesData[baseAtt].value;
        minor.value = minor.inputValue || minor.autoValue;
      } else {
        // Setting pdm minor attributes.
        minor.value = minor.inputValue || null;
        minor.baseDisabled = true;
      }
    }

    // Handle mitigation.
    for (let [_, armor] of Object.entries(mitData)) {
      // console.log(armor.value);
    }

    if (actorType == "persona") {
      // Construct persona resources.
      resourcesData.pv.autoValue =
        15 + attributesData.fis.value + skillsData.resis.value;
      resourcesData.pv.max =
        resourcesData.pv.inputValue || resourcesData.pv.autoValue;

      resourcesData.pe.autoValue =
        15 + attributesData.esp.value + skillsData.amago.value;
      resourcesData.pe.max =
        resourcesData.pe.inputValue || resourcesData.pe.autoValue;

      resourcesData.lim.autoValue = 5 + Math.ceil(attributesData.ego.value / 2);
      resourcesData.lim.max =
        resourcesData.lim.inputValue || resourcesData.lim.autoValue;

      // Calculate persona available experience.
      const skillsExpSum = skillsExpSpent.reduce((a, b) => a + b, 0);
      detailsData.expAvailable =
        detailsData.exp - detailsData.expReserve - skillsExpSum;
    } else {
      resourcesData.pv.max = resourcesData.pv.inputValue || 15;
      resourcesData.pe.max = resourcesData.pe.inputValue || 15;
      resourcesData.lim.max = resourcesData.lim.inputValue || 5;
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
  }

  _prepareItems(actorData) {
    // Initialize containers.
    const weapons = [];
    const gear = [];
    const vest = [];
    const acc = [];
    const passives = [];
    const abilities = [];

    for (let i of actorData.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === "gear") {
        //  Separates equipped vest and acessories
        if (i.gearType === "vest" && i.equipped === true) {
          vest.push(i);
        } else if (i.gearType === "acc" && i.equipped === true) {
          acc.push(i);
        } else gear.push(i);
      }
      // Append weapons
      else if (i.type === "weapon") {
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
    actorData.weapons = weapons;
    actorData.equippedVest = vest;
    actorData.equippedAcc = acc;
    actorData.gear = gear;
    actorData.passives = passives;
    actorData.abilities = abilities;
  }

  _prepareCharacterData(actorData) {
    if (actorData.type !== "persona") return;
  }

  _prepareInventoryData(actorData, attributesData, skillsData) {
    // if (actorData.type !== "persona") return;

    const weaponsData = actorData.weapons;
    const gearData = actorData.gear;

    // console.log("PREPCHARDATA:WEAPONS", weaponsData);

    function calculate(dmgAttDiv) {
      if (dmgAttDiv === "att33") {
        return 1 / 3;
      }
      if (dmgAttDiv === "att50") {
        return 1 / 2;
      }
      return 1;
    }

    // Prepare character weapon data
    for (let [_, wep] of Object.entries(weaponsData)) {
      // console.log("PREPINTDATA:KEY,WEP:", key, wep.system);
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
          const attMixer = calculate(ac.dmgAttDiv);
          const attMixer2 = calculate(ac.dmgAttDiv2);
          const dmgResult = Math.ceil(ac.dmgBase + attValue * attMixer);
          const dmgResult2 = Math.ceil(ac.dmgBase2 + attValue2 * attMixer2);
          const attBaseValue = Math.max(dmgResult, dmgResult2);

          ac.derivedDamage = attBaseValue;
        } else {
          const attValue = attributesData[ac.dmgAtt]
            ? attributesData[ac.dmgAtt].value +
              attributesData[ac.dmgAtt].modifiers
            : 0;
          const attMixer = calculate(ac.dmgAttDiv);
          const dmgResult = Math.ceil(ac.dmgBase + attValue * attMixer);

          ac.derivedDamage = dmgResult;
        }
      }

      const skillData = skillsData[wepSD.actions[0].actionSkill];
      let derivedDefense =
        wepSD.defense + skillData.value + skillData.modifiers;
      let derivedProjDef =
        wepSD.projDef + skillData.value + skillData.modifiers;

      derivedDefense >= 10 ? derivedDefense : (derivedDefense = 10);
      derivedProjDef >= 10 ? derivedProjDef : (derivedProjDef = 10);

      wepSD.defense ? (wepSD.derivedDefense = derivedDefense) : null;
      wepSD.projDef ? (wepSD.derivedProjDef = derivedProjDef) : null;
    }

    // Prepare character gear data

    // console.log("PREPCHARDATA:WEAPONS-DERIVED", weaponsData, attributesData);
  }

  /**
   * @Override getRollData() that's supplied to rolls.
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
