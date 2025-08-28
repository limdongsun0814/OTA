import mqtt from "mqtt";

const mqttClient = mqtt.connect(process.env.MQTT_BROKER || "");

async function MqttPublish(topic: string, data: any) {
  console.log("data: ", data);
  if (mqttClient && mqttClient.connected) {
    mqttClient.publish(topic, data, { qos: 2 });
    // console.log("result1: ", result);
  }
  return false;
}

export default MqttPublish;
