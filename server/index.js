// installed libraries
// body-parser, cors
// cookie-parser = for reading cookies , bcryptjs = for encrypt password , jsonwebtoken = for saving cookies ,
// zxcvbn = for strong password, validator = for email validate

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5050;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));

let db_M = require('./models/database');
global.db_pool = db_M.pool;
global.was_logged = false;
global.zxcvbn = require('zxcvbn');
global.bcrypt = require("bcryptjs");
global.jwt = require('jsonwebtoken');

const Auth = require('./Routs/AuthRout');
app.use("/auth", Auth);

const user = require('./Routs/UserRout');
app.use("/users", user);

const plant = require('./Routs/PlantRout');
app.use('/PlantRout', plant);

const esp = require('./Routs/espRout');
app.use('/esp', esp);

app.listen(port, () => { console.log(`Now listening on port http://localhost:${port}`); });