require("dotenv").config();
const Crypto = require("./crypto/Aes");

const BROKER = process.env.MQTT_BROKER;
const SOCKETPORT = process.env.SOCKET_PORT;

const KEYSTR = process.env.SECRET_AES_KEY;
const KEYHEX = Buffer.from(KEYSTR, "hex");
const crypto = new Crypto(KEYHEX);

const SocketHandler = require("./socket/handlers");
const MqttHandler = require("./mqtt/handlers");

const MqttController = require("./mqtt/controller");

const MqttServer = require("./mqtt/client");
const socketServer = require("./socket/client").init(SOCKETPORT);

const mqttServer = new MqttServer(BROKER);
const socketHandler = new SocketHandler(socketServer);

const controller = new MqttController(mqttServer, crypto, socketServer);

const mqttHandler = new MqttHandler(controller, mqttServer);
