const field = foundry.data.fields;

export class ActionSchema extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      actionSkill: new field.StringField({ initial: "briga" }),
      actionType: new field.StringField({ initial: "melee" }),
      actionModifier: new field.StringField({ initial: "0" }),
      altDamage: new field.BooleanField({ initial: false }),

      dmgBase: new field.NumberField({ initial: 0 }),
      dmgAtt: new field.StringField({ initial: "fis" }),
      dmgAttDiv: new field.StringField({ initial: "/2" }),
      dmgBase2: new field.NumberField({ initial: 0 }),
      dmgAtt2: new field.StringField({ initial: "fis" }),
      dmgAttDiv2: new field.StringField({ initial: "/2" }),
      damageType: new field.StringField({ initial: "" }),

      actionRange: new field.StringField({ initial: "" }),
      actionNotes: new field.StringField({ initial: "" }),
    };
  }
}

export class WeaponSchema extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      weaponCategory: new field.StringField({ initial: "melee" }),
      weaponType: new field.StringField({ initial: "" }),
      actions: new field.ArrayField(
        new field.SchemaField({
          actionSkill: new field.StringField({ initial: "briga" }),
          actionType: new field.StringField({ initial: "melee" }),
          actionModifier: new field.StringField({ initial: "0" }),
          altDamage: new field.BooleanField({ initial: false }),

          dmgBase: new field.NumberField({ initial: 0 }),
          dmgAtt: new field.StringField({ initial: "fis" }),
          dmgAttDiv: new field.StringField({ initial: "/2" }),
          dmgBase2: new field.NumberField({ initial: 0 }),
          dmgAtt2: new field.StringField({ initial: "fis" }),
          dmgAttDiv2: new field.StringField({ initial: "/2" }),
          damageType: new field.StringField({ initial: "" }),

          actionRange: new field.StringField({ initial: "" }),
          actionNotes: new field.StringField({ initial: "" }),
        })
      ),
      requirements: new field.StringField({ initial: "" }),
      defense: new field.NumberField({ initial: 10 }),
      projectileDefense: new field.NumberField({ initial: 6 }),
      requisites: new field.StringField({ initial: "none" }),
      durability: new field.NumberField({ initial: 13 }),
      craft: new field.StringField({ initial: "" }),
      price: new field.NumberField({ initial: 1 }),
      equipped: new field.BooleanField({ initial: false }),
      rarity: new field.StringField({ initial: "common" }),
      notes: new field.StringField({ initial: "" }),
      description: new field.StringField({ initial: "" }),
    };
  }
}
