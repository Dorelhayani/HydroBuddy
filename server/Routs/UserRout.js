const express = require('express');
const router = express.Router();
const UserData = require('../models/UserMode');
const db = require('../models/database');
const User = new UserData(db);

// List
//  --------------------------------------------------------------------------------------------------------------------
router.get("/list" , async (req, res) => {
    try{
        const data = await User.Read();
        res.status(200).json(data);
    } catch (error){ res.status(500).json({ error: error.message }); }
})
//  --------------------------------------------------------------------------------------------------------------------

// List
//  --------------------------------------------------------------------------------------------------------------------
router.get("/users_list" , async (req, res) => {
    try{
        const data = await User.List();
        res.status(201).json(data);
    } catch (error){ res.status(500).json({ error: error.message }); }
})
//  --------------------------------------------------------------------------------------------------------------------

// Update
//  --------------------------------------------------------------------------------------------------------------------
// router.patch("/update/:id", async (req, res) => {
//     try {
//         await User.Update(req);
//         res.status(200).json({ message: "User updated successfully" });
//     } catch (error) { res.status(500).json({ error: error.message }); }
// });

router.patch("/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;
        await User.Update(id, { name, email });
        res.status(200).json({ message: "User updated successfully" });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

//  --------------------------------------------------------------------------------------------------------------------

// Delete
//  --------------------------------------------------------------------------------------------------------------------
// router.delete("/delete/:id", async (req,res)=>{
//     try{
//         await User.Delete(req);
//         res.status(201).json({message: "User deleted successfully"});
//     } catch (error) { res.status(500).json({ error: error.message }); }
// })

router.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await User.Delete(id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) { res.status(500).json({ error: error.message }); }
});
//  --------------------------------------------------------------------------------------------------------------------

module.exports = router;
