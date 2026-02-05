#include "UpdateManager.h"


void UpdateManager::setChunkIndex(int chunkIndex){
    this->chunkIndex = chunkIndex;
}
void UpdateManager::setChunkMax(int chunkSize,int contentLn){
    this->chunkMax = std::ceil((double)contentLn / chunkSize);
}
void UpdateManager::setChunkSize(int chunkSize){
    this->chunkSize = chunkSize;
}
void UpdateManager::setContentLn(uint8_t* payload,size_t length){
    this->contentLn = 0;
    for(size_t i = 0; i < length; i++){
        this->contentLn = this->contentLn<<8 | payload[i];
    }
}

int UpdateManager::getChipId(){
    return this->chipId;
}
int UpdateManager::getChunkIndex(){
    return this->chunkIndex;
}
int UpdateManager::getChunkMax(){
    return this->chunkMax;
}
int UpdateManager::getChunkSize(){
    return this->chunkSize;
}
int UpdateManager::getContentLn(){
    return this->contentLn;
}

void UpdateManager::begin(){
    if(!Update.begin(this->contentLn)){
        
        state.setError(Error::FLASH_BEGIN_FAILED);
        
        if (debugPort!=nullptr){
            Update.printError(*debugPort);
        }
    }
}

void UpdateManager::write(uint8_t* payload,size_t length){

    if (Update.write(payload, length) != length) { 

        state.setError(Error::FLASH_WRITE_FAILED);

        if(debugPort!=nullptr){
            Update.printError(*debugPort);
        }
    }
}

void UpdateManager::end(){
    if(Update.end(true)){
        delay(1000);
        ESP.restart();
    }else{
        if(debugPort!=nullptr){
            state.setError(Error::FLASH_END_FAILED,Update.getErrorString());
            Update.printError(*debugPort);
            debugPort->println();
        }
    }
}
