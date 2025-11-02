
const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config();
const DATABASE_TYPE = process.env.DATABASE_TYPE;


let DatabaseManager;
let db;

if (DATABASE_TYPE === 'mongodb') {
    console.log('Loading MongoDB DatabaseManager...');
    DatabaseManager = require('./mongodb/index.js')
    DatabaseManager.connect()

    db = mongoose.connection
} else if (DATABASE_TYPE == 'postgresql') {
    console.log('Loading PostgreSQL DatabaseManager...');
    DatabaseManager = require('./postgresql/index.js')
    DatabaseManager.connect()

    db = {
        on: (event, callback) => {
            if (event === 'error') {
                console.log('PostgreSQL error listener registered');
            }
        }
    };
}

module.exports = db;
module.exports.DatabaseManager = DatabaseManager