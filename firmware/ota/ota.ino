#include "src/OTA.h"
#include "arduino_secrets.h"

uint16_t port = 80;
const char* ssid = SECRET_SSID;
const char* password = SECRET_PASS;
String url = BACK_URL;
String updateURL = UPDATE_URL;
OTAClass myOTA = OTAClass(80);
void setup() {
  Serial.begin(115200);
  Serial.println();
  myOTA.setupDebug(&Serial);
  myOTA.begin(ssid,password,url);
  myOTA.routerSetup(updateURL,HTTP_POST);
}

void loop() {
  myOTA.handleClient();
}