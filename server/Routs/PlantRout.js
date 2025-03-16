const express = require('express');
const router = express.Router();
const PlantData = require('../models/PlantMode');
const db = require('../models/database');

const NewPlant = new PlantData(db);

// Store Sensors Value To Datasensors
// ---------------------------------------------------------------------------------------------------------------------
router.post("/StoreToDatasensors", async (req, res) => {
    try {
        const { temp, light, moisture, isPumpON } = req.body;
        await NewPlant.storeESPData(temp, light, moisture, Number(isPumpON));

        res.status(200).json({ message: "Data inserted successfully" });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ---------------------------------------------------------------------------------------------------------------------

// Add
// ---------------------------------------------------------------------------------------------------------------------
router.post("/add", (req,res) => {
    try {
        const {name} = req.body;
        NewPlant.Create(name);
        res.status(201).json({message: name}); // הצחלת יצירת צמח
    } catch (error){ res.status(500).json({ error: error.message }); }
});
// ---------------------------------------------------------------------------------------------------------------------

// List
//  --------------------------------------------------------------------------------------------------------------------
router.get("/list" , async (req, res) => {
    try{
        const data = await NewPlant.Read();
        res.status(201).json({message: data });
    } catch (error){ res.status(500).json({ error: error.message }); }
})
//  --------------------------------------------------------------------------------------------------------------------

// Update
//  --------------------------------------------------------------------------------------------------------------------
router.patch("/update", async (req, res) => {
    try {
        await NewPlant.Update(req);
        res.status(200).json({ message: "Plant updated successfully" });
    } catch (error) { res.status(500).json({ error: error.message }); }
});
//  --------------------------------------------------------------------------------------------------------------------

// Delete
//  --------------------------------------------------------------------------------------------------------------------
router.delete("/delete", async (req,res)=>{
    try{
        await NewPlant.Delete(req);
        res.status(201).json({message: "Plant deleted successfully"});
    } catch (error) { res.status(500).json({ error: error.message }); }
})
//  --------------------------------------------------------------------------------------------------------------------

module.exports = router;