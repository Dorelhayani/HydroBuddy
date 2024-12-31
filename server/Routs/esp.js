const express = require('express');


const router = express.Router(); // בניית ניתוב API ללוח הארדואינו
router.use('/esp', router);
router.get('/', (req, res)=> {
    console.log("hello my ESP");
})


router.get('/lightSensor', (req, res)=> {
    console.log("");
})


module.exports = router;
