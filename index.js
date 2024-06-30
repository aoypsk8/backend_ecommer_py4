const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const router = require('./src/routers/routes');
const connectToMySQL = require('./src/utils/db');

connectToMySQL();
dotenv.config();
app.use(cors());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json({ extended: false, limit: '500mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '500mb', parameterLimit: 50000 }));

app.use("/api", router); // Using the upload middleware in your route

app.listen(process.env.PORT, () => {
    console.log(`Server is listening at http://localhost:${process.env.PORT}`);
});
