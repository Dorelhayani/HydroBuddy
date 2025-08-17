#ifndef GLOBAL_VARIABLES_H
#define GLOBAL_VARIABLES_H

#include <DHT.h>
#include <ArduinoJson.h>
#include <time.h>
#include <WiFi.h>

#define INIT_MODE 60
#define TEMP_MODE 61
#define SOIL_MOISTURE_MODE 62
#define SATURDAY_MODE 63
#define MANUAL_MODE 64

#define pump 19
#define dhtPin 16
#define MoistureSensore 32
#define lightSensor 33

// #define DHTTYPE DHT11
#define DHTTYPE DHT22
DHT dht(dhtPin, DHTTYPE);

JsonDocument doc;

bool isReady;

const char* ntpServer = "il.pool.ntp.org";
const char* timeZone = "IST-2IDT,M3.4.4/26,M10.5.0";  // שעון קיץ ישראל

int CurrentStatus;
unsigned long statusCheckTime, DataPullTime, activationTime, dealyTime, lastSentDataTime;
int trigerTime = 3000;
int RefreshTime = 5000;

float temp, CurrentTemp;
int light;

int moisture, minMoisture, maxMoisture, moistureLVL;
bool isValidMoisture;

int minutes = (1000 * 60);
int minTime, maxTime, timeWindow;

bool isPumpON;
bool manual;
int countON = 0;

const char* TimeActivate;
const char* DateActivate;
int currentHour, currentMinute, scheduledHour, scheduledMinute, currentTotalMinutes, scheduledTotalMinutes, duration;
int currentDay, currentMonth, currentYear, scheduleDay, scheduledMonth, scheduledYear;
bool matchTime, matchDate;

#endif