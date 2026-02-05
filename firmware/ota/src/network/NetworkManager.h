#ifndef NETWORKMANAGER_H
#define NETWORKMANAGER_H

#include "stdint.h"
#include "MQTTHandler.h"
#include "../debug/DebugManager.h"
#include "../controller/IOTAController.h"

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ESP8266HTTPClient.h>

class NetworkManager
{
    public:

        NetworkManager(const String backendUrl,IOTAController& controller);

        void begin(const char* ssid, const char* password,const char* mqttUrl,int mqttPort);
        void loop();

        // bool isConnected();
        // bool isWifiConnected();
        bool isMqttConnected();

        void onConnect();
        // void onDisconnect();
        void onConnectBackend();
        void mqttReconnect();
        // void reconnectWifi();


    private:
        uint16_t port;
        const char* ssid;
        const char* password;
        const String backendUrl;

        WiFiClient wifiClient;
        PubSubClient client;
        HTTPClient http;

        MQTTHandler mqttHandler;
        IOTAController& controller;
        

        
};
#endif