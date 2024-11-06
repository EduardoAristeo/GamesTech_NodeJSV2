const { MongoClient } = require('mongodb');
require('dotenv').config();

let db = null;

async function connectDB() {
    try {
        const client = new MongoClient(process.env.CONN_STRING, { useUnifiedTopology: true });
        await client.connect(); // Espera a que la conexión se establezca
        db = client.db(process.env.DB_NAME);
        console.log("Connected successfully to MongoDB");
    } catch (error) {
        console.error("Failed to connect to the database", error);
        process.exit(1); // Salir del proceso si no se puede conectar a la base de datos
    }
}

function getDB() {
    if (!db) {
        throw new Error('Database not initialized. Call connectDB first.');
    }
    return db;
}

module.exports = { connectDB, getDB };
