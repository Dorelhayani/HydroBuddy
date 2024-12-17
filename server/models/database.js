const mysql = require('mysql2');

let HOST     =require("./gen-params").HOST     ;
let USER     =require("./gen-params").USER     ;
let PASSWORD =require("./gen-params").PASSWORD ;
let DATABASE =require("./gen-params").DATABASE ;
console.log("database.HOST	=",HOST	)
console.log("database.USER	=",USER	);
console.log("database.PASSWORD=",PASSWORD);
console.log("database.DATABASE=",DATABASE);



const pool = mysql.createPool({
    host:		HOST		,
    user:		USER		,
    password:	PASSWORD	,
    database:	DATABASE	,
    waitForConnections: true,
    connectionLimit: 10,
});


module.exports = {
    pool:pool
};