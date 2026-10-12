#include "OTAState.h"

OTAState& OTAState::getInstance(){
    static OTAState ota;
    return ota;
}

void OTAState::setClient(PubSubClient& client){
    this->client = client;
}

void OTAState::setState(State state){
    OTAState::setState(state, 0,"");
}
void OTAState::setState(State state, size_t length){
    OTAState::setState(state, length,"");
}
void OTAState::setState(State state, bool check){
    OTAState::setState(state,0,check?"TRUE":"FALSE");
}
void OTAState::setState(State state, size_t totalLength, size_t contentLn){
    char buffer[100];
    snprintf(buffer,sizeof(buffer)," %d / %d byte ( %d %% )",totalLength,contentLn,(totalLength * 100)/contentLn);
    OTAState::setState(state,0,buffer);
}

void OTAState::setState(State state, size_t length,const char* detail){
    this->state = state;
    char detailMsg[50];
    switch (this->state){
        case State::IDLE:
            snprintf(detailMsg,sizeof(detailMsg),"START");
            if(debugPort!=nullptr) debugPort->printf("[ IDLE ] START \n");
            break;
        case State::RECEIVING:
            snprintf(detailMsg,sizeof(detailMsg),"%s: %d byte",detail,length);
            if(debugPort!=nullptr) debugPort->printf("[ RECEIVING ] %s: %d byte \n",detail,length);
            break;
        case State::VERIFYING:
            snprintf(detailMsg,sizeof(detailMsg),"%s",detail);
            if(debugPort!=nullptr) debugPort->printf("[ VERIFYING ] %s \n",detail);
            break;
        case State::UPDATING:
            snprintf(detailMsg,sizeof(detailMsg),"UPDATE FIRMWARE %s",detail);
            if(debugPort!=nullptr) debugPort->printf("[ UPDATING ] UPDATE FIRMWARE %s \n",detail);
            break;
        case State::RESTART:
            snprintf(detailMsg,sizeof(detailMsg),"RESTART");
            if(debugPort!=nullptr) debugPort->printf("[ RESTART ] DONE \n");
            break;
        case State::ERROR:
            snprintf(detailMsg,sizeof(detailMsg),"%s",detail);
            if(debugPort!=nullptr) debugPort->printf("[ ERROR ] %s \n",detail);
            break;
    }
    String data = "{\"chip_id\":\"" + String(ESP.getChipId()) + "\",\"ip\":\"" + WiFi.localIP().toString() +
    "\",\"status\":\"" + OTAState::stateToString(state) + "\",\"detail\":\"" + String(detailMsg) + "\"}";
    client.publish("state", data.c_str());
}

void OTAState::setError(Error error){
    OTAState::setError(error,"");
}

void OTAState::setError(Error error,String detail){ // 대소문자 구분하자
    this->error=error;
    char detailMsg[50];
    switch (error){
        case Error::FLASH_BEGIN_FAILED:
            snprintf(detailMsg,sizeof(detailMsg),"CHECK YOUR FIRMWARE SIZE");
            if(debugPort!=nullptr) debugPort->printf("[ FLASH BEGIN FAILED ] CHECK YOUR FIRMWARE SIZE \n");
            break;
        case Error::FLASH_WRITE_FAILED:
            snprintf(detailMsg,sizeof(detailMsg),"NOT ENOUGH SPACE");
            if(debugPort!=nullptr) debugPort->printf("[ FLASH WRITE FAILED ] NOT ENOUGH SPACE \n");
            break;
        case Error::FLASH_END_FAILED:
            snprintf(detailMsg,sizeof(detailMsg),"Magic byte is not 0xE9");
            if(debugPort!=nullptr) debugPort->printf("[ FLASH END FAILED ] Magic byte is not 0xE9 \n");
            break;
        case Error::HASH_MISMATCH:
            snprintf(detailMsg,sizeof(detailMsg),"CHECK YOUR HASH");
            if(debugPort!=nullptr) debugPort->printf("[ HASH MISMATCH ] CHECK YOUR HASH \n");
            break;
        case Error::CRYPTO_DECRYPT_FAIL:
            snprintf(detailMsg,sizeof(detailMsg),"FAIL DECRYPT CRYPTO");
            if(debugPort!=nullptr) debugPort->printf("[ CRYPTO DECRYPT FAIL ] FAIL DECRYPT CRYPTO \n");
            break;
        case Error::PROTOCOL_LENGTH_MISMATCH:
            snprintf(detailMsg,sizeof(detailMsg),"CHECK YOUR PROTOCOL");
            if(debugPort!=nullptr) debugPort->printf("[ PROTOCOL LENGTH MISMATCH ] CHECK YOUR PROTOCOL \n");
            break;
        case Error::PROTOCOL_INVALID_SEQUENCE:
            snprintf(detailMsg,sizeof(detailMsg),"CHECK YOUR SEQUENCE");
            if(debugPort!=nullptr) debugPort->printf("[ PROTOCOL INVALID SEQUENCE ] CHECK YOUR SEQUENCE \n");
            break;
    }
    
    OTAState::setState(State::ERROR,0,detailMsg);
}

bool OTAState::hasError(){
    if(this->error==Error::NONE){
        return false;
    }
    return true;
}

String OTAState::stateToString(State state){
    switch (state){
        case State::IDLE:
            return "IDLE";
        case State::RECEIVING:
            return "RECEIVING";
        case State::VERIFYING:
            return "VERIFYING";
        case State::UPDATING:
            return "UPDATING";
        case State::RESTART:
            return "RESTART";
        case State::ERROR:
            return "ERROR";
    }
    return "UNKNOWN";
}