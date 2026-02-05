#include "OTAState.h"

OTAState& OTAState::getInstance(){
    static OTAState ota;
    return ota;
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
        switch (this->state){
            case State::IDLE:
                if(debugPort!=nullptr) debugPort->printf("[ IDLE ] START \n");
                break;
            case State::RECEIVING:
                if(debugPort!=nullptr) debugPort->printf("[ RECEIVING ] %s: %d byte \n",detail,length);
                break;
            case State::VERIFYING:
                if(debugPort!=nullptr) debugPort->printf("[ VERIFYING ] %s \n",detail);
                break;
            case State::UPDATING:
                if(debugPort!=nullptr) debugPort->printf("[ UPDATING ] UPDATE FIRMWARE %s \n",detail);
                break;
            case State::RESTART:
                if(debugPort!=nullptr) debugPort->printf("[ RESTART ] DONE \n");
                break;
            case State::ERROR:
                if(debugPort!=nullptr) debugPort->printf("[ ERROR ] %s \n",detail);
                break;
        }
}

void OTAState::setError(Error error){
    OTAState::setError(error,"");
}

void OTAState::setError(Error error,String detail){ // 대소문자 구분하자
    this->error=error;
    switch (error){
        case Error::FLASH_BEGIN_FAILED:
            if(debugPort!=nullptr) debugPort->printf("[ FLASH BEGIN FAILED ] CHECK YOUR FIRMWARE SIZE \n");
            break;
        case Error::FLASH_WRITE_FAILED:
            if(debugPort!=nullptr) debugPort->printf("[ FLASH WRITE FAILED ] NOT ENOUGH SPACE \n");
            break;
        case Error::FLASH_END_FAILED:
            if(debugPort!=nullptr) debugPort->printf("[ FLASH END FAILED ] %s \n",detail);
            break;
        case Error::HASH_MISMATCH:
            if(debugPort!=nullptr) debugPort->printf("[ HASH MISMATCH ] CHECK YOUR HASH \n");
            break;
        case Error::CRYPTO_DECRYPT_FAIL:
            if(debugPort!=nullptr) debugPort->printf("[ CRYPTO DECRYPT FAIL ] FAIL DECRYPT CRYPTO \n");
            break;
        case Error::PROTOCOL_LENGTH_MISMATCH:
            if(debugPort!=nullptr) debugPort->printf("[ PROTOCOL LENGTH MISMATCH ] CHECK YOUR PROTOCOL \n");
            break;
        case Error::PROTOCOL_INVALID_SEQUENCE:
            if(debugPort!=nullptr) debugPort->printf("[ PROTOCOL INVALID SEQUENCE ] CHECK YOUR SEQUENCE \n");
            break;
    }
}

bool OTAState::hasError(){
    if(this->error==Error::NONE){
        return false;
    }
    this->error=Error::NONE;
    return true;
}
