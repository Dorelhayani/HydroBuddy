#include "SystemState.h"
typedef void (*StateFunction)();

// Temperatue Mode
// ==============================================================================================
void Temperatue_Mode() {
  UpdateCurrentTemp();
  Updatelight();

  if ((millis() - GetDataPullTime()) > (1 * Getminutes())) {
    String jsonData = getJsonData("TEMP_MODE");
    deserializeJson(doc, jsonData);
    Updatetemp();
    UpdateminTime();
    UpdateminTime();
    UpdateDataPullTime();
  }

  if (Getlight() > 70) SetisPumpON(true);
  else if (Getlight() < 10 && GetcountON() == 2) {
    SetisPumpON(true);
    SetcountON(0);
  }

  if (GetisPumpON() && Gettemp() < GetCurrentTemp() && GetcountON() < 2 && Getlight() < 40) {
    PumpON();
    if (millis() - GeactivationTime() > (GetmaxTime() * Getminutes())) {
      PumpOFF();
      SetisPumpON(false);
      UpdatecountON();
      UpdateactivationTime();
    }
  } else if (GetisPumpON() && GetcountON() < 2) {
    PumpON();
    if (millis() - GeactivationTime() > (GetminTime() * Getminutes())) {
      PumpOFF();
      SetisPumpON(false);
      UpdatecountON();
      UpdateactivationTime();
    }
  }
}
// ==============================================================================================


// Soil Moisture Mode
// ==============================================================================================
void Soil_Moisture_Mode() {
  UpdateCurrentTemp();
  Updatemoisture();

  if ((millis() - GetDataPullTime()) > (1 * Getminutes())) {
    String jsonData = getJsonData("SOIL_MOISTURE_MODE");
    deserializeJson(doc, jsonData);
    UpdateminMoisture(); 
    UpdatemaxMoisture(); 
    UpdatemoistureLVL();

    UpdateisValidMoisture();
    UpdateDataPullTime();
  }
  if (!GetisValidMoisture() || ((Getmoisture() + GetmoistureLVL()) > GetmaxMoisture())) {
    if (millis() - GeactivationTime() > (Getduration() * Getminutes())) {
      PumpOFF();
      UpdateactivationTime();
    }
  } else PumpON();
}
// ==============================================================================================

// Saturday Mode
// ==============================================================================================
void Saturday_Mode() {
  SettimeWindow(0);
  struct tm timeinfo;
  if (getLocalTime(&timeinfo)) {
    UpdatecurrentHour();
    UpdatecurrentMinute();
    UpdatecurrentDay();
    UpdatecurrentMonth();
    UpdatecurrentYear();
    UpdatecurrentTotalMinutes();
  }

  if ((millis() - GetDataPullTime()) > (1 * Getminutes())) {
    String jsonData = getJsonData("SATURDAY_MODE");
    deserializeJson(doc, jsonData);
    Updateduration();
    UpdateTimeActivate();
    UpdateDateActivate();
    parseTimeString(TimeActivate, scheduledHour, scheduledMinute);
    parseDateString(DateActivate, scheduleDay, scheduledMonth, scheduledYear);
    UpdatescheduledTotalMinutes();
    UpdateDataPullTime();
  }

  UpdatematchDate();
  UpdatematchTime();


  if (!GetisPumpON() && GetmatchDate() && GetmatchTime()) {
    PumpON();
    UpdateactivationTime();
    SetisPumpON(true);
  }

  if (GetisPumpON()) {
    if (millis() - GeactivationTime() >= (Getduration() * Getminutes())) {
      PumpOFF();
      SetisPumpON(false);
    }
  }
}
// ==============================================================================================


// Manual Mode
// ==============================================================================================
void Manual_Mode() {
  if ((millis() - GetDataPullTime()) > (1 * Getminutes())) {
    String jsonData = getJsonData("MANUAL_MODE");
    deserializeJson(doc, jsonData);
    Updatemanual();
    UpdateDataPullTime();
  }

  if (Getmanual()) {
    if ((millis() - GetdealyTime()) > (GettrigerTime())) PumpON();
  } else PumpOFF();
}
// ==============================================================================================


StateFunction StateMachine[] = {
  Temperatue_Mode,
  Soil_Moisture_Mode,
  Saturday_Mode,
  Manual_Mode
};

void SM() {
  if (CurrentStatus < (sizeof(StateMachine) / sizeof(StateMachine[0]))) { StateMachine[CurrentStatus](); }
}

