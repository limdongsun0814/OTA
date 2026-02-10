const State = require("../State/SecretStore");
class MqttHandler {
  #controller;
  #server;
  constructor(controller, mqtt) {
    this.#server = mqtt;
    this.#controller = controller;
    this.#server.on("connect", () => {
      this.#controller.subscribe();
      this.#server.on("message", async (topic, payload) => {
        this.#callback(topic, payload);
      });
    });
  }
  #callback(topic, payload) {
    switch (topic) {
      case "backend": {
        const dataJson = JSON.parse(payload);
        let state = State.get(dataJson.chipId);
        if (state.chunkIndex == dataJson.chunkIndex) {
          this.#controller.pubFirmware(state);
          state.chunkIndex++;
        } else {
          console.error(
            "[MISMATCH CHUNKINDEX]: ",
            dataJson.chunkIndex,
            state.chunkIndex,
          );
        }
        return;
      }
      case "status": {
        const dataJson = JSON.parse(payload);
        for (let chipId of dataJson.chipIds) {
          State.create(chipId, dataJson);
          this.#controller.pubStatus(State.get(chipId));
        }
        return;
      }
    }
  }
}

module.exports = MqttHandler;
