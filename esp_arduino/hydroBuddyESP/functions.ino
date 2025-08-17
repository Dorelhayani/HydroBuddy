// parse Time String
// ===================================================================================================================
void parseTimeString(const char* timeStr, int& hour, int& minute) {
  char timeCopy[6];
  strncpy(timeCopy, timeStr, sizeof(timeCopy));
  timeCopy[5] = '\0';

  char* token = strtok(timeCopy, ":");
  if (token) hour = atoi(token);

  token = strtok(NULL, ":");
  if (token) minute = atoi(token);
}
// ===================================================================================================================


// parse Date String
// ===================================================================================================================
void parseDateString(const char* dateStr, int& day, int& month, int& year) {
  char dateCopy[11];
  strncpy(dateCopy, dateStr, sizeof(dateCopy));
  dateCopy[10] = '\0';

  char* token = strtok(dateCopy, "/");
  if (token) day = atoi(token);

  token = strtok(NULL, "/");
  if (token) month = atoi(token);

  token = strtok(NULL, "/");
  if (token) year = atoi(token);
}
// ===================================================================================================================


// wait For Time Syncronization
// ===================================================================================================================
void waitForTimeSync() {
  struct tm timeinfo;
  while (!getLocalTime(&timeinfo)) { Serial.println("⏳ Waiting for NTP time..."); }
  Serial.println("✅ Time synchronized!");
}

void initializeSystem() {
  Serial.println("🚀 Initializing system...");
  while (!WiFi.isConnected()) delay(100);
  waitForTimeSync();
  CurrentStatus = GetState();

  while (CurrentStatus == -1) {
    delay(500);
    CurrentStatus = GetState();
  }

  String data = getJsonData(GetStateName(CurrentStatus));
  while (data.length() == 0) {
    delay(500);
    data = getJsonData(GetStateName(CurrentStatus));
  }
  Serial.println("✅ System initialized successfully!");
  logStateChange(CurrentStatus);
  isReady = true;
}
// ===================================================================================================================


// Get State Name
// ===================================================================================================================
String GetStateName(int status) {
  switch (status) {
    case TEMP_MODE:
      return "TEMP_MODE";

    case SOIL_MOISTURE_MODE:
      return "SOIL_MOISTURE_MODE";

    case SATURDAY_MODE:
      return "SATURDAY_MODE";

    case MANUAL_MODE:
      return "MANUAL_MODE";

    default: return "";
  }
}
// ===================================================================================================================