#include "OTA.h"

OTAClass::OTAClass():OTAClass(80){}

OTAClass::OTAClass(uint16_t port):client(espClient) {
    #if STACK_THUNK_ADD_REF
        stackThunkAddRef();
    #endif
    this->port = port;
    this->server = new ESP8266WebServer(this->port);
    
}

OTAClass::~OTAClass(){
    #if STACK_THUNK_del_REF
        stackThunkDelRef();
    #endif

}

void OTAClass::begin(const char* ssid, const char* password,String url){
    this->ssid = ssid;
    this->password = password;
    OTAClass::WiFiConnect(this->ssid,this->password);
    OTAClass::initMCU(url);
}

void OTAClass::initMCU(String url){
    String postData = "{\"chipId\":\"" + String(ESP.getChipId()) + "\",\"ip\":\"" + WiFi.localIP().toString() + "\"}";
    this->http.begin(this->espClient,url + "/mcu");
    this->http.addHeader("COntent-Type","application/json");
    int httpResponseCode = this->http.POST(postData);
    if(this->_debugPort!=nullptr){
        this->_debugPort->print(postData);
        this->_debugPort->print(url + "/mcu");
    }
    if(httpResponseCode>0){
        if(this->_debugPort!=nullptr){
            this->_debugPort->print("HTTP 응답 코드: ");
            this->_debugPort->println(httpResponseCode);
        }
    }
}

void OTAClass::WiFiConnect(const char* ssid, const char* password){
    int retryCnt = 0;

    WiFi.begin(this->ssid,this->password);

    while (WiFi.status() != WL_CONNECTED && retryCnt < 20) {
        delay(500);
        if(this->_debugPort!=nullptr){
            this->_debugPort->print(".");
        }
        retryCnt++;
    }


    if (WiFi.status() != WL_CONNECTED) {
        if(this->_debugPort!=nullptr){
            this->_debugPort->println("\nWi-Fi 연결 실패! Wi-Fi 정보를 확인하거나 재시작해주세요.");
        }
        return;
    }
    if(this->_debugPort!=nullptr){
        this->_debugPort->println("\nWi-Fi 연결 성공!");
        this->_debugPort->print("IP 주소: ");
        this->_debugPort->println(WiFi.localIP());
    }

}

void OTAClass::routerSetup(String updateUrl, HTTPMethod HTTPMethod){
  this->server->on(
    updateUrl, HTTPMethod,
    [this]() { 
        this->server->send(200, "text/plain","{\"responseStatus\": \"" + this->responseStatus + "\", \"responseMessage\":\"" + this->responseMessage + "\"}");
        if(this->shouldRestart){
          delay(1000);
          ESP.restart();
      }
    },
    [this](){
        OTAClass::handleUpdate();
    }
  );
  this->server->onNotFound(
    [this](){
        OTAClass::handleNotFound();
    }
  );

  OTAClass::addRouterSetup();

  this->server->begin();
    if(this->_debugPort!=nullptr){
        this->_debugPort->println("HTTP 서버 시작됨.");
    }
}

void OTAClass::WiFiConfig(IPAddress ip,IPAddress gateway,IPAddress subnet){
    WiFi.config(ip, gateway, subnet);
}
void OTAClass::handleUpdate(){
    HTTPUpload& upload = this->server->upload();
    responseMessage = "";
    responseStatus = "";
    shouldRestart =false;

    if (upload.status == UPLOAD_FILE_START) { 
        if(this->_debugPort!=nullptr){
            this->_debugPort->printf("업데이트 시작: %s %u (총 %u 바이트)\n", upload.filename.c_str(),upload.totalSize, upload.contentLength);
        }
        if (!Update.begin(upload.contentLength)) { 
            Update.printError(Serial);
            responseMessage = "업데이트 시작 실패!";
            responseStatus = "error";
            if(this->_debugPort!=nullptr){
                this->_debugPort->printf("업데이트 시작 : %s %u %u%%(총 %u 바이트)\n", upload.filename.c_str(),upload.totalSize,100*upload.totalSize/upload.contentLength, upload.contentLength);
            }
        }
    } else if (upload.status == UPLOAD_FILE_WRITE) { 
        if(this->_debugPort!=nullptr){
            this->_debugPort->printf("업데이트 중 : %s %u %u%%(총 %u 바이트)\n", upload.filename.c_str(),upload.totalSize,100*upload.totalSize/upload.contentLength, upload.contentLength);
        }
        if (Update.write(upload.buf, upload.currentSize) != upload.currentSize) { 
            responseMessage = "데이터 쓰기 실패!";
            responseStatus = "error";
        }
    } else if (upload.status == UPLOAD_FILE_END) {
        if (Update.end(true)) {
            if(this->_debugPort!=nullptr){
                this->_debugPort->printf("업데이트 종료 : %s %u %u%%(총 %u 바이트)\n", upload.filename.c_str(),upload.totalSize,100*upload.totalSize/upload.contentLength, upload.contentLength);
            }
            responseMessage = "업데이트 성공! ESP8266 재시작 중...";
            responseStatus = "success";
            shouldRestart =true;
        } else {
            Update.printError(Serial);
            responseMessage = "업데이트 실패! 로그를 확인하세요.";
            responseStatus = "error";
        }
    } else if (upload.status == UPLOAD_FILE_ABORTED) {
        if(this->_debugPort!=nullptr){
            this->_debugPort->println("업데이트 중단됨.");
        }
        responseMessage = "업데이트 중단됨.";
        responseStatus = "error";
    }
}
void OTAClass::handleNotFound(){
  server->send(404, "text/plain", "404 Not Found");
}
void OTAClass::handleClient(){
    this->server->handleClient();
}

void OTAClass::addRouterSetup(){

}


void OTAClass::setupDebug(Print* debugPort){
    this->_debugPort = debugPort;
    this->_debugPort->println("Debug mode Start");
}