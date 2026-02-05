#ifndef OTACONTROLLER_H
#define OTACONTROLLER_H

#include "stdint.h"
#include "../debug/DebugManager.h"
#include "../update/IUpdateManager.h"
#include "../hash/IHashManager.h"
#include "../crypto/ICryptoManager.h"
#include "../state/OTAState.h"
#include "IOTAController.h"
#include <PubSubClient.h>
#include <string>

class OTAController : public IOTAController
{
    public:
        OTAController(ICryptoManager& crypto,IHashManager& hash,IUpdateManager& update);
        void begin();
        void onStatus(uint8_t* payload, size_t length,PubSubClient& client);
        void onUpdate(uint8_t* payload, size_t length,PubSubClient& client);
        void onPub(PubSubClient& client);
    
    private:
        bool checkStatus=false;

        ICryptoManager& crypto;
        IHashManager& hash;
        IUpdateManager& update;
    
        OTAState& state=OTAState::getInstance();
};
#endif