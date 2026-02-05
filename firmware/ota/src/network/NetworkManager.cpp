#include "NetworkManager.h"

// OTAController(const uint8_t* key,ICryptoManager& crypto,IHashManager& hash,IUpdateManager& update)
NetworkManager::NetworkManager(const String backendUrl,IOTAController& controller)
    :backendUrl(backendUrl),client(this->wifiClient),controller(controller){}

void NetworkManager::begin(const char* ssid, const char* password,const char* mqttUrl,int mqttPort){
    this->ssid = ssid;
    this->password = password;

    NetworkManager::onConnect();
    
    NetworkManager::onConnectBackend();

    this->client.setServer(mqttUrl,mqttPort);
    this->client.setBufferSize(1200);
    
    mqttHandler.begin(this->controller, this->client);

}

void NetworkManager::onConnect(){

    int retryCnt = 0;

    WiFi.begin(this->ssid,this->password);

    while (WiFi.status() != WL_CONNECTED && retryCnt < 20) {
        delay(500);
        if(debugPort!=nullptr){
            debugPort->print(".");
        }
        retryCnt++;
    }


    if (WiFi.status() != WL_CONNECTED) {
        if(debugPort!=nullptr){
            debugPort->println("\nWi-Fi 연결 실패! Wi-Fi 정보를 확인하거나 재시작해주세요.");
        }
        return;
    }

    if(debugPort!=nullptr){
        debugPort->println("\nWi-Fi 연결 성공!");
    }
}

void NetworkManager::onConnectBackend(){
    
    String data = "{\"chipId\":\"" + String(ESP.getChipId()) + "\",\"ip\":\"" + WiFi.localIP().toString() + "\"}";
    this->http.begin(this->wifiClient,this->backendUrl + "/mcu");
    this->http.addHeader("Content-Type","application/json");
    int httpResponseCode = this->http.POST(data);
    if(debugPort!=nullptr){
        debugPort->print("HTTP 응답 코드: ");
        debugPort->println(httpResponseCode);
    }
}

bool NetworkManager::isMqttConnected(){
    return this->client.connected();
}

void NetworkManager::mqttReconnect(){
    if(debugPort!=nullptr){
        debugPort->print("MQTT 브로커 연결 시도 중...");
    }

    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);

    if (this->client.connect(clientId.c_str())) { 
        mqttHandler.subscribeTopic();
        if(debugPort!=nullptr){  
            debugPort->print(clientId);
            debugPort->println("연결 성공!");
        }
        this->controller.begin();
    } else {
        if(debugPort!=nullptr){
            debugPort->print("연결 실패, rc=");
            debugPort->print(this->client.state());
            debugPort->println(" 5초 후 다시 시도...");
        }
        delay(5000); 
    }
}

//wifiReconnected로 명 변경할거 mqtt도 

void NetworkManager::loop(){
    while(!NetworkManager::isMqttConnected()){
        NetworkManager::mqttReconnect();
    }
    client.loop();
}