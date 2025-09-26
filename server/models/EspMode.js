const fs = require("fs");
const path = require("path");

class EspData {
    constructor(db) {
        this.DB = db;
        this.jsonPath = path.join(__dirname, "..", "Inside_Information.json");
    }
// ESP State
// ---------------------------------------------------------------------------------------------------------------------
    async EspState(val) {
        try {
            const raw = fs.readFileSync(this.jsonPath, "utf8");
            const data = JSON.parse(raw);

            if (val && typeof val.state !== "undefined") {
                data.state = val.state;
                fs.writeFileSync(this.jsonPath, JSON.stringify(data, null, 2), "utf8");
                console.log(`State updated to: ${data.state}`);
                return { message: "State updated", CurrentStatus: data.state, };
            }
            return { CurrentStatus: data.state, };
        } catch (err) { throw new Error("Error handling state: " + err.message); }
    }
// ---------------------------------------------------------------------------------------------------------------------


// Data Mode
// ---------------------------------------------------------------------------------------------------------------------
    async DataMode(val) {
        try {
            const rows = fs.readFileSync(this.jsonPath, "utf8");
            const data = JSON.parse(rows);

            if (val && val.state) {
                const requestedKey = val.state;
                if (data.hasOwnProperty(requestedKey)) { return { [requestedKey]: data[requestedKey] }; }
                else {
                    const err = new Error(`State '${requestedKey}' not found.`);
                    err.code = 404;
                    throw err;
                }
            }
            return { CurrentStatus: data.state }; }
        catch (err) { throw new Error("Error handling esp state mode: " + err.message); }
    }
// ---------------------------------------------------------------------------------------------------------------------


// Temperature Mode
// ---------------------------------------------------------------------------------------------------------------------
    async TemperatureMode(val){
        try{
            const tempLVL = Number(val.tempLVL);
            const minTime = Number(val.minTime);
            const maxTime = Number(val.maxTime);
            const lightThresHold = Number(val.lightThresHold);
            const minLight = Number(val.minLight);
            const maxLight = Number(val.maxLight);

            const validTemp =
                Number.isInteger(minTime) && Number.isInteger(maxTime) && Number.isInteger(lightThresHold)
                && Number.isInteger(minLight) && Number.isInteger(maxLight) && minTime > 0 && maxTime > 0
                && lightThresHold > 0 && minLight > 0 && maxLight > 0;

            if(!validTemp){
                const err = new Error("Please insert valid numeric values for temperature mode");
                err.code = 400;
                throw err;
            }
            const raw = fs.readFileSync(this.jsonPath, "utf8");
            const data = JSON.parse(raw);

            data.TEMP_MODE = {
                ...(data.TEMP_MODE || {}),
                tempLVL,
                minTime,
                maxTime,
                lightThresHold,
                minLight,
                maxLight,
            };

            fs.writeFileSync(this.jsonPath, JSON.stringify(data, null, 2), "utf8");
            console.log( `Temperature Level is ${tempLVL}, MinTime: ${minTime}, MaxTIme: ${maxTime},
            light ThresHold: ${lightThresHold}, minLight: ${minLight}, maxLight: ${maxLight}`);

            return { TEMP_MODE: data.TEMP_MODE, }
        }
    catch (err) { throw new Error("Error handling temperature mode: " + err.message); }
    }
// ---------------------------------------------------------------------------------------------------------------------


// Update Temperature sensor's reading to JSON
// ---------------------------------------------------------------------------------------------------------------------
    async UpadteTemp(val){
        try{
            const tempSensor = val?.temp ?? val?.TEMP_MODE?.temp;
            const t = Number(tempSensor);
            if (!Number.isFinite(t)) {
                const err = new Error("Invalid temp");
                err.code = 400;
                throw err;
            }

            const raw = fs.readFileSync(this.jsonPath, "utf8");
            const data = JSON.parse(raw);
            data.TEMP_MODE = {
                ...(data.TEMP_MODE || {}),
                temp: t,

            };
            fs.writeFileSync(this.jsonPath, JSON.stringify(data, null, 2), "utf8");
            return { message: "temp Sensor updated", temp: t, TEMP_MODE: data.TEMP_MODE };
        }
        catch (err) { throw new Error("Error temperature reading: " + err.message); }
    }
// ---------------------------------------------------------------------------------------------------------------------


