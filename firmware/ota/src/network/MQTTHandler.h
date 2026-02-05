#ifndef MQTTHANDLER_H
#define MQTTHANDLER_H

#include "../controller/IOTAController.h"
#include <PubSubClient.h>

class MQTTHandler
{
    public:
        void begin(IOTAController& controller,PubSubClient& client);
        void callback(char* topic, uint8_t* payload, size_t length);
        void subscribeTopic();
    private:
        IOTAController* controller=nullptr;
        PubSubClient* client=nullptr;
        char statusTopic[32];
        char updateTopic[32];

};
#endif