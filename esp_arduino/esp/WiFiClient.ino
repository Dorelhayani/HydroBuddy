#include <WiFi.h>
#include <WiFiClient.h>
#include <HTTPClient.h>

const char* ssid = "Dor_EL";
// const char* ssid = "Kinneret College";
const char* password = "1a2b3c4d5e";

String Port = "5050";
String IPadress = "http://10.0.0.14"; // home IP
// String IPadress = "http://10.9.0.241"; // kinneret IP

WiFiClient client;
// WiFi_Setup
// ===================================================================================================================
void WiFi_Setup() {
  WiFi.begin(ssid, password);
  // WiFi.begin(ssid);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.print("IP Address: ");
  Serial.println("WiFi Connected");
}
// ===================================================================================================================

// SendData
// ===================================================================================================================
void SendData(float temp, int light, int moisture) {
  HTTPClient http;
  String dataURL = "Temp=" + String(temp);
  dataURL += "&Light=" + String(light);
  dataURL += "&Moisture=" + String(moisture);
  http.begin(client, IPadress + ":" + Port + "/esp?" + dataURL);
  int httpCode = http.GET();
  if (httpCode == HTTP_CODE_OK) {
    Serial.print("SendData HTTP response code");
    Serial.println(httpCode);
  }
  http.end();
}
// ===================================================================================================================

// SendToDatasensors
// ===================================================================================================================
void SendToDatasensors(float temp, int light, int moisture, bool isPumpON) {
  HTTPClient http;
  http.begin(client, IPadress + ":"  + Port + "/PlantRout/StoreToDatasensors");
  http.addHeader("Content-Type", "application/json");
  String dataToJson = "{\"temp\":" + String(temp) + ",\"light\":" + String(light) + ",\"moisture\":" + String(moisture) + ",\"isPumpON\":" + String(isPumpON ? 1 : 0) + "}";
  int httpCode = http.POST(dataToJson);
  if (httpCode > 0) {
    Serial.print("SendToDatasensors HTTP response code");
    Serial.println(httpCode);
  }
  http.end();
}
// ===================================================================================================================

// GetState
// ===================================================================================================================
int GetState() {
  int ret = -1;
  HTTPClient http;
  http.begin(client, IPadress + ":" + Port + "/esp/state");
  String STTS = String(CurrentStatus);
  int httpCode = http.PATCH(STTS);
  Serial.print(httpCode);
  if (httpCode == HTTP_CODE_OK) {
    Serial.print("GetState HTTP response code");
    Serial.println(httpCode);
    String Res = http.getString();
    int start = Res.indexOf("\"CurrentStatus\":\"") + 17;  // מצא את המיקום של "CurrentStatus"
    int end = Res.indexOf("\"", start);                    // מצא את הסוף של הערך
    String stateStr = Res.substring(start, end);           // קח את הערך של הסטייט
    ret = stateStr.toInt();
  }
  http.end();
  return ret;
}
// ===================================================================================================================

// dataMode
// ===================================================================================================================
void dataMode(int CurrentStatus) {
  HTTPClient http;
  String dataURL = "&MCurrentStatus=" + String(CurrentStatus);
  http.begin(client, IPadress + ":" + Port + "/esp/state?" + CurrentStatus);
  int httpCode = http.PATCH(String(CurrentStatus));
  if (httpCode == HTTP_CODE_OK) {
    Serial.print("dataMode HTTP response code");
    Serial.println(httpCode);
  }
  http.end();
}
// ===================================================================================================================

// getJsonData
// ===================================================================================================================
String getJsonData(String state) {
  String Json = "";
  HTTPClient http;
  http.begin(client, IPadress + ":" + Port + "/esp/dataMode?state=" + state);
  int httpCode = http.GET();
  Serial.print(httpCode);
  if (httpCode == HTTP_CODE_OK) {
    Json = http.getString();
    Serial.print("getJsonData HTTP response code");
    Serial.println(httpCode);
    // String Res = http.getString();
    // Serial.print(Res);
    Serial.print(Json);
  }
  http.end();
  return Json;
}
// ===================================================================================================================