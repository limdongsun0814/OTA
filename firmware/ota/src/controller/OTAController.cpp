#include "OTAController.h"
// key 위치
OTAController::OTAController(ICryptoManager& crypto,IHashManager& hash,IUpdateManager& update):crypto(crypto),hash(hash),update(update){}

void OTAController::begin(){
    state.setState(State::IDLE);
}

void OTAController::onStatus(uint8_t* payload, size_t length,PubSubClient& client){
    state.setState(State::RECEIVING,length,"STATUS");

    if(32 >= length){
        state.setError(Error::PROTOCOL_LENGTH_MISMATCH);
        state.hasError();
        return;
    }

    hash.begin();
    hash.setDigest(payload,32);

    update.setChunkIndex(0); 
    update.setContentLn(payload+32,length-32);
    update.setChunkMax(update.getChunkSize(),update.getContentLn());

    checkStatus = true;
    /*
        if(debugPort!=nullptr){
            debugPort->printf("chunkIndex: %d ",update.getChunkIndex());
            debugPort->printf("contentLength: %d ",update.getContentLn());
            debugPort->printf("chunkMax: %d \n",update.getChunkMax());
        }
    */
    
    OTAController::onPub(client);
}
void OTAController::onUpdate(uint8_t* payload, size_t length,PubSubClient& client){
    state.setState(State::RECEIVING,length,"UPDATE");

    if(!checkStatus){
        state.setError(Error::PROTOCOL_INVALID_SEQUENCE);
        state.hasError();
        return;
    }

    if( (size_t) ((update.getChunkSize()/16)+1)*16+16 < length){
        state.setError(Error::PROTOCOL_LENGTH_MISMATCH);
        state.hasError();
        return;
    }

    crypto.setInitVector(payload);
    uint8_t* fileData = payload+16;
    
    crypto.decrypt(fileData,length-16);
    length=crypto.pkcs7Unpad(fileData,length-16);
    if(state.hasError()){
        return;
    }

    bool hashCheck = true;
    bool endPoint = update.getChunkIndex()==update.getChunkMax();
    bool startPoint = update.getChunkIndex()==1;
    hash.update(fileData,length);

    if(endPoint){
        hashCheck=hash.verifyHash();
        state.setState(State::VERIFYING,hashCheck);
    }
    

    if(hashCheck){
        if(startPoint) update.begin();
        if(state.hasError()){
            return;
        }

        state.setState(State::UPDATING,(update.getChunkIndex()-1)*update.getChunkSize()+length,update.getContentLn());
        update.write(fileData,length);
        if(state.hasError()){ 
            return;
        }

        if(endPoint){ 
            state.setState(State::RESTART);
            update.end();
            if(state.hasError()){ 
                return;
            }
        }
    }else{
        state.setError(Error::HASH_MISMATCH);
        state.hasError();
        return;
    }

    if(!endPoint) OTAController::onPub(client);
}

void OTAController::onPub(PubSubClient& client){
    String chipIdStr=String(update.getChipId());
    String chunkIndexStr=String(update.getChunkIndex());
    String pubMsg="{\"chipId\":\""+chipIdStr+"\""+","+"\"chunkIndex\":"+chunkIndexStr+"}";
    
    client.publish("backend", pubMsg.c_str());
    update.setChunkIndex(update.getChunkIndex()+1);
}