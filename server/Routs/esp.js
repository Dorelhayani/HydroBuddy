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
// router.get('/Saturday/:hour?/:minute?/:duration?', (req,res)=>{
//     try{
//         let data = JSON.parse(fs.readFileSync("Inside_Information.json", 'utf8'));
//         if(req.params.hour && req.params.minute && req.params.duration){
//             data.SATURDAY_MODE={
//                 hour: parseInt(req.params.hour),
//                 minute: parseInt(req.params.minute),
//                 duration: parseInt(req.params.duration)
//             }
//             fs.writeFileSync("Inside_Information.json", JSON.stringify(data, null, 2), "utf8");
//             console.log(`Saturday mode set to: ${data.SATURDAY_MODE.hour} : ${data.SATURDAY_MODE.minute} for ${data.SATURDAY_MODE.duration} `)
//             return res.json({ message: "Saturday mode updated", SATURDAY_MODE: data.SATURDAY_MODE });
//         }
//         res.json({SATURDAY_MODE: data.SATURDAY_MODE});
//     }catch (error){ res.status(500).json({ error: "Error handling Saturday mode" }); }
// });

router.patch('/Saturday', (req,res)=>{
    try{
        let data = JSON.parse(fs.readFileSync("Inside_Information.json", 'utf8'));
        if(req.body.hour && req.body.minute && req.body.duration){
            data.SATURDAY_MODE={
                hour: parseInt(req.body.hour),
                minute: parseInt(req.body.minute),
                duration: parseInt(req.body.duration)
            }
            fs.writeFileSync("Inside_Information.json", JSON.stringify(data, null, 2), "utf8");
            console.log(`Saturday mode set to: ${data.SATURDAY_MODE.hour} : ${data.SATURDAY_MODE.minute} for ${data.SATURDAY_MODE.duration} `)
            return res.json({ message: "Saturday mode updated", SATURDAY_MODE: data.SATURDAY_MODE });
        }
        res.json({SATURDAY_MODE: data.SATURDAY_MODE});
    }catch (error){ res.status(500).json({ error: "Error handling Saturday mode" }); }
});
module.exports = router;