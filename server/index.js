const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const path = require('path');
const app = express();
const port = process.env.PORT || 5050;
const cookieParser = require('cookie-parser');


const db = require('./models/database');
const Auth = require('./models/Auth');

// Auth instance (options from env)
const authMiddleware = new Auth(db, {
    singleSession: process.env.SINGLE_SESSION === 'true',
    jwtSecret: process.env.JWT_SECRET,
    jwtExpireSec: process.env.JWT_EXPIRE_SEC ? Number(process.env.JWT_EXPIRE_SEC) : undefined,
    saltRounds: process.env.SALT_ROUNDS ? Number(process.env.SALT_ROUNDS) : undefined,
    cookieName: process.env.AUTH_COOKIE_NAME || 'ImLogged',
});

// Middlewares
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
    cors({
        origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
        credentials: true,
    })
);


// Routes
const AuthRout = require('./Routs/AuthRout');
const UserRout = require('./Routs/UserRout');
const PlantRout = require('./Routs/PlantRout');
const EspRout = require('./Routs/espRout');

app.use('/auth', AuthRout); // public: register/login
app.use('/users', authMiddleware.isLogged.bind(authMiddleware), UserRout);
app.use('/PlantRout', authMiddleware.isLogged.bind(authMiddleware), PlantRout);
app.use('/esp', authMiddleware.isLogged.bind(authMiddleware), EspRout);
app.use( '/uploads', express.static(path.join(process.cwd(), 'uploads'), { maxAge: 0, etag: false }));

// Start
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
    if (process.env.SINGLE_SESSION === 'true') {
        console.log('SINGLE_SESSION is enabled (tokens will be stored/checked in DB).');
    }
});
