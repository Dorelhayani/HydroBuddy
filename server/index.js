const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5050;
const bodyParser = require('body-parser');

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({extended: false}));

let db_M = require('./models/database');
global.db_pool = db_M.pool;

const esp = require('./Routs/espRout');
app.use('/esp', esp);

const plant = require('./Routs/PlantRout');
app.use("/PlantRout", plant);

const user = require('./Routs/UserRout');
app.use("/users", user);

app.listen(port, () => { console.log(`Now listening on port http://localhost:${port}`); });