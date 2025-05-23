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

        if (req.body.state ) {
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
router.patch('/Saturday', (req,res)=>{
    try{
        let duration = parseInt(req.body.duration);

        let dateAct = req.body.dateAct;
        let spltDate = dateAct.split('/');
        console.log(spltDate)
        let day = parseInt(spltDate[0]);
        let month = parseInt(spltDate[1]);
        let year = parseInt(spltDate[2]);

        let timeAct = req.body.timeAct;
        let spltTime = timeAct.split(':');
        let hour = parseInt(spltTime[0]);
        let minute = parseInt(spltTime[1]);

        let ValidTime = ( hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 && duration > 0);
        let validDate = ( day > 0 && day <= 31 && month >= 1 && month <= 12 && year >= 2020);

        let data = JSON.parse(fs.readFileSync("Inside_Information.json", 'utf8'));
        if(ValidTime && validDate){
            data.SATURDAY_MODE={
                timeAct,
                dateAct,
                duration
            }
            fs.writeFileSync("Inside_Information.json", JSON.stringify(data, null, 2), "utf8");
            console.log(`Saturday mode set to: ${data.SATURDAY_MODE.dateAct} at ${data.SATURDAY_MODE.timeAct} for ${data.SATURDAY_MODE.duration} `)
            return res.json({ message: "Saturday mode updated", SATURDAY_MODE: data.SATURDAY_MODE });
        }
        return res.status(400).json({ error: "Please Insert a Valid Time Signature"});
    }catch (error){ res.status(500).json({ error: "Error handling Saturday mode" }); }
});

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

module.exports = router;
