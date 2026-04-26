// Fix: local router DNS blocks MongoDB Atlas SRV lookups — use Google DNS
require('dns').setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // Do not call process.exit(1) here.
        // This allows the server to start even if DB is down,
        // and return JSON error messages instead of crashing with a 500 page.
    }

};

module.exports = connectDB;
