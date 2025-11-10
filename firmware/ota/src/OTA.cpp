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

void OTAClass::begin(const char* ssid, const char* password,String url,const char* mqttUrl,int mqttPort){
    this->ssid = ssid;
    this->password = password;
    OTAClass::WiFiConnect(this->ssid,this->password);
    OTAClass::initMCU(url);
    this->client.setServer(mqttUrl,mqttPort);
    // this->client.setBufferSize(1024);
    this->client.setCallback([this](char* topic, byte* payload, unsigned int length) {
        OTAClass::mqttCallback(topic,payload,length);
    });
}

void OTAClass::initMCU(String url){
    String postData = "{\"chipId\":\"" + String(this->chipId) + "\",\"ip\":\"" + WiFi.localIP().toString() + "\"}";
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
    this->shouldRestart =false;

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
            this->shouldRestart =true;
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
    if(!this->client.connected()){
        OTAClass::reconnect();
    }
    this->client.loop();
}
void OTAClass::reconnect(){
  while (!this->client.connected()) {
    this->_debugPort->print("MQTT 브로커 연결 시도 중...");
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    
    if (this->client.connect(clientId.c_str())) { 
      this->_debugPort->println("연결 성공!");
      
      this->client.subscribe(String(this->chipId).c_str());
      this->client.subscribe("status");
      this->_debugPort->print("토픽 '");
      this->_debugPort->print(String(this->chipId).c_str());
      this->_debugPort->println("' 구독 완료.");

    } else {
      this->_debugPort->print("연결 실패, rc=");
      this->_debugPort->print(this->client.state());
      this->_debugPort->println(" 5초 후 다시 시도...");
      delay(5000); 
    }
  }
}

void OTAClass::mqttCallback(char* topic, byte* payload, unsigned int length){
    this->_debugPort->print("메시지 도착 [");
    this->_debugPort->print(topic);
    this->_debugPort->print("] ");
    if(strcmp(topic,"status") == 0){
        int dataNum = 0;
        String dataStr = "";
        int cnt = 0;
        for (int i = 0; i < length; i++) {
            if(payload[i]!=','){
                if(cnt==2){
                    dataStr+=(char)payload[i];
                    if(payload[i]=='\\'){
                        dataStr+=(char)payload[i];
                    }
                }else{
                    dataNum=dataNum*10 + (char)payload[i] - '0';
                }
            }else{
                if(cnt==0){
                    this->chunkMax=dataNum;
                }else if(cnt==1){
                    this->chunkSize=dataNum;
                }else if(cnt==2){
                    this->fileName=dataStr;
                }else if(cnt==3){
                    this->contentLength=dataNum;
                }else if(chipId==dataNum){
                    // 데이터 + 토픽 + 오버해드 
                    this->client.setBufferSize(this->chunkSize+30);
                    this->chunkIndex=0;
                    OTAClass::mqttOTAPublish();
                }
                cnt++;
                dataNum = 0;
            }
        }
    this->_debugPort->println();
    }else if(strcmp(topic,String(this->chipId).c_str()) == 0){
        OTAClass::mqttUpdate(payload,length);
        if(this->chunkIndex!=this->chunkMax){
            OTAClass::mqttOTAPublish(); 
        }
    }
}

void OTAClass::mqttUpdate(byte* payload,unsigned int length){
    if(this->chunkIndex==1){
        if (!Update.begin(this->contentLength)) { 
            Update.printError(Serial);
            responseMessage = "업데이트 시작 실패!";
            responseStatus = "error";
            if(this->_debugPort!=nullptr){
                this->_debugPort->printf("업데이트 시작 : %s %u %u%%(총 %u 바이트)\n", this->fileName.c_str(),length,100*this->chunkIndex*this->chunkSize/this->contentLength, this->contentLength);
            }
        }
    }
    if(this->_debugPort!=nullptr){
        this->_debugPort->printf("업데이트 중 : %s %u %u%%(총 %u 바이트)\n", this->fileName.c_str(),length,100*this->chunkIndex*this->chunkSize/this->contentLength, this->contentLength);
    }
    if (Update.write(payload, length) != length) { 
        if(this->_debugPort!=nullptr){
            this->_debugPort->printf("업데이트 실패\n");
        }
    }
    if(this->chunkIndex==this->chunkMax){
        if(Update.end(true)){
        if(this->_debugPort!=nullptr){
            this->_debugPort->printf("업데이트 종료 : %s %u %u%%(총 %u 바이트)\n", this->fileName.c_str(),length,100*this->chunkIndex*this->chunkSize/this->contentLength, this->contentLength);
        }
          delay(1000);
          ESP.restart();
        }else{
            Update.printError(Serial);
            if(this->_debugPort!=nullptr){
                this->_debugPort->printf("업데이트 실패\n");
            }
        }
    }
}
void OTAClass::mqttOTAPublish(){
    String chipIdStr = String(this->chipId);
    String chunkSizeStr = String(this->chunkSize);
    String chunkMaxStr = String(this->chunkMax);
    String payload_str = "{\"chipId\":\""+chipIdStr+"\",\"chunkSize\":"+chunkSizeStr+",\"chunkMax\":"+chunkMaxStr+",\"chunkIndex\":"+String(chunkIndex)+",\"fileName\":\""+this->fileName+"\"}";
    this->client.publish("backend", payload_str.c_str());
    this->chunkIndex++;
}


void OTAClass::addRouterSetup(){

}


void OTAClass::setupDebug(Print* debugPort){
    this->_debugPort = debugPort;
    this->_debugPort->println("Debug mode Start");
}