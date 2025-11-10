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
#include <string>

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
        int chipId=ESP.getChipId();
        int chunkSize;
        int chunkMax;
        int contentLength;
        int chunkIndex;
        String fileName;
        String responseMessage;
        String responseStatus;

        OTAClass();
        OTAClass(uint16_t port);
        ~OTAClass();

        void setupDebug(Print* debugPort);
        void WiFiConfig(IPAddress ip,IPAddress gateway,IPAddress subnet);
        void begin(const char* ssid, const char* password,String url,const char* mqttUrl,int mqttPort);
        void initMCU(String url);
        void WiFiConnect(const char* ssid, const char* password);
        void routerSetup(String updateUrl, HTTPMethod HTTPMethod);
        void addRouterSetup();
        void handleUpdate();
        void handleNotFound();
        void handleClient(); 
        void mqttCallback(char* topic, byte* payload, unsigned int length);
        void mqttUpdate(byte* payload,unsigned int length);
        void mqttOTAPublish();
        void reconnect();
        

    private:
        Print* _debugPort;

};

// extern OTAClass OTA;
#endif