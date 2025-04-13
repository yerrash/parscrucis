/**
 * @extends { ChatMessage }
 */
export class ParsCrucisChatMessage extends ChatMessage {
  /** @override */
  async getHTML() {
    const data = this.toObject(false);
    data.content = await TextEditor.enrichHTML(this.content, {
      async: true,
      rollData: this.getRollData(),
    });

    const isWhisper = this.whisper.length;

    console.log("PRINT NO ROLLDATA");

    // Construct message data
    const messageData = {
      message: data,
      user: game.user,
      author: this.author,
      alias: this.alias,
      cardPortrait: this.flags.imgPath,
      cssClass: [
        this.type === CONST.CHAT_MESSAGE_STYLES.IC ? "ic" : null,
        this.type === CONST.CHAT_MESSAGE_STYLES.EMOTE ? "emote" : null,
        isWhisper ? "whisper" : null,
        this.blind ? "blind" : null,
      ].filterJoin(" "),
      isWhisper: this.whisper.length,
      canDelete: game.user.isGM, // Only GM users
      whisperTo: this.whisper
        .map((u) => {
          let user = game.users.get(u);
          return user ? user.name : null;
        })
        .filterJoin(", "),
    };

    // Render message data specifically for ROLL type messages
    if (this.isRoll) {
      await this._renderRollContent(messageData);
    }

    // Define a border color
    if (this.type === CONST.CHAT_MESSAGE_STYLES.OOC) {
      messageData.borderColor = this.author?.color;
    }

    console.log("CONFIG", CONFIG);

    // Render the chat message
    let html = await renderTemplate(CONFIG.ChatMessage.template, messageData);
    html = $(html);

    // Forces dice rolls to be expanded
    this._rollExpanded = true;

    // Flag expanded state of dice rolls
    if (this._rollExpanded) html.find(".dice-tooltip").addClass("expanded");

    /**
     * A hook event that fires for each ChatMessage which is rendered for addition to the ChatLog.
     * This hook allows for final customization of the message HTML before it is added to the log.
     * @function renderChatMessage
     * @memberof hookEvents
     * @param {ChatMessage} message   The ChatMessage document being rendered
     * @param {jQuery} html           The pending HTML as a jQuery object
     * @param {object} data           The input data provided for template rendering
     */
    Hooks.call("renderChatMessage", this, html, messageData);

    // console.log(messageData);
    // console.log(this);
    // console.log(data);

    return html;
  }

  /** @override */
  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);
  }
}
