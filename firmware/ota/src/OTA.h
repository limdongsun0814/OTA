#ifndef OTA_H
#define OTA_H

#include "stdint.h"

#ifdef DEBUG_OTA_PORT
#define DEBUG_OTA DEBUG_OTA_PORT
#endif
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WebServer.h>
#include <Updater.h> 
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <vector>
#include <set>

class OTAClass{
    public:
        ESP8266WebServer* server;
        WiFiClient espClient;
        PubSubClient client;
        HTTPClient http;
        
        uint16_t port;
        const char* ssid;
        const char* password;
        const char* SubTopic;
        bool shouldRestart =false;

        String responseMessage = "";
        String responseStatus = "";

        JsonDocument doc;

        OTAClass();
        OTAClass(uint16_t port);
        ~OTAClass();

        void setupDebug(Print* debugPort);
        void WiFiConfig(IPAddress ip,IPAddress gateway,IPAddress subnet);
        void begin(const char* ssid, const char* password,String url);
        void initMCU(String url);
        void WiFiConnect(const char* ssid, const char* password);
        void routerSetup(String updateUrl, HTTPMethod HTTPMethod);
        void addRouterSetup();
        void handleUpdate();
        void handleNotFound();
        void handleClient(); 

    private:
        Print* _debugPort;
        std::vector<JsonArray> _uploadData;
        std::set<int> _chunkIndex;

};

// extern OTAClass OTA;
#endif