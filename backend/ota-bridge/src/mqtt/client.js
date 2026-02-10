require("dotenv").config();
const mqtt = require("mqtt");

class Mqtt {
  static instance;

  constructor(broker) {
    if (Mqtt.instance) {
      return Mqtt.instance.mqttClient;
    }
    Mqtt.instance = this;

    this.mqttClient = mqtt.connect(broker || "");
    return Mqtt.instance.mqttClient;
  }
}

module.exports = Mqtt;
