/**
 * form for actor configurations like increasing attributes and minors
 * @extends {FormApplication}
 */
export default class ActorConfigure extends FormApplication {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "actor-configure",
      classes: ["parscrucis", "sheet", "parscrucis-actor-config"],
      width: 300,
      height: 310,
      title: game.i18n.localize("PC.configureActor"),
      template: "systems/parscrucis/templates/apps/actor-configure.hbs",
      closeOnSubmit: true,
    });
  }

  constructor(object, options) {
    super(object, options);
  }

  async _updateObject(_, formData) {
    this.object.update(formData);
  }
}
