#include "GlobalVariables.h"
#include "SystemState.h"

void setup() {
  Setminutes(1000 * 60);
  SettrigerTime(3000);
  isReady = false;
  pinMode(pump, OUTPUT);
  PumpOFF();
  Serial.begin(115200);
  WiFi_Setup();
  dht.begin();
  SetisPumpON(true);
  UpdatestatusCheckTime();

    configTzTime(timeZone, ntpServer);
  initializeSystem();
}

void loop() {
  if (!isReady) return;

  if ((millis() - GetlastSentDataTime()) > (2000)) {
    // CurrentStatus = GetState();
    SetCurrentStatus(GetState());
    dataMode(GetCurrentStatus());
    TimeDatePrint();
    logStateChange(GetCurrentStatus());
    // lastSentDataTime = millis();
    UpdatelastSentDataTime();
  }

  if (millis() - GetstatusCheckTime() > (1 * minutes)) {
    Serial.println("📤 Sending Data...");
    SendData(GetCurrentTemp(), Getlight(), Getmoisture());
    // if(CurrentTemp > 0 && light > 0 ) { SendToDatasensors(CurrentTemp, light, moisture, String(isPumpON ? 1 : 0)); }   // לבידקה אחר כך
    SendToDatasensors(GetCurrentTemp(), Getlight(), Getmoisture(), String(GetisPumpON() ? 1 : 0));
    UpdatestatusCheckTime();
  }
  SM();
}