 // Update Light sensor's reading to JSON
// ---------------------------------------------------------------------------------------------------------------------
    async UpadteLight(val){
        try{
            const lightSensor = val?.light ?? val?.TEMP_MODE?.light;
            const l = Number(lightSensor);
            if (!Number.isFinite(l)) {
                const err = new Error("Invalid light");
                err.code = 400;
                throw err;
            }

            const raw = fs.readFileSync(this.jsonPath, "utf8");
            const data = JSON.parse(raw);
            data.TEMP_MODE = {
                ...(data.TEMP_MODE || {}),
                light: l,

            };
            fs.writeFileSync(this.jsonPath, JSON.stringify(data, null, 2), "utf8");
            return { message: "light Sensor updated", light: l, TEMP_MODE: data.TEMP_MODE };
        }
        catch (err) { throw new Error("Error temperature reading: " + err.message); }
    }
// ---------------------------------------------------------------------------------------------------------------------


// Moisture Mode
// ---------------------------------------------------------------------------------------------------------------------
    async MoistureMode(val) {
        try {
            const moistureLVL = Number(val.moistureLVL);
            const minMoisture = Number(val.minMoisture);
            const maxMoisture = Number(val.maxMoisture);

            const validMoist =
                Number.isInteger(minMoisture) && Number.isInteger(maxMoisture) && Number.isInteger(moistureLVL) &&
                moistureLVL > 0 && minMoisture > 0 && maxMoisture > 0;

            if (!validMoist) {
                const err = new Error("Please insert valid numeric values for moisture mode");
                err.code = 400;
                throw err;
            }

            const raw = fs.readFileSync(this.jsonPath, "utf8");
            const data = JSON.parse(raw);

            data.SOIL_MOISTURE_MODE = {
                minMoisture,
                maxMoisture,
                moistureLVL,
            };

            fs.writeFileSync(this.jsonPath, JSON.stringify(data, null, 2), "utf8");
            console.log( `Moisture Level is ${moistureLVL}, Min: ${minMoisture}, Max: ${maxMoisture}`);

            return { message: "Moisture mode updated", SOIL_MOISTURE_MODE: data.SOIL_MOISTURE_MODE, }
        }
        catch (err) { throw new Error("Error handling moisture mode: " + err.message); }
    }
// ---------------------------------------------------------------------------------------------------------------------


// Update Moisture sensor's reading to JSON
// ---------------------------------------------------------------------------------------------------------------------
    async UpadteMoisture(val){
        try{
            const moistSensor = val?.moisture ?? val?.SOIL_MOISTURE_MODE?.moisture;
            const m = Number(moistSensor);
            if (!Number.isFinite(m)) {
                const err = new Error("Invalid temp");
                err.code = 400;
                throw err;
            }

            const raw = fs.readFileSync(this.jsonPath, "utf8");
            const data = JSON.parse(raw);
            data.SOIL_MOISTURE_MODE = {
                ...(data.SOIL_MOISTURE_MODE || {}),
                moisture: m,

            };
            fs.writeFileSync(this.jsonPath, JSON.stringify(data, null, 2), "utf8");
            return { message: "moisture Sensor updated", temp: m, TEMP_MODE: data.TEMP_MODE };
        }
        catch (err) { throw new Error("Error temperature reading: " + err.message); }
    }
// ---------------------------------------------------------------------------------------------------------------------


// Saturday Mode
// ---------------------------------------------------------------------------------------------------------------------
    async SaturdayMode(payload) {
        try {
            const duration = Number(payload.duration);
            const dateAct = payload.dateAct;
            const timeAct = payload.timeAct;

            const [day, month, year] = dateAct.split("/").map((x) => parseInt(x, 10));
            const [hour, minute] = timeAct.split(":").map((x) => parseInt(x, 10));

            const validTime = Number.isInteger(hour) && Number.isInteger(minute) &&
                hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 && Number.isInteger(duration) && duration > 0;

            const validDate = Number.isInteger(day) && Number.isInteger(month) && Number.isInteger(year) &&
                day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2020;

            if (!validTime || !validDate) {
                const err = new Error("Please insert a valid date/time signature");
                err.code = 400;
                throw err;
            }

            const raw = fs.readFileSync(this.jsonPath, "utf8");
            const data = JSON.parse(raw);

            data.SATURDAY_MODE = {
                dateAct,
                timeAct,
                duration,
            };

            fs.writeFileSync(this.jsonPath, JSON.stringify(data, null, 2), "utf8");
            console.log(`Saturday mode set to: ${dateAct} at ${timeAct} for ${duration} minutes`);

            return { message: "Saturday mode updated", SATURDAY_MODE: data.SATURDAY_MODE, }; }
        catch (err) { throw new Error("Error handling saturday mode: " + err.message); }
    }
// ---------------------------------------------------------------------------------------------------------------------


// Manual Mode
// ---------------------------------------------------------------------------------------------------------------------
    async ManualMode(payload) {
        try {
            if (typeof payload.enabled === "undefined") {
                const raw = fs.readFileSync(this.jsonPath, "utf8");
                const data = JSON.parse(raw);
                return { MANUAL_MODE: data.MANUAL_MODE ? data.MANUAL_MODE.enabled : false,};
            }
            const enabled = payload.enabled === "true";

            const raw = fs.readFileSync(this.jsonPath, "utf8");
            const data = JSON.parse(raw);

            if (!data.MANUAL_MODE) data.MANUAL_MODE = {};
            data.MANUAL_MODE.enabled = enabled;

            fs.writeFileSync(this.jsonPath, JSON.stringify(data, null, 2), "utf8");
            console.log(`Manual mode set to: ${enabled}`);

            return { message: "Manual mode updated", MANUAL_MODE: data.MANUAL_MODE, }; }
        catch (err) { throw new Error("Error handling manual mode: " + err.message); }
    }
// ---------------------------------------------------------------------------------------------------------------------

}

module.exports = EspData;
