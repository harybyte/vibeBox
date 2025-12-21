import mysql from 'mysql2/promise';
import 'dotenv/config'; 


const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    // Recommended Pool Settings for Express:
    waitForConnections: true, 
    connectionLimit: 10,      
    queueLimit: 0
};


const pool = mysql.createPool(dbConfig);

/**
 * Executes a query against the MySQL connection pool.
 * @throws {Error} If the query fails.
 */
export async function query(sql, values = []) {
    try {
        const [results] = await pool.execute(sql, values);
        return results;
    } catch (error) {
        // Log error but let the caller handle it (or throw it)
        console.error(`[DB Query Error] ${error.message}`);
        throw error;
    }
}

/**
 * Utility function to initialize all necessary database tables (schema).
 * This ensures the application can run even if the database is empty.
 * @returns {Promise<boolean>} True if successful, False otherwise.
 */
export async function initializeDatabaseSchema() {
   

    // Checking credentials availability
    if (!process.env.DB_HOST || !process.env.DB_USER) {
        console.warn("[DB Warning] Missing DB_HOST or DB_USER. Database features (Playlists) will be disabled.");
        return false;
    }

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
        // Test connection first
        const connection = await pool.getConnection();
        console.log("[DB] Successfully connected to MySQL server.");
        connection.release();

        // Run schema creation
        await query(createPlaylistsTableSQL);
        return true;
    } catch (error) {
        console.error("[DB ERROR] Failed to initialize database schema:", error.message);
        console.warn("[DB Warning] Application will start without Database features.");
        return false; // Don't crash the app
    }
}
