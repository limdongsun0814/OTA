#ifndef HASHMANAGER_H
#define HASHMANAGER_H

#include "stdint.h"
#include "IHashManager.h"
#include <string.h>
#include <SHA256.h>

class HashManager : public IHashManager
{
public:
    void begin();
    void setDigest(uint8_t* payload, size_t length);
    void update(uint8_t* payload,size_t length);
    bool verifyHash();

private:
    SHA256 hash;
    uint8_t digest[32];
    // bool setHash(uint8_t* payload,size_t length);
};

#endif