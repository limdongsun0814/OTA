#ifndef CRYPTOMANAGER_H
#define CRYPTOMANAGER_H

#include "stdint.h"
#include "ICryptoManager.h"
#include "../state/OTAState.h"
#include <bearssl/bearssl.h>

class CryptoManager : public ICryptoManager
{
    public:
        const uint8_t* key;
        
        CryptoManager(const uint8_t* key);
        void setKey(const uint8_t* key);
        size_t pkcs7Unpad(uint8_t* buf,size_t len);
        void decrypt(uint8_t* data,size_t len);
        void setInitVector(uint8_t* payload);
    
    private:
        uint8_t* iv;
        OTAState& state=OTAState::getInstance();
};
#endif