const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'cuppa',
        multipleStatements: true
    });

    console.log('Running migration 002: Add gallery tables...');

    try {
        // 1. Add owner_id column if not exists
        console.log('Adding owner_id column...');
        await connection.query(`
      ALTER TABLE cafes 
      ADD COLUMN IF NOT EXISTS owner_id INT UNSIGNED NOT NULL DEFAULT 1 AFTER id
    `);

        // 2. Add logo_url column if not exists
        console.log('Adding logo_url column...');
        await connection.query(`
      ALTER TABLE cafes 
      ADD COLUMN IF NOT EXISTS logo_url VARCHAR(255) NULL AFTER cover_url
    `);

        // 3. Add foreign key constraint if not exists
        console.log('Adding foreign key constraint...');
        try {
            await connection.query(`
        ALTER TABLE cafes 
        ADD CONSTRAINT fk_cafe_owner 
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      `);
        } catch (err) {
            if (err.code !== 'ER_DUP_KEYNAME' && err.code !== 'ER_ALTER_INFO') {
                console.log('FK might already exist or users table not ready:', err.message);
            }
        }

        // 4. Create cafe_photos table if not exists
        console.log('Creating cafe_photos table...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS cafe_photos (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        cafe_id INT UNSIGNED NOT NULL,
        url VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_cafe_photos_cafe_id (cafe_id),
        CONSTRAINT fk_photo_cafe FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

        // 5. Update existing cafes with owner_id = 1 if they don't have one
        console.log('Updating existing cafes...');
        await connection.query(`
      UPDATE cafes SET owner_id = 1 WHERE owner_id = 0 OR owner_id IS NULL
    `);

        console.log('Migration 002 completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

runMigration().catch(console.error);

