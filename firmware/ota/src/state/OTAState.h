#ifndef OTASTATE_H
#define OTASTATE_H

#include "../debug/DebugManager.h"
#include <stdio.h>
// ing 빼자
enum class State{
    IDLE,
    RECEIVING,
    VERIFYING,
    UPDATING,
    RESTART,
    ERROR
};

enum class Error{
    NONE,

    PROTOCOL_INVALID_SEQUENCE,
    PROTOCOL_LENGTH_MISMATCH,

    HASH_MISMATCH,
    CRYPTO_DECRYPT_FAIL,

    FLASH_BEGIN_FAILED, 
    FLASH_WRITE_FAILED, 
    FLASH_END_FAILED,   

};

class OTAState
{ 
    public:

        static OTAState& getInstance();

        void setState(State state);
        void setState(State state, size_t length);
        void setState(State state, bool check);
        void setState(State state, size_t totalLength, size_t contentLn);
        void setState(State state, size_t length,const char* detail);

        void setError(Error error);
        void setError(Error error,String detail);

        bool hasError();
    private:        
        OTAState(){}
        ~OTAState(){}
        
        OTAState(const OTAState&) = delete;
        OTAState& operator=(const OTAState&) = delete;

        State state;
        Error error=Error::NONE;
};

#endif