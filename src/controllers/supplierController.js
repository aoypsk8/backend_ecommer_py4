const multer = require('multer');
const MiddleWare = require('../middleware/authMiddleware');
const connectToMySQL = require('../utils/db');
const multerConfig = require('../utils/multer');
const cloudinary = require('../utils/couldinary');

class SupplierController {
    static async createSupplier(req, res) {
        try {
            const connection = connectToMySQL();
            const { First_name, Phone_Number, Village, District, Province } = req.body;
            console.log(req.body);
            if (!First_name || !Phone_Number || !Village || !District || !Province) {
                return res.json({
                    message: "ກະລຸນາປ້ອນຂໍ້ມູນກ່ອນ !",
                });
            }
            const insertQuery = `INSERT INTO tb_suppliers (First_names,Phone_Number,Village,District,Province) VALUES (?,?,?,?,?)`;
            connection.query(insertQuery, [First_name, Phone_Number, Village, District, Province], async (error, results) => {
                
                if (error) {
                    console.log(error);
                    return res.json({
                        message: "Database error",
                        error: error
                    });
                }
                const data = results[0];
                connection.end();
                return res.json({
                    status: "ok",
                    message: "Supplier created successfully",
                    data: data,
                });
            });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }

    static async deleteSupplier(req, res) {
        try {
            const connection = connectToMySQL();
            const { Sl_ID } = req.body;
            console.log(Sl_ID);
            if (!Sl_ID) {
                return res.json({
                    message: "ກະລຸນາປ້ອນຂໍ້ມູນກ່ອນ !",
                });
            }
            const deleteQuery = 'DELETE FROM tb_suppliers WHERE Sl_ID = ?';
            connection.query(deleteQuery, [Sl_ID], (error, results) => {
                if (error) {
                    return res.json({ message: "Database error" });
                }
                if (results.affectedRows === 0) {
                    return res.json({ message: "Sl_ID ID not found!" });
                }
                connection.end();
                return res.json({
                    status: "ok",
                    message: "Supplier deleted successfully",
                    
                });
            });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }

    static async getAllSupplier(req, res) {
        try {
            const connection = connectToMySQL();
            const getAllQuery = 'SELECT * FROM tb_suppliers';
            connection.query(getAllQuery, (error, results) => {
                if (error) {
                    return res.json({ message: "Database error" });
                }
                connection.end();
                return res.json({
                    status: "ok",
                    message: "All supplier retrieved successfully",
                    data: results,
                });
            });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }


    static async updateSupplier(req, res) {
        try {
            const connection = connectToMySQL();
            const { Sl_ID } = req.params;
            const { First_name, Phone_Number, Village, District, Province } = req.body;
            console.log(req.body);

            if (!First_name || !Phone_Number || !Village || !District || !Province) {
                return res.json({
                    message: "ກະລຸນາປ້ອນຂໍ້ມູນກ່ອນ !",
                });
            }

            const updateQuery = 'UPDATE tb_suppliers SET First_names  = ? ,Phone_Number  = ? ,Village  = ? ,District  = ? ,Province = ? WHERE Sl_ID = ?';
            connection.query(updateQuery, [First_name, Phone_Number, Village, District, Province, Sl_ID], (error, results) => {
                if (error) {
                    return res.json({ message: "Database error" });
                }
                if (results.affectedRows === 0) {
                    return res.json({ message: "Supplier ID not found!" });
                }
                connection.end();
                return res.json({
                    status: "ok",
                    message: "Supplier updated successfully",
                });
            });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }
}

module.exports = SupplierController;
