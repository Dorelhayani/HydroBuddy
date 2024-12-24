// Employees CRUD - BackEnd
// ---------------------------------------------------------------------------------------------------------------------
const express = require('express');
const router = express.Router()
module.exports = router;
// ---------------------------------------------------------------------------------------------------------------------
// rout to Main Page - " EMP = employees"
// router.get("/",(req, res) => {
//     res.render("EMP", {pageTitle:"Employees"});});
// ---------------------------------------------------------------------------------------------------------------------
// Create Addpoint
router.post("/Add",(req, res) => {
    let name=req.body.name;
    // let Q=`INSERT INTO \`plants_datasheet\`(name) VALUES (name)`;
    let Q=`INSERT INTO \`plants_datasheet\` (\`name\`) VALUES ('${name}')`;
    // let Q=`INSERT INTO plants_datasheet (name) VALUE ('${name}')`;
    db_pool.query(Q, function(err){
        if(err){  res.status(500).json({message: err})  }
        else{  res.status(200).json({message: name  });  }    });  });
// ---------------------------------------------------------------------------------------------------------------------
// Read Addpoint
router.get("/List",(req, res) => {
    let q="SELECT * FROM `plants_datasheet` ";
    db_pool.query(q, function(err, rows){
        if(err)  {  res.status(500).json({message: err})  }
        else {  res.status(200).json(rows );  }    });    });
// // ------------------------------------------------------------------------------------------------------------------
// // Update Addpoint
router.patch("/Update",(req, res) => {
    let id=req.body.plant_id;
    let name=req.body.name;
    let Q =`UPDATE \`plants_datasheet\`  SET \`name\`='${name}' WHERE plant_id=${id} `;
    db_pool.query(Q, function(err){
        if(err){ res.status(500).json({message: err}) }
        else{  res.status(200).json({message: "OK"});  }    });    });
// // ------------------------------------------------------------------------------------------------------------------
// // Delete Addpoint
router.delete("/Delete",(req, res) => {
    let id=req.body.plant_id;
    let q=`DELETE FROM \`plants_datasheet\` WHERE plant_id=${id} `;
    db_pool.query(q, function(err){
        if(err){  res.status(500).json({message: err})  }
        else {  res.status(200).json({message: "OK"});  }    });    });
// ---------------------------------------------------------------------------------------------------------------------