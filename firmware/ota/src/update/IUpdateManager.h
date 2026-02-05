#ifndef IUPDATEMANAGER_H
#define IUPDATEMANAGER_H

#include "stdint.h"

class IUpdateManager
{
    public:
        virtual ~IUpdateManager()=default;
        virtual void setChunkIndex(int chunkIndex)=0;
        virtual void setChunkMax(int chunkSize,int contentLn)=0;
        virtual void setChunkSize(int chunkSize)=0;
        virtual void setContentLn(uint8_t* payload,size_t length)=0;
        
        virtual int getChunkIndex()=0;
        virtual int getChunkMax()=0;
        virtual int getChunkSize()=0;
        virtual int getContentLn()=0;
        virtual int getChipId()=0;

        virtual void begin()=0;
        virtual void write(uint8_t* payload,size_t length)=0;
        virtual void end()=0;
    
};
#endif