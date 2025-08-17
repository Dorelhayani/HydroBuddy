  void SM() {
  switch (CurrentStatus) {
    default:
      CurrentStatus = GetState();
      break;

  // Temperatue Mode
  // ==============================================================================================
  case TEMP_MODE:
    CurrentTemp = dht.readTemperature();
    light = map(analogRead(lightSensor), 0, 4095, 0, 100);

    if ((millis() - DataPullTime) > (RefreshTime)) {
      deserializeJson(doc, getJsonData("TEMP_MODE"));
      temp = (float)doc["temp"];
      minTime = doc["minTime"];
      maxTime = doc["maxTime"];
      DataPullTime = millis();
    }

    if (light > 70) isPumpON = true;
    else if (light < 10 && countON == 2) {
      isPumpON = true;
      countON = 0;
    }

    if (isPumpON && temp < CurrentTemp && countON < 2 && light < 40) {
      digitalWrite(pump, LOW);
      if (millis() - activationTime > (maxTime * minutes)) {
        digitalWrite(pump, HIGH);
        // Serial.println("pump OFF");
        isPumpON = false;
        countON++;
        activationTime = millis();
      }
    } else if (isPumpON && countON < 2) {
      digitalWrite(pump, LOW);
      if (millis() - activationTime > (minTime * minutes)) {
        digitalWrite(pump, HIGH);
        isPumpON = false;
        countON++;
        activationTime = millis();
      }
    }
    // Serial.println("");
    // Serial.println("countON = " + String(countON));
    // Serial.println("isPumpON = " + String(isPumpON));
    break;
  // ==============================================================================================

  // Soil Moisture Mode
  // ==============================================================================================
  case SOIL_MOISTURE_MODE:
    CurrentTemp = dht.readTemperature();
    moisture = map(analogRead(MoistureSensore), 0, 4095, 0, 100);

    if ((millis() - DataPullTime) > (RefreshTime)) {

      deserializeJson(doc, getJsonData("SOIL_MOISTURE_MODE"));
      // moisture = (int)doc["SOIL_MOISTURE_MODE"]["moisture"];
      moistureLVL = doc["SOIL_MOISTURE_MODE"]["moistureLVL"];
      minMoisture = doc["SOIL_MOISTURE_MODE"]["minMoisture"];
      maxMoisture = doc["SOIL_MOISTURE_MODE"]["maxMoisture"];

      isValidMoisture = ((moisture - moistureLVL) < minMoisture);
      DataPullTime = millis();
    }
    if (!isValidMoisture || ((moisture + moistureLVL) > maxMoisture)) {
      if (millis() - activationTime > (duration * minutes)) {
        digitalWrite(pump, HIGH);
        activationTime = millis();
      }
    } else digitalWrite(pump, LOW);
    break;
  // ==============================================================================================

  // Saturday Mode
  // ==============================================================================================
  case SATURDAY_MODE:
    timeWindow = 0;
    struct tm timeinfo;
    if (getLocalTime(&timeinfo)) {
      currentHour = timeinfo.tm_hour;
      currentMinute = timeinfo.tm_min;
      currentDay = timeinfo.tm_mday;
      currentMonth = timeinfo.tm_mon + 1;
      currentYear = timeinfo.tm_year + 1900;
      currentTotalMinutes = currentHour * 60 + currentMinute;
    }

    if ((millis() - DataPullTime) > (RefreshTime)) {
      deserializeJson(doc, getJsonData("SATURDAY_MODE"));
      duration = doc["SATURDAY_MODE"]["duration"];
      TimeActivate = doc["SATURDAY_MODE"]["timeAct"];
      DateActivate = doc["SATURDAY_MODE"]["dateAct"];
      parseTimeString(TimeActivate, scheduledHour, scheduledMinute);
      parseDateString(DateActivate, scheduleDay, scheduledMonth, scheduledYear);
      scheduledTotalMinutes = scheduledHour * 60 + scheduledMinute;
      DataPullTime = millis();
    }

    matchDate = ((currentDay == scheduleDay) && (currentMonth == scheduledMonth) && (currentYear == scheduledYear));
    matchTime = (currentTotalMinutes >= scheduledTotalMinutes) && (currentTotalMinutes <= (scheduledTotalMinutes + timeWindow));

    if (!isPumpON && matchDate && matchTime) {
      digitalWrite(pump, LOW);
      activationTime = millis();
      isPumpON = true;
    }

    if (isPumpON) {
      if (millis() - activationTime >= (duration * minutes)) {
        digitalWrite(pump, HIGH);
        isPumpON = false;
      }
    }
    break;
  // ==============================================================================================

  // Manual Mode
  // ==============================================================================================
case MANUAL_MODE:

  if ((millis() - DataPullTime) > (RefreshTime)) {
    String Res = getJsonData("MANUAL_MODE");
    deserializeJson(doc, Res);
    manual = doc["MANUAL_MODE"]["enabled"];
    DataPullTime = millis();
  }

  if (manual) {
    // if ((millis() - dealyTime) > (trigerTime)) digitalWrite(pump, LOW);
     digitalWrite(pump, LOW);
  } else digitalWrite(pump, HIGH);
  break;
  }
  }
  // ==============================================================================================  