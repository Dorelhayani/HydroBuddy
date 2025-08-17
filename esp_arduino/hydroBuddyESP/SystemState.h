#ifndef SYSTEM_STATE_H
#define SYSTEM_STATE_H
#include "GlobalVariables.h"

// Timing Management
// ==============================================================================================
unsigned long GetstatusCheckTime() {return statusCheckTime;}
void SetstatusCheckTime(unsigned long value) {statusCheckTime = value;}
void UpdatestatusCheckTime() {statusCheckTime = millis(); }

unsigned long GetDataPullTime() {return DataPullTime;}
void SetDataPullTime(unsigned long value) {DataPullTime = value;}
void UpdateDataPullTime() {DataPullTime = millis();}

unsigned long GeactivationTime() {return activationTime;}
void SetactivationTime(unsigned long value) {activationTime = value;}
void UpdateactivationTime() {activationTime = millis();
}
unsigned long GetdealyTime() {return dealyTime;}
void SetdealyTime(unsigned long value) {dealyTime = value;}

unsigned long GetlastSentDataTime() {return lastSentDataTime;}
void SetlastSentDataTime(unsigned long value) {lastSentDataTime = value;}
void UpdatelastSentDataTime() {lastSentDataTime = millis();}

int Getminutes() {return minutes;}
void Setminutes(int value) {minutes = value;}

int GettimeWindow() { return timeWindow; }
void SettimeWindow(int value) {timeWindow = value;}

int Getduration() {return duration;}
void Setduration(int value) {duration = value;}
void Updateduration() {duration = doc["SATURDAY_MODE"]["duration"];}
// ==============================================================================================


// Temperatue Mode
// ==============================================================================================
float Gettemp() {return temp;}
void Settemp(float value) {temp = value;}
void Updatetemp() {temp = (float)doc["temp"];}

float GetCurrentTemp() {return CurrentTemp;}
void UpdateCurrentTemp() {CurrentTemp = dht.readTemperature();}

int Getlight() {return light;}
void Updatelight() {light = map(analogRead(lightSensor), 0, 4095, 0, 100);}

int GetminTime() {return minTime;}
void SetminTime(int value) {minTime = value;}
void UpdateminTime() { minTime = doc["minTime"];}

int GetmaxTime() {return maxTime;}
void SetmaxTime(int value) {maxTime = value;}
void UpdatemaxTime() {maxTime = doc["maxTime"];}

int GetcountON() {return countON;}
void SetcountON(int value) {countON = value;}
void UpdatecountON() {countON = countON++;}
// ==============================================================================================


// Soil Moisture Mode
// ==============================================================================================
int Getmoisture() {return moisture;}
void Updatemoisture() {moisture = map(analogRead(MoistureSensore), 0, 4095, 0, 100);}

int GetminMoisture() {return minMoisture; }
void SetminMoisture(int value) {minMoisture = value;}
void UpdateminMoisture() {minMoisture = doc["SOIL_MOISTURE_MODE"]["minMoisture"];}

int GetmaxMoisture() {return maxMoisture;}
void SetmaxMoisture(int value) {maxMoisture = value;}
void UpdatemaxMoisture() {maxMoisture = doc["SOIL_MOISTURE_MODE"]["maxMoisture"];}

int GetmoistureLVL() {return moistureLVL;}
void SetmoistureLVL(int value) {moistureLVL = value;}
void UpdatemoistureLVL() {moistureLVL = doc["SOIL_MOISTURE_MODE"]["moistureLVL"];}

bool GetisValidMoisture() {return isValidMoisture;}
void SetisValidMoisture(bool value) {isValidMoisture = value;}
void UpdateisValidMoisture() {isValidMoisture = ((moisture - moistureLVL) < minMoisture);;}

// ==============================================================================================


// Saturday Mode
// ==============================================================================================
struct tm timeinfo;
int GetcurrentHour() {return currentHour;}
void UpdatecurrentHour() {currentHour = currentHour = timeinfo.tm_hour;}

int GetcurrentMinute() {return currentMinute;}
void UpdatecurrentMinute() {currentMinute = timeinfo.tm_min;}

int GetscheduledHour() {return scheduledHour;}
void SetscheduledHour(int value) {scheduledHour = value;}

int GetscheduledMinute() {return scheduledMinute;}
void SetscheduledMinute(int value) {scheduledMinute = value;}


int GetcurrentTotalMinutes() {return currentTotalMinutes;}
void SetcurrentTotalMinutes(int value) {currentTotalMinutes = value;}
void UpdatecurrentTotalMinutes() {currentTotalMinutes = currentHour * 60 + currentMinute;}

int GetscheduledTotalMinutes() {return scheduledTotalMinutes;}
void UpdatescheduledTotalMinutes() { scheduledTotalMinutes = scheduledHour * 60 + scheduledMinute; }

int GetcurrentDay() { return currentDay;}
void UpdatecurrentDay() {currentDay = timeinfo.tm_mday;}

int GetcurrentMonth() {return currentMonth;}
void UpdatecurrentMonth() {currentMonth = timeinfo.tm_mon + 1;}

int GetcurrentYear() {return currentYear;}
void UpdatecurrentYear() {currentYear = timeinfo.tm_year + 1900;}

int GetscheduleDay() {return scheduleDay;}
void SetscheduleDay(int value) {scheduleDay = value;}

int GetscheduledMonth() {return scheduledMonth;}
void SetscheduledMonth(int value) {scheduledMonth = value;}

int GetscheduledYear() {return scheduledYear;}
void SetscheduledYear(int value) {scheduledYear = value;}

bool GetmatchTime() {return matchTime;}
void SetmatchTime(bool value) {matchTime = value;}
void UpdatematchTime() { matchTime = (currentTotalMinutes >= scheduledTotalMinutes) && (currentTotalMinutes <= (scheduledTotalMinutes + timeWindow)); } 


bool GetmatchDate() {return matchDate;}
void SetmatchDate(bool value) {matchDate = value;}
void UpdatematchDate() {  matchDate = ((currentDay == scheduleDay) && (currentMonth == scheduledMonth) && (currentYear == scheduledYear)); }

const char* GetTimeActivate(){return TimeActivate;}
void UpdateTimeActivate(){TimeActivate = doc["SATURDAY_MODE"]["timeAct"];}

const char* GetDateActivate(){return DateActivate;}
void UpdateDateActivate(){ DateActivate = doc["SATURDAY_MODE"]["dateAct"]; }
// ==============================================================================================


// Manual Mode
// ==============================================================================================
bool Getmanual() {return manual;}
void Setmanual(bool value) {manual = value;}
void Updatemanual(){ manual = doc["MANUAL_MODE"]["enabled"]; }
int GettrigerTime() { return trigerTime; }
void SettrigerTime(int value) { trigerTime = value; }
// ==============================================================================================


// Pump Management
// ==============================================================================================
bool GetisPumpON() {return isPumpON;}
void SetisPumpON(bool value) {isPumpON = value;}
void PumpON(){digitalWrite(pump, LOW);}
void PumpOFF(){digitalWrite(pump, HIGH);}
// ==============================================================================================


int GetCurrentStatus() {return CurrentStatus;}
void SetCurrentStatus(int value) {CurrentStatus = value; }
// void UpdateCurrentStatus() { CurrentStatus = GetState(); }

#endif