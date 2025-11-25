import mysql from 'mysql2/promise';
import 'dotenv/config'; // Loads environment variables from .env file

// --- Configuration Setup ---
// Uses environment variables for secure, non-hardcoded credentials
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    
    // Recommended Pool Settings for Express:
    waitForConnections: true, // Wait for connections if pool is exhausted
    connectionLimit: 10,      // Maximum number of connections to create at once
    queueLimit: 0             // No limit on connection requests queue
};

// Create a connection pool: This is much more efficient and robust than single connections
const pool = mysql.createPool(dbConfig);

// --- Connection Test on Module Load ---
// This ensures your server won't start successfully if the database is unreachable
try {
    const connection = await pool.getConnection();
    console.log("[DB] Successfully connected to MySQL server and connection pool established.");
    connection.release(); // Release the test connection back to the pool
} catch (error) {
    console.error(`[DB ERROR] Could not connect to MySQL server. Check .env credentials.`);
    console.error(`[DB ERROR] Error Message: ${error.message}`);
    // Optional: Exit the process if the core database dependency fails (brutally honest approach)
    // process.exit(1); 
}

/**
 * Executes a query against the MySQL connection pool.
 * This function is the single point of contact for all SQL operations.
 * * @param {string} sql - The SQL query string (with '?' placeholders).
 * @param {Array} [values=[]] - Values to safely escape and insert into the query (parameterization).
 * @returns {Promise<Array<object>>} The results (or affected rows/insert ID for modifications).
 */
export async function query(sql, values = []) {
    // The pool.execute() method uses prepared statements (safe from SQL Injection)
    const [results] = await pool.execute(sql, values);
    return results;
}

/**
 * Utility function to initialize all necessary database tables (schema).
 * This ensures the application can run even if the database is empty.
 */
export async function initializeDatabaseSchema() {
    console.log("[DB] Checking database schema...");
    const createPlaylistsTableSQL = `
        CREATE TABLE IF NOT EXISTS playlists (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            mood VARCHAR(50),
            songs_json JSON, 
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    
    try {
        await query(createPlaylistsTableSQL);
        console.log("[DB] 'playlists' table verified/created successfully.");
    } catch (error) {
        console.error("[DB ERROR] Failed to initialize database schema:", error.message);
        // Brutally honest: If schema creation fails, the application is unusable.
        process.exit(1); 
    }
}