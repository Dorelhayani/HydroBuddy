// #include "SystemState.h"
// typedef void (*StatePrintFunction)();

// // Time & Date Print
// // ==============================================================================================
// void TimeDatePrint() {
//   struct tm timeinfo;
//   if (getLocalTime(&timeinfo)) {
//     Serial.println("Time & Date");
//     Serial.println("============================================");
//     Serial.println("Date " + String(timeinfo.tm_mday) + "/" + String(timeinfo.tm_mon + 1) + "/" + String(timeinfo.tm_year + 1900));
//     Serial.println("Time " + String(timeinfo.tm_hour) + ":" + String(timeinfo.tm_min));
//     Serial.println("============================================\n");
//   }
// }
// // ==============================================================================================


// // Temperatue Mode
// // ==============================================================================================
// void Temperatue_Mode_Print() {
//   Serial.println("🌡️ Temperature Mode");
//   Serial.println("============================================");
//   Serial.println("Temperature Mode\n");
//   Serial.println("light = " + String(Getlight()));
//   Serial.println("CurrentTemp = " + String(GetCurrentTemp()));
//   Serial.println("moisture = " + String(Getmoisture()));
//   Serial.println("============================================");
// }
// // ==============================================================================================


// // Soil Moisture Mode
// // ==============================================================================================
// void Soil_Moisture_Mode_Print() {
//   Serial.println("🌱 Soil Moisture Mode");
//   Serial.println("============================================");
//   Serial.println("CurrentTemp = " + String(GetCurrentTemp()));
//   Serial.println("moisture = " + String(Getmoisture()));
//   Serial.println("Moisture level set to: " + String(GetmoistureLVL()));
//   Serial.println("minimum Moisture is: " + String(GetminMoisture()));
//   Serial.println("maximum Moisture is: " + String(GetmaxMoisture()));
//   Serial.println("isValidMoisture: " + String(GetisValidMoisture()));
//   (isValidMoisture) ? Serial.println("🚰 Pump ON - Humidity is Low ") : Serial.println("🚱 Pump OFF - Humidity is High");
//   Serial.println("============================================");
// }
// // ==============================================================================================


// // Saturday Mode
// // ==============================================================================================
// void Saturday_Mode_Print() {
//   Serial.println("🕒 Saturday Mode");
//   Serial.println("============================================");
//   Serial.println("matchDate " + String(GetmatchDate()));
//   Serial.println("matchTime " + String(GetmatchTime()));
//   Serial.println("🕒 Saturday Mode Starts On: " + String(GetDateActivate()) + " at " + String(GetTimeActivate()) + " for " + String(Getduration()) + " minutes");
//   if (digitalRead(pump) == LOW) Serial.println("🚰 Pump is ON");
//   else Serial.println("🚱 Pump OFF");
//   Serial.println("============================================");
// }
// // ==============================================================================================


// // Manual Mode
// // ==============================================================================================
// void Manual_Mode_Print() {
//   Serial.println("🖐️ Manual Control Mode");
//   Serial.println("============================================");
//   if (Getmanual()) Serial.println("🚰 Pump ON - Manual Mode Active");
//   else Serial.println("🚱 Pump OFF - Manual Mode Inactive");
//   Serial.println("============================================");
// }
// // ==============================================================================================



// StatePrintFunction StatePrint[] = {
//   Temperatue_Mode_Print,
//   Soil_Moisture_Mode_Print,
//   Saturday_Mode_Print,
//   Manual_Mode_Print
// };

// void PrintSTTS() {
//   if (CurrentStatus < (sizeof(StatePrint) / sizeof(StatePrint[0]))) { StatePrint[CurrentStatus](); }
// }
