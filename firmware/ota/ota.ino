#include "src/OTA.h"
#include "arduino_secrets.h"

uint16_t port = 80;
const char* ssid = SECRET_SSID;
const char* password = SECRET_PASS;
const char* mqttUrl = MQTT_URL;

String url = BACK_URL;
String updateURL = UPDATE_URL;
int mqttPort = MQTT_PORT;
const uint8_t* key = secretKey;
OTAClass myOTA = OTAClass(80);
void setup() {
  Serial.begin(115200);
  Serial.println();
  myOTA.setupDebug(&Serial);
  myOTA.begin(ssid,password,url,mqttUrl,mqttPort,key);
  myOTA.routerSetup(updateURL,HTTP_POST);
}

void loop() {
  myOTA.handleClient();
}