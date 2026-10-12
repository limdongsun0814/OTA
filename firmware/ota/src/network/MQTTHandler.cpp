#include "MQTTHandler.h"

void MQTTHandler::begin(IOTAController& controller,PubSubClient& client){
    this->controller = &controller;
    this->client = &client;

    int chipId=ESP.getChipId();
    snprintf(this->statusTopic,sizeof(this->statusTopic),"%dstatus",chipId);
    snprintf(this->updateTopic,sizeof(this->statusTopic),"%d",chipId);

    client.setCallback([this](char* topic, uint8_t* payload, size_t length) {
        this->callback(topic,payload,length);
    });
}

void MQTTHandler::callback(char* topic, uint8_t* payload, size_t length){
    
    if(strcmp(statusTopic,topic)==0){
        controller->onStatus(payload, length,*client);
    }else if(strcmp(updateTopic,topic)==0){
        controller->onUpdate(payload, length,*client);
    }
}

void MQTTHandler::subscribeTopic(){
    this->client->subscribe(this->statusTopic);
    this->client->subscribe(this->updateTopic);

    
    controller->begin(*client);
}