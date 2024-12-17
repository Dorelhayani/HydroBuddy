const express = require('express');
const port = 5050;
const app = express();
app.use(express.json());

app.set("view engine", "ejs");
const path = require('path');
app.use(express.static(path.join(__dirname, "css")));
app.use(express.static(path.join(__dirname, "js")));

let db_M = require('./database');
global.db_pool = db_M.pool;

const plant_datasheet_rtr=require('./Routs/plants_datasheet_crud');
app.use('/plants_datasheet', plant_datasheet_rtr);
app.listen(port, () => { console.log(`Now listening on port http://localhost:${port}`); });