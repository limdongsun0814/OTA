#ifndef ICRYPTOMANAGER_H
#define ICRYPTOMANAGER_H

#include "stdint.h"
#include "string.h"
class ICryptoManager{
    public:
        virtual ~ICryptoManager()=default;
        virtual void setKey(const uint8_t* key)=0;
        virtual size_t pkcs7Unpad(uint8_t* buf,size_t len)=0;
        virtual void decrypt(uint8_t* data,size_t len)=0;
        virtual void setInitVector(uint8_t* payload)=0;
};

#endif