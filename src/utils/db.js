const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

// Function to connect to MySQL database
function connectToMySQL() {
    const connection = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    connection.connect((error) => {
        if (error) {
            console.error('Error connecting to MySQL:', error.stack);
            return;
        }
        console.log('Connected to MySQL');
    });

    // Handle connection errors
    connection.on('error', (error) => {
        console.error('MySQL Error:', error.message);
    });

    return connection;
}

module.exports = connectToMySQL;
