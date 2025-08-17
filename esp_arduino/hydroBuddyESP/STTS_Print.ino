// #include "SystemState.h"

void TimeDatePrint() {
  struct tm timeinfo;
  if (getLocalTime(&timeinfo)) {
    Serial.println("Time & Date");
    Serial.println("============================================");
    Serial.println("Date " + String(timeinfo.tm_mday) + "/" + String(timeinfo.tm_mon + 1) + "/" + String(timeinfo.tm_year + 1900));
    Serial.println("Time " + String(timeinfo.tm_hour) + ":" + String(timeinfo.tm_min));
    Serial.println("============================================\n");
  }
}

void logStateChange(int state) {
  switch (state) {
    case INIT_MODE:
      Serial.println("🛠️ Entered INIT_MODE");
      Serial.println("============================================");

      break;
    case TEMP_MODE:
      Serial.println("🌡️ Temperature Mode");
      Serial.println("============================================");
      Serial.println("Temperature Mode\n");
      Serial.println("light = " + String(Getlight()));
      Serial.println("CurrentTemp = " + String(GetCurrentTemp()));
      Serial.println("moisture = " + String(Getmoisture()));
      Serial.println("============================================");
      break;
    case SOIL_MOISTURE_MODE:
      Serial.println("🌱 Soil Moisture Mode");
      Serial.println("============================================");
      Serial.println("CurrentTemp = " + String(GetCurrentTemp()));
      Serial.println("moisture = " + String(Getmoisture()));
      Serial.println("Moisture level set to: " + String(GetmoistureLVL()));
      Serial.println("minimum Moisture is: " + String(GetminMoisture()));
      Serial.println("maximum Moisture is: " + String(GetmaxMoisture()));
      Serial.println("isValidMoisture: " + String(GetisValidMoisture()));
      (isValidMoisture) ? Serial.println("🚰 Pump ON - Humidity is Low ") : Serial.println("🚱 Pump OFF - Humidity is High");
      Serial.println("============================================");
      break;

    case SATURDAY_MODE:
      Serial.println("🕒 Saturday Mode");
      Serial.println("============================================");
      Serial.println("matchDate " + String(GetmatchDate()));
      Serial.println("matchTime " + String(GetmatchTime()));
      Serial.println("🕒 Saturday Mode Starts On: " + String(GetDateActivate()) + " at " + String(GetTimeActivate()) + " for " + String(Getduration()) + " minutes");
      if (digitalRead(pump) == LOW) Serial.println("🚰 Pump is ON");
      else Serial.println("🚱 Pump OFF");
      Serial.println("============================================");
      break;
    case MANUAL_MODE:
      Serial.println("🖐️ Manual Control Mode");
      Serial.println("============================================");
      if (Getmanual()) Serial.println("🚰 Pump ON - Manual Mode Active");
      else Serial.println("🚱 Pump OFF - Manual Mode Inactive");
      Serial.println("============================================");
      break;
    default:
      Serial.println("❓ Unknown mode entered");
      break;
  }
}
