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
#include <SHA256.h>
#include <bearssl/bearssl.h>
#include "base64.h"

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
        int chunkSize=1000;
        int chunkMax;
        int contentLength;
        int chunkIndex;
        String fileName;
        String responseMessage;
        String responseStatus;
        byte digest[32];

        OTAClass();
        OTAClass(uint16_t port);
        ~OTAClass();

        void setupDebug(Print* debugPort);
        void WiFiConfig(IPAddress ip,IPAddress gateway,IPAddress subnet);
        void begin(const char* ssid, const char* password,String url,const char* mqttUrl,int mqttPort,const uint8_t* key);
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
        SHA256 hash;
        uint8_t iv[16];
        String ivToBase64;
        const uint8_t* secretKey;
        void hashKey(byte* payload);
        void setupHash();
        bool checkHashKey(String input);
        unsigned int pkcs7Unpad(byte* buf,unsigned int len);
        void decrypt(byte* data,unsigned int len, const uint8_t* key, uint8_t* iv);

};

// extern OTAClass OTA;
#endif