#ifndef IHASHMANAGER_H
#define IHASHMANAGER_H

#include "stdint.h"
#include <string.h>

class IHashManager
{
public:
    virtual ~IHashManager()=default;
    virtual void begin()=0;
    virtual void setDigest(uint8_t* payload, size_t length)=0;
    virtual void update(uint8_t* payload,size_t length)=0;
    virtual bool verifyHash()=0;

};

#endif