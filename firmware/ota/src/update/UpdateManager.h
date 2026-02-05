#ifndef UPDATEMANAGER_H
#define UPDATEMANAGER_H

#include "stdint.h"
#include "../debug/DebugManager.h"
#include "../state/OTAState.h"
#include "IUpdateManager.h"
#include <Updater.h> 

class UpdateManager:public IUpdateManager
{
    public:

        void setChunkIndex(int chunkIndex);
        void setChunkMax(int chunkSize,int contentLn);
        void setChunkSize(int chunkSize);
        void setContentLn(uint8_t* payload,size_t length);
        
        int getChunkIndex();
        int getChunkMax();
        int getChunkSize();
        int getContentLn();
        int getChipId();

        void begin();
        void write(uint8_t* payload,size_t length);
        void end();
    
    private:
        int chunkIndex;
        int chunkMax;
        int chunkSize=1000;
        int contentLn;
        int chipId=ESP.getChipId();
        OTAState& state=OTAState::getInstance();
};
#endif