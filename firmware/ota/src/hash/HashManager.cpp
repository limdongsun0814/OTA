#include "HashManager.h"

void HashManager::setDigest(uint8_t* payload, size_t length){
    memcpy(this->digest,payload,32);
}

void HashManager::begin(){
    this->hash=SHA256();
}
void HashManager::update(uint8_t* payload,size_t length){
    this->hash.update(payload,length);
}

bool HashManager::verifyHash(){
    uint8_t calcDigest[32];
    this->hash.finalize(calcDigest,32);
    if(memcmp(calcDigest,this->digest,32)==0){
        return true;
    }
    return false;
}
/*
bool HashManager::setHash(uint8_t* payload,size_t length){

    if(this->chunkIndex==1){
        HashManager::begin();
    }

    HashManager::update(payload,length);

    if(this->chunkMax==this->chunkIndex){
        return HashManager::verifyHash(this->digest);
    }
    return true;
}

*/
// false일 경우 리셋하는 로직 필요