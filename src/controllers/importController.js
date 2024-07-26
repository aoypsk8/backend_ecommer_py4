const multer = require("multer");
const MiddleWare = require("../middleware/authMiddleware");
const connectToMySQL = require("../utils/db");
const multerConfig = require("../utils/multer");
const cloudinary = require("../utils/couldinary");
const { subscribe } = require("../routers/routes");

class ImportController {
    static async createImport(req, res) {
        try {
            const connection = connectToMySQL();
            const { Emp_ID, Pro_name, ReceivedQty, Sub_Price, Sl_ID } = req.body;
            if (!Emp_ID || !Pro_name || !ReceivedQty || !Sub_Price || !Sl_ID) {
                return res.json({
                    message: "ກະລຸນາປ້ອນຂໍ້ມູນກ່ອນ !",
                });
            }
            // Convert ReceivedQty and Sub_Price to integers
            const receivedQtyInt = parseInt(ReceivedQty, 10);
            const subPriceInt = parseInt(Sub_Price, 10);

            var total = receivedQtyInt * subPriceInt;
            const dateNow = Date.now();
            const currentDate = new Date(dateNow);

            // Check if the product already exists
            const checkQuery = "SELECT * FROM tb_import_product WHERE Pro_name = ? AND Sl_ID = ?";
            connection.query(checkQuery, [Pro_name, Sl_ID], (checkError, checkResults) => {
                if (checkError) {
                    return res.json({ message: "Database error", error: checkError });
                }

                if (checkResults.length > 0) {
                    // Product exists, update it
                    const existingProduct = checkResults[0];
                    const newReceivedQty = existingProduct.ReceivedQty + receivedQtyInt;
                    const newTotal = newReceivedQty * subPriceInt;

                    const updateQuery = `
                        UPDATE tb_import_product 
                        SET Emp_ID = ?, ReceivedQty = ?, Sub_Price = ?, Price_Total = ?, Date_received = ? 
                        WHERE Ip_ID = ?`;
                    connection.query(
                        updateQuery,
                        [Emp_ID, newReceivedQty, subPriceInt, newTotal, currentDate, existingProduct.Ip_ID],
                        (updateError, updateResults) => {
                            if (updateError) {
                                return res.json({ message: "Database error", error: updateError });
                            }
                            connection.end();
                            return res.json({
                                status: "ok",
                                message: "Import product updated successfully",
                            });
                        }
                    );
                } else {
                    // Product does not exist, insert it
                    const insertQuery = `
                        INSERT INTO tb_import_product 
                        (Emp_ID, Pro_name, Date_received, ReceivedQty, Sub_Price, Price_Total, Sl_ID) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)`;
                    connection.query(
                        insertQuery,
                        [Emp_ID, Pro_name, currentDate, receivedQtyInt, subPriceInt, total, Sl_ID],
                        (insertError, insertResults) => {
                            if (insertError) {
                                return res.json({ message: "Database error", error: insertError });
                            }
                            connection.end();
                            return res.json({
                                status: "ok",
                                message: "Import product created successfully",
                            });
                        }
                    );
                }
            });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }

    static async deleteImport(req, res) {
        try {
            const connection = connectToMySQL();
            const { Ip_ID } = req.body;
            if (!Ip_ID) {
                return res.json({
                    message: "ກະລຸນາປ້ອນຂໍ້ມູນກ່ອນ !",
                });
            }
            const deleteQuery = "DELETE FROM tb_import_product WHERE Ip_ID = ?";
            connection.query(deleteQuery, [Ip_ID], (error, results) => {
                if (error) {
                    return res.json({ message: "Database error" });
                }
                if (results.affectedRows === 0) {
                    return res.json({ message: "Ip_ID ID not found!" });
                }
                connection.end();
                return res.json({
                    status: "ok",
                    message: "IMport product deleted successfully",
                });
            });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }

    static async getAllImport(req, res) {
        try {
            const connection = connectToMySQL();
            const getAllImportsQuery = `SELECT ip.*, ts.First_names,em.First_name
                                    FROM tb_import_product AS ip
                                    JOIN tb_suppliers AS ts ON ip.Sl_ID = ts.Sl_ID
                                    JOIN tb_employee AS em ON ip.Emp_ID = em.Emp_ID
                                    `;

            connection.query(getAllImportsQuery, (error, results) => {
                connection.end();
                if (error) {
                    return res.json({ status: "error", message: "Database error", error: error });
                }
                console.log("Retrieved data:", results);

                return res.json({
                    status: "ok",
                    message: "All Import Products retrieved successfully",
                    data: results,
                });
            });
        } catch (error) {
            return res.json({ status: "error", message: error.message });
        }
    }


    static async updateImport(req, res) {
        try {
            const connection = connectToMySQL();
            const { Ip_ID } = req.params;
            const { Emp_ID, Pro_name, ReceivedQty, Sub_Price, Sl_ID } = req.body;

            if (!Emp_ID || !Pro_name || !ReceivedQty || !Sub_Price || !Sl_ID) {
                return res.json({
                    message: "ກະລຸນາປ້ອນຂໍ້ມູນກ່ອນ !",
                });
            }
            // Convert ReceivedQty and Sub_Price to integers
            const receivedQtyInt = parseInt(ReceivedQty, 10);
            const subPriceInt = parseInt(Sub_Price, 10);

            var total = receivedQtyInt * subPriceInt;

            const updateQuery =
                "UPDATE tb_import_product SET Emp_ID = ?, Pro_name = ?, ReceivedQty = ?, Sub_Price = ?, Price_Total = ?, Sl_ID = ? WHERE Ip_ID = ?";
            connection.query(
                updateQuery,
                [Emp_ID, Pro_name, ReceivedQty, Sub_Price, total, Sl_ID, Ip_ID],
                (error, results) => {
                    connection.end();
                    if (error) {
                        return res.json({ message: "Database error", error: error });
                    }
                    if (results.affectedRows === 0) {
                        return res.json({ message: "Import Product ID not found!" });
                    }
                    return res.json({
                        status: "ok",
                        message: "Import Product updated successfully",
                    });
                }
            );
        } catch (error) {
            return res.json({ message: error.message });
        }
    }
}

module.exports = ImportController;
