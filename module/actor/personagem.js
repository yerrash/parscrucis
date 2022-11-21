export default class ParsCrucisPersonagem extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/parscrucis/templates/actor/personagem-sheet.hbs",
      classes: ["parscrucis", "sheet", "personagem"],
      tabs: [
        {
          navSelector: ".navigation",
          contentSelector: ".tab-content",
          initial: "main",
        },
      ],
    });
  }

  getData() {
    const data = super.getData();
    data.config = CONFIG.parscrucis;
    return data;
  }
}
