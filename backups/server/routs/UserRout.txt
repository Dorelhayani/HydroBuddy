const express = require('express');
const router = express.Router();
const UserData = require('../models/UserMode');
const db = require('../models/database');

const User = new UserData(db);

// Add
// ---------------------------------------------------------------------------------------------------------------------
router.post("/add", async (req,res) => {
    try {
        const {name, email, password, type, created_at } = req.body;
        const UserID = await User.Create(name, email, password, type, created_at);
        return res.status(201).json({user_id: UserID});
    } catch (error){ res.status(500).json({ error: error.message }); }
});
// ---------------------------------------------------------------------------------------------------------------------

// List
//  --------------------------------------------------------------------------------------------------------------------
router.get("/list" , async (req, res) => {
    try{
        const data = await User.Read();
        res.status(201).json({message: data});
        // res.status(201).json({users: data });
    } catch (error){ res.status(500).json({ error: error.message }); }
})
//  --------------------------------------------------------------------------------------------------------------------

// Update
//  --------------------------------------------------------------------------------------------------------------------
router.patch("/update", async (req, res) => {
    try {
        await User.Update(req);
        res.status(200).json({ message: "User updated successfully" });
    } catch (error) { res.status(500).json({ error: error.message }); }
});
//  --------------------------------------------------------------------------------------------------------------------

// Delete
//  --------------------------------------------------------------------------------------------------------------------
router.delete("/delete", async (req,res)=>{
    try{
        await User.Delete(req);
        res.status(201).json({message: "User deleted successfully"});
    } catch (error) { res.status(500).json({ error: error.message }); }
})
//  --------------------------------------------------------------------------------------------------------------------

module.exports = router;