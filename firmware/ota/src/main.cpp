#include <Arduino.h>
#include "network/NetworkManager.h"
#include "controller/OTAController.h"

#include "update/UpdateManager.h"
#include "hash/HashManager.h"
#include "crypto/CryptoManager.h"

#include "arduino_secrets.h"


const char* ssid = SECRET_SSID;
const char* password = SECRET_PASS;
const char* mqttUrl = MQTT_URL;

String url = BACK_URL;
int mqttPort = MQTT_PORT;
const uint8_t* key = secretKey;

CryptoManager crypto(key);
HashManager hash;
UpdateManager update;

OTAController controller(crypto,hash,update);
NetworkManager network(url,controller);

void setup() {
    Serial.begin(115200);
    debugPort = &Serial;
    network.begin(ssid,password,mqttUrl,mqttPort);
    Serial.println("");
    Serial.println("ESP8266 start");
}

void loop() {
    network.loop();
}
