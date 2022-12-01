/**
 * Extend the base Actor document with custom roll data.
 * @extends {Actor}
 */
export class ParsCrucisActor extends Actor {
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

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    // this._prepareNpcData(actorData);
  }

  _prepareCharacterData(actorData) {
    if (actorData.type !== "personagem") return;

    // console.log(actorData);
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // console.log(data);

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

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@atlet.value + 2`.
    if (data.skills) {
      for (let [key, v] of Object.entries(data.skills)) {
        data[key] = foundry.utils.deepClone(v);
      }
    }
  }

  // async rollSkill(skill, { skipDialog = false }) {

  async rollSkill(skill) {
    // console.log("rolling ->", skill);

    const roll = await Roll.create(
      `2d10+${skill.value}+${skill.modifiers}`
    ).evaluate({ async: true });

    ChatMessage.create({
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,

      rolls: [roll.toJSON()],
    });

    console.log(roll);
  }

  async rollAtt(att) {
    const roll = await Roll.create(
      `2d10+${att.value}+${att.modifiers}`
    ).evaluate({ async: true });

    ChatMessage.create({
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,

      rolls: [roll.toJSON()],
    });

    console.log(roll);
  }

  async rollMinor(minor) {
    const roll = await Roll.create(
      `2d10+${minor.value}+${minor.modifiers}`
    ).evaluate({ async: true });

    ChatMessage.create({
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,

      rolls: [roll.toJSON()],
    });

    console.log(roll);
  }
}
