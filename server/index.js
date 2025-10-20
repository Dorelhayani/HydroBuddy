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
const RegisterRout = require('./Routs/RegisterRout');
const AuthRout   = require('./Routs/AuthRout');
const UserRout   = require('./Routs/UserRout');
const PlantRout  = require('./Routs/PlantRout');
const deviceRouter = require('./Routs/DeviceRout');

const { EspPerUser } = require('./models/DeviceHandler');
const EspData = require('./models/Esp');
const EspRout = require('./Routs/espRout');

const deviceOrUserAuthFactory = require('./models/deviceOrUserAuth');
const deviceOrUserAuth = deviceOrUserAuthFactory({ db, auth: authMiddleware });

// Log Handeling
const { requestTag } = require('./utils/logger');
const LogRout = require('./Routs/LogRout');
app.use(requestTag());
app.use('/logs', LogRout);

// Static
app.use('/uploads', express.static(
    path.join(process.cwd(), 'uploads'),
    {
        maxAge: 0,
        etag: false,
        setHeaders: (res, filePath) => {
            if (filePath.includes(path.sep + 'avatars' + path.sep)) {
                res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
                res.setHeader('Pragma', 'no-cache');
                res.setHeader('Expires', '0');
                res.setHeader('Surrogate-Control', 'no-store');
            }
        },
    }
));

// Mount
app.use('/register', RegisterRout);
app.use('/auth', AuthRout);
app.use( '/esp', deviceOrUserAuth, EspPerUser(db, EspData), EspRout);
app.use('/users', authMiddleware.isLogged.bind(authMiddleware), UserRout);
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



/* ===== for my info ===== */

// app.use( '/esp', deviceOrUserAuth, EspPerUser(db, EspData), EspRout)
// קודם מזהה אם זו בקשת מכשיר או משתמש
// אחר כך מוסיף req.esp עם store ו-db
// ואז הנתיבים עצמם

