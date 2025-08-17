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
            const raw = fs.readFileSync(this.jsonPath, "utf8");
            const data = JSON.parse(raw);

            if (val && val.state) {
                const requestedKey = val.state; // למשל "SATURDAY_MODE"
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


// Moisture Mode
// ---------------------------------------------------------------------------------------------------------------------
    async MoistureMode(data) {
        try {
            const moistureLVL = parseInt(data.moistureLVL, 10);
            const minMoisture = parseInt(data.minMoisture, 10);
            const maxMoisture = parseInt(data.maxMoisture, 10);

            const validMoist =
                Number.isInteger(minMoisture) && Number.isInteger(maxMoisture) && Number.isInteger(moistureLVL) &&
                moistureLVL > 0 && minMoisture > 0 && maxMoisture > 0;

            if (!validMoist) {
                const err = new Error("Please insert valid numeric values for moisture");
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

            return { message: "Moisture mode updated", SOIL_MOISTURE_MODE: data.SOIL_MOISTURE_MODE, }; }
        catch (err) { throw new Error("Error handling moisture mode: " + err.message); }
    }
// ---------------------------------------------------------------------------------------------------------------------


// Saturday Mode
// ---------------------------------------------------------------------------------------------------------------------
    async SaturdayMode(payload) {
        try {
            const duration = parseInt(payload.duration, 10);
            const dateAct = payload.dateAct; // למשל "30/05/2025"
            const timeAct = payload.timeAct; // למשל "14:30"

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

            return { message: "Manual mode updated", MANUAL_MODE: data.MANUAL_MODE.enabled, }; }
        catch (err) { throw new Error("Error handling manual mode: " + err.message); }
    }
// ---------------------------------------------------------------------------------------------------------------------

}

module.exports = EspData;
