#ifndef IOTACONTROLLER_H
#define IOTACONTROLLER_H

#include "stdint.h"
#include <PubSubClient.h>
class IOTAController{
    public:
        virtual ~IOTAController()=default;

        virtual void begin(PubSubClient& client)=0;
        virtual void onStatus(uint8_t* payload, size_t length,PubSubClient& client)=0;
        virtual void onUpdate(uint8_t* payload, size_t length,PubSubClient& client)=0;
        virtual void onPub(PubSubClient& client)=0;
};

#endif