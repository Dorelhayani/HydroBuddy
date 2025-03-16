const express = require('express');
const router = express.Router(); // בניית ניתוב API ללוח הארדואינו
const fs = require('fs');
router.get('/',(req,res)=> {
    const data =  req.query;
        console.log(data);
})
router.get('/state/:state?', (req, res) => {
    try {
        let data = JSON.parse(fs.readFileSync("Inside_Information.json", "utf8"));

        if (req.params.state) {
            data.state = req.params.state;
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
        res.json({ CurrentStatus: data.state });
    } catch (error) { res.status(500).json({ error: "Failed to read current state" }); }
});

router.get('/manualMode/:enabled?', (req,res)=>{
    try{
        let data = JSON.parse(fs.readFileSync("Inside_Information.json", 'utf8'));
        if(req.params.enabled){
            data.MANUAL_MODE = req.params.enabled === "true";
            fs.writeFileSync("Inside_Information.json", JSON.stringify(data, null, 2), "utf8");
            console.log(`Manual mode set to: ${data.MANUAL_MODE}`)
            return res.json({ message: "Manual mode updated", MANUAL_MODE: data.MANUAL_MODE });
        }
        res.json({MANUAL_MODE: data.MANUAL_MODE});
    }
    catch (error){ res.status(500).json({ error: "Error handling manual mode" }); }
})

module.exports = router;