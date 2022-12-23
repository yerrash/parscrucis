const field = foundry.data.fields;

export class ActionSchema extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      actionSkill: new field.StringField({ initial: "briga" }),
      actionSkillLabel: new field.StringField({ initial: "" }),
      actionType: new field.StringField({ initial: "melee" }),
      actionTypeLabel: new field.StringField({ initial: "" }),
      actionModifier: new field.StringField({ initial: "0" }),
      inputModifier: new field.StringField({ initial: "" }),
      altDamage: new field.BooleanField({ initial: false }),

      dmgBase: new field.NumberField({ initial: 0 }),
      dmgBase2: new field.NumberField({ initial: 0 }),
      dmgAtt: new field.StringField({ initial: "fis" }),
      dmgAtt2: new field.StringField({ initial: "fis" }),
      dmgAttDiv: new field.StringField({ initial: "/2" }),
      dmgAttDiv2: new field.StringField({ initial: "/2" }),
      damageDerived: new field.StringField({ initial: "" }),
      damageType: new field.StringField({ initial: "fis" }),

      derivedDamage: new field.NumberField({ initial: 0 }),
      actionRange: new field.StringField({ initial: "0" }),
      actionNotes: new field.StringField({ initial: "" }),
    };
  }
}

export class WeaponSchema extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      weaponCategory: new field.StringField({ initial: "melee" }),
      weaponCategoryLabel: new field.StringField({ initial: "" }),
      weaponType: new field.StringField({ initial: "unarmed" }),
      weaponTypeLabel: new field.StringField({ initial: "" }),
      actions: new field.ArrayField(
        new field.EmbeddedDataField(ActionSchema),
        { initial: [new ActionSchema()] }
        // new field.SchemaField({
        // actionSkill: new field.StringField({ initial: "briga" }),
        // actionSkillLabel: new field.StringField({ initial: "" }),
        // actionType: new field.StringField({ initial: "melee" }),
        // actionTypeLabel: new field.StringField({ initial: "" }),
        // actionModifier: new field.StringField({ initial: "0" }),
        // inputModifier: new field.StringField({ initial: "" }),
        // altDamage: new field.BooleanField({ initial: false }),

        // dmgBase: new field.NumberField({ initial: 0 }),
        // dmgBase2: new field.NumberField({ initial: 0 }),
        // dmgAtt: new field.StringField({ initial: "fis" }),
        // dmgAtt2: new field.StringField({ initial: "fis" }),
        // dmgAttDiv: new field.StringField({ initial: "/2" }),
        // dmgAttDiv2: new field.StringField({ initial: "/2" }),
        // damageDerived: new field.StringField({ initial: "" }),
        // damageType: new field.StringField({ initial: "fis" }),

        // derivedDamage: new field.NumberField({ initial: 0 }),
        // actionRange: new field.StringField({ initial: "0" }),
        // actionNotes: new field.StringField({ initial: "" }),
        // })
      ),
      requirements: new field.StringField({ initial: "" }),
      defense: new field.NumberField({ initial: null }),
      derivedDefense: new field.NumberField({ initial: null }),
      projDef: new field.NumberField({ initial: null }),
      derivedProjDef: new field.NumberField({ initial: null }),
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
