
// const mysql = require('mysql');
// const express = require('express');
// const session = require('express-session');
// const path = require('path');



import { createConnection } from "mysql";
var con = createConnection({
host: "localhost",
user: "root",
password: null,
database: "bitewise",
});

con.connect(function (err) {
    if (err) {
        console.log('Error connecting to Db');
        return;
    }
    console.log('Connection established');
});


