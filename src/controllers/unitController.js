const multer = require('multer');
const MiddleWare = require('../middleware/authMiddleware');
const connectToMySQL = require('../utils/db');
const multerConfig = require('../utils/multer');
const cloudinary = require('../utils/couldinary');

class UnitController {
    static async createUnit(req, res) {
        try {
            const connection = connectToMySQL();
            const { Unit_Name } = req.body;
            if (!Unit_Name) {
                return res.json({
                    message: "ກະລຸນາປ້ອນຂໍ້ມູນກ່ອນ !",
                });
            }
            const insertUnit = `INSERT INTO tb_unit (Unit_Name) VALUES (?)`;
            connection.query(insertUnit, [Unit_Name], async (error, results) => {
                if (error) {
                    return res.json({
                        message: "Database error",
                        error: error
                    });
                }
                const data = results[0];
                connection.end();
                return res.json({
                    status: "ok",
                    message: "ສ້າງຫົວຫນ່ວຍສຳເລັດ",
                    data: data,
                });
            });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }

    static async deleteUnit(req, res) {
        try {
            const connection = connectToMySQL();
            const { Unit_ID } = req.body;
            if (!Unit_ID) {
                return res.json({
                    message: "ກະລຸນາປ້ອນຂໍ້ມູນກ່ອນ !",
                });
            }
            const deleteQuery = 'DELETE FROM tb_unit WHERE Unit_ID = ?';
            connection.query(deleteQuery, [Unit_ID], (error, results) => {
                if (error) {
                    return res.json({ message: "Database error" });
                }
                if (results.affectedRows === 0) {
                    return res.json({ message: "Unit ID not found!" });
                }
                connection.end();
                return res.json({
                    status: "ok",
                    message: "Unit deleted successfully",
                });
            });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }

    static async getAllUnits(req, res) {
        try {
            const connection = connectToMySQL();
            const getAllUnitsQuery = 'SELECT * FROM tb_unit';
            connection.query(getAllUnitsQuery, (error, results) => {
                if (error) {
                    return res.json({ message: "Database error" });
                }
                connection.end();
                return res.json({
                    status: "ok",
                    message: "All units retrieved successfully",
                    data: results,
                });
            });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }

    static async updateUnit(req, res) {
        try {
            const connection = connectToMySQL();
            const { Unit_ID } = req.params;
            const { Unit_Name } = req.body;

            if (!Unit_Name) {
                return res.json({
                    message: "ກະລຸນາປ້ອນຂໍ້ມູນກ່ອນ !",
                });
            }

            const updateQuery = 'UPDATE tb_unit SET Unit_Name = ? WHERE Unit_ID = ?';
            connection.query(updateQuery, [Unit_Name, Unit_ID], (error, results) => {
                if (error) {
                    return res.json({ message: "Database error" });
                }
                if (results.affectedRows === 0) {
                    return res.json({ message: "Unit ID not found!" });
                }
                connection.end();
                return res.json({
                    status: "ok",
                    message: "Unit updated successfully",
                });
            });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }
}

module.exports = UnitController;
