#include "CryptoManager.h"

CryptoManager::CryptoManager(const uint8_t* key){
    this->setKey(key);
}

void CryptoManager::setKey(const uint8_t* key){
    this->key = key;
}

size_t CryptoManager::pkcs7Unpad(uint8_t* buf,size_t len){
    uint8_t pad = buf[len-1];
    if (pad == 0 || pad > 16) {
        state.setError(Error::CRYPTO_DECRYPT_FAIL);
        return len;
    }
    return len - pad;
}

void CryptoManager::decrypt(uint8_t* data,size_t len){
    br_aes_ct_cbcdec_keys dec;
    br_aes_ct_cbcdec_init(&dec, this->key, 16);
    br_aes_ct_cbcdec_run(&dec, this->iv, data, len);
}

void CryptoManager::setInitVector(uint8_t* payload){
    this->iv = payload;
}