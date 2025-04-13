const express = require('express');
const router = express.Router(); // בניית ניתוב API ללוח הארדואינו
const fs = require('fs');
router.get('/',(req,res)=> {
    const data =  req.query;
        console.log(data);
})

router.patch('/state', (req, res) => {
    try {
        let data = JSON.parse(fs.readFileSync("Inside_Information.json", "utf8"));

        if (req.body.state) {
            data.state = req.body.state;
            fs.writeFileSync("Inside_Information.json", JSON.stringify(data, null, 2), "utf8");
            console.log(`State updated to: ${data.state}`);
            return res.json({ message: "State updated", CurrentStatus: data.state });
        }

        res.json({ CurrentStatus: data.state });
    } catch (error) { res.status(500).json({ error: "Error handling state" }); }
});
router.get('/dataMode', (req, res) => {
    try {
        let data = JSON.parse(fs.readFileSync("Inside_Information.json", 'utf8'));

        if(req.query.state){
            const requestedState = req.query.state;
            if (data[requestedState]) { return res.json({ [requestedState]: data[requestedState] }); }
            else { return res.status(404).json({ error: `State '${requestedState}' not found.` }); }
        }
        res.json({ CurrentStatus: data.state });
    } catch (error) { res.status(500).json({ error: "Failed to read current state" }); }
});

router.patch('/moisture', (req,res)=>{
    try{
        let minMoisture = parseInt(req.body.minMoisture);
        let maxMoisture = parseInt(req.body.maxMoisture);
        let moistureLVL = parseInt(req.body.moistureLVL);

        let data = JSON.parse(fs.readFileSync("Inside_Information.json", 'utf8'));
        let validMoist = ( Number.isInteger(minMoisture) && Number.isInteger(maxMoisture)  && minMoisture > 0 && maxMoisture > 0);
        if(validMoist){
            data.SOIL_MOISTURE_MODE = {
                minMoisture,
                maxMoisture,
                moistureLVL
            }
        }
        fs.writeFileSync("Inside_Information.json", JSON.stringify(data, null, 2), "utf8");
        console.log(`Moisture Level is ${data.SOIL_MOISTURE_MODE.moistureLVL} 
        Minimum Moisture Level is: ${data.SOIL_MOISTURE_MODE.minMoisture} 
        Minimum Moisture Level is:${data.SOIL_MOISTURE_MODE.maxMoisture}`)

        return res.json({message: "Moisture Mode Updated", })
    }catch (error){ res.status(500).json({ error: "Error handling moisture mode" }); }
})
router.patch('/manual', (req,res)=>{
    try{
        let data = JSON.parse(fs.readFileSync("Inside_Information.json", 'utf8'));
        if(req.body.enabled){
            data.MANUAL_MODE.enabled = req.body.enabled === "true";
            fs.writeFileSync("Inside_Information.json", JSON.stringify(data, null, 2), "utf8");
            console.log(`Manual mode set to: ${data.MANUAL_MODE.enabled}`)
            return res.json({ message: "Manual mode updated", MANUAL_MODE: data.enabled });
        }
        res.json({MANUAL_MODE: data.MANUAL_MODE.enabled});
    }
    catch (error){ res.status(500).json({ error: "Error handling manual mode" }); }
})
router.patch('/Saturday', (req,res)=>{
    try{
        let hour = parseInt(req.body.hour);
        let minute = parseInt(req.body.minute);
        let duration = parseInt(req.body.duration);
        let ValidTime = (Number.isInteger(hour) && Number.isInteger(minute) && Number.isInteger(duration)
            &&  hour >= 0 && hour <= 23 &&
            minute >= 0 && minute <= 59 &&
            duration > 0);

        let data = JSON.parse(fs.readFileSync("Inside_Information.json", 'utf8'));
        if(ValidTime){
            data.SATURDAY_MODE={
                hour,
                minute,
                duration
            }
            fs.writeFileSync("Inside_Information.json", JSON.stringify(data, null, 2), "utf8");
            console.log(`Saturday mode set to: ${data.SATURDAY_MODE.hour} : ${data.SATURDAY_MODE.minute} for ${data.SATURDAY_MODE.duration} `)
            return res.json({ message: "Saturday mode updated", SATURDAY_MODE: data.SATURDAY_MODE });
        }
        return res.status(400).json({ error: "Please Insert a Valid Time Signature"});
    }catch (error){ res.status(500).json({ error: "Error handling Saturday mode" }); }
});
module.exports = router;