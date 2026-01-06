#include "base64.h"


void base64Decode(String input, uint8_t* output, unsigned int outputMaxLen){
    unsigned int outLen = 0;
    uint32_t buffer = 0;
    int bitsCollected = 0;

    for (unsigned int i = 0; i < input.length(); ++i) {
        uint8_t c = static_cast<uint8_t>(input[i]);
        int8_t val = base64Index[c];

        if (val == -1) continue;
        if (val == -2) break;

        buffer = (buffer << 6) | val;
        bitsCollected += 6;

        if (bitsCollected >= 8) {
            bitsCollected -= 8;
            if (outLen >= outputMaxLen) return ;
            output[outLen++] =
                static_cast<uint8_t>(buffer >> bitsCollected);
        }
    }
}

void base64Encode(uint8_t* input, String output, unsigned int outputMaxLen, unsigned int inputLen){
    size_t outLen = 0;
    uint32_t buffer = 0;
    int bitsCollected = 0;

    for (size_t i = 0; i < inputLen; ++i) {
        buffer = (buffer << 8) | input[i];
        bitsCollected += 8;

        while (bitsCollected >= 6) {
            bitsCollected -= 6;
            if (outLen >= outputMaxLen) return ;
            output[outLen++] =
                base64Table[(buffer >> bitsCollected) & 0x3F];
        }
    }

    if (bitsCollected > 0) {
        buffer <<= (6 - bitsCollected);
        if (outLen < outputMaxLen) {
            output[outLen++] = base64Table[buffer & 0x3F];
        }
    }

    // padding '='
    while (outLen % 4 != 0) {
        if (outLen >= outputMaxLen) break;
        output[outLen++] = '=';
    }

    return ;
}