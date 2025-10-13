// index.js

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 5050;

const db = require('./models/database');
const Auth = require('./models/Auth');

// אינסטנס יחיד של Auth (ליוזרים)
const authMiddleware = new Auth(db, {
    singleSession: process.env.SINGLE_SESSION === 'true',
    jwtSecret: process.env.JWT_SECRET,
    jwtExpireSec: process.env.JWT_EXPIRE_SEC ? Number(process.env.JWT_EXPIRE_SEC) : undefined,
    saltRounds: process.env.SALT_ROUNDS ? Number(process.env.SALT_ROUNDS) : undefined,
    cookieName: process.env.AUTH_COOKIE_NAME || 'ImLogged',
});

// Middlewares
app.use(cookieParser());
app.use(morgan('dev'));
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
const AuthRout   = require('./Routs/AuthRout');
const UserRout   = require('./Routs/UserRout');
const PlantRout  = require('./Routs/PlantRout');
const deviceRouter = require('./Routs/DeviceRout');

const { EspPerUser } = require('./models/DeviceHandler');
const EspData = require('./models/EspMode');
const EspRout = require('./Routs/EspRout');

const deviceOrUserAuthFactory = require('./models/deviceOrUserAuth');
const deviceOrUserAuth = deviceOrUserAuthFactory({ db, auth: authMiddleware });


// Static
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), { maxAge: 0, etag: false }));

// Mount
app.use('/auth',   AuthRout);
app.use('/esp', (req, res, next) => {
    if (req.method === 'GET' && /\?Temp:\d/.test(req.originalUrl)) {
        return res.status(410).json({ error: 'Deprecated endpoint. Use POST /PlantRout/StoreToDatasensors' });
    }
    next();
});


app.use(
    '/esp',
    deviceOrUserAuth,           // קודם מזהה אם זו בקשת מכשיר או משתמש
    EspPerUser(db, EspData),    // אחר כך מוסיף req.esp עם store ו-db
    EspRout                     // ואז הנתיבים עצמם
);

app.use('/users',  authMiddleware.isLogged.bind(authMiddleware), UserRout);
// app.use('/PlantRout', authMiddleware.isLogged.bind(authMiddleware), PlantRout);
app.use('/PlantRout', deviceOrUserAuth, PlantRout);
app.use('/devices', deviceRouter);

// Start
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
    if (process.env.SINGLE_SESSION === 'true') {
        console.log('SINGLE_SESSION is enabled (tokens will be stored/checked in DB).');
    }
});

module.exports = { authMiddleware };

