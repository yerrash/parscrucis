export function TaskCheck() {
  let rollFormula = "2d10";

  let messageData = {
    speaker: ChatMessage.getSpeaker({ actor: this.actor }),
  };
  new Roll(rollFormula, rollData).roll().toMessage(messageData);
}
