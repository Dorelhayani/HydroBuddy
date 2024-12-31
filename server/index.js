const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const bodyParser = require('body-parser');
const path = require('path');
const esp = require('./Routs/esp')
const app = express();
const port = 5050;

app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.set("view engine", "ejs");
app.use('/esp', esp);

app.use(express.static(path.join(__dirname, "css")));
app.use(express.static(path.join(__dirname, "js")));

let db_M = require('./models/database');
global.db_pool = db_M.pool;

// const meassurement_crud_rtr=require('./Routs/meassurement_crud');
// app.use('/meassurement', meassurement_crud_rtr);

// const plant_crud_rtr=require('./Routs/plant_crud');
// app.use('/plant', plant_crud_rtr);

const plant_datasheet_rtr=require('./Routs/plants_datasheet_crud');
app.use('/plants_datasheet', plant_datasheet_rtr);

// const sensors_crud_rtr=require('./Routs/sensors_crud');
// app.use('/sensors', sensors_crud_rtr);
app.listen(port, () => { console.log(`Now listening on port http://localhost:${port}`); });