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
router.post("/add", async (req,res) => {
    try {
        const {name, user_id} = req.body;
        const [rows] = await db.execute("SELECT id FROM users WHERE id = ?", [user_id]);
        if(rows.length === 0){ return res.status(201).json({message:"User Not Found"}); }
        console.log(user_id);
        const PlantTypeID = await NewPlant.Create(name, user_id);
        return res.status(200).json({PlantTypeID});
    } catch (error){ res.status(500).json({ error: error.message }); }
});
// ---------------------------------------------------------------------------------------------------------------------

// List
//  --------------------------------------------------------------------------------------------------------------------
router.get("/list" , async (req, res) => {
    try{
        const data = await NewPlant.Read();
        res.status(200).json(data);
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