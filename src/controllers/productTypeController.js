const multer = require('multer');
const MiddleWare = require('../middleware/authMiddleware');
const connectToMySQL = require('../utils/db');
const multerConfig = require('../utils/multer');
const cloudinary = require('../utils/couldinary');

class ProductTypeController {
    static async createType(req, res) {
        try {
            const connection = connectToMySQL();
            const { Product_Type_Name } = req.body;
            const Profile_img = req.file ? req.file.path : null;
            if (!Product_Type_Name) {
                return res.json({
                    message: "ກະລຸນາປ້ອນຂໍ້ມູນກ່ອນ !",
                });
            }
            const insertType = `INSERT INTO tb_products_type (Product_Type_Name, img) VALUES (?, ?)`;
            if (Profile_img) {
                //upload image
                await cloudinary.uploader.upload(Profile_img);
                const result = await cloudinary.uploader.upload(Profile_img);
                const imageUrl = result.secure_url;
                console.log(imageUrl);
                connection.query(insertType, [Product_Type_Name, imageUrl || ""], async (error, results) => {
                    if (error) {
                        return res.json({
                            message: "ເກີດຂໍ້ຜິດພາດ",
                            error:error
                        });
                    }
                    const data = results[0];
                    connection.end();
                    return res.json({
                        status: "ok",
                        message: "ສ້າງສຳເລັດ",
                        data: data,
                    });
                });
            } else {
                return res.json({
                    message: "ກະລຸນາເພີ່ມຮູບພາບ",
                });
            }
        } catch (error) {
            return res.json({ message: error.message });
        }

    }
    static async deleteType(req, res) {
        try {
            const connection = connectToMySQL();
            const { Product_Type_ID } = req.params;
            if (!Product_Type_ID) {
                return res.json({ message: "ກະລຸນາປ້ອນ ID !" });
            }
            const deleteUserQuery = 'DELETE FROM tb_products_type WHERE Product_Type_ID = ?';
            connection.query(deleteUserQuery, [Product_Type_ID], (error, results) => {
                if (error) {
                    return res.json({ message: "ເກີດຂໍ້ຜິດພາດ" });
                }
                if (results.affectedRows === 0) {
                    return res.json({ message: "ບໍ່ພົບ ID !" });
                }
                connection.end();
                return res.json({
                    status: "ok",
                    message: "ລຶບສຳເລັດ",
                });
            });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }
    



    static async updateType(req, res) {
        try {
            const connection = connectToMySQL();
            const { Product_Type_ID } = req.params;
            const { Product_Type_Name } = req.body;
            const Profile_img = req.file ? req.file.path : null;
       

            if ( !Product_Type_Name) {
                return res.json({ message: "ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຕ້ອງການອັບເດດ!" });
            }

            let updateQuery = 'UPDATE tb_products_type SET Product_Type_Name = ?';
            let queryParams = [Product_Type_Name];

            if (Profile_img) {
                const result = await cloudinary.uploader.upload(Profile_img);
                const imageUrl = result.secure_url;
                updateQuery += ', img = ?';
                queryParams.push(imageUrl);
            }

            updateQuery += ' WHERE Product_Type_ID = ?';
            queryParams.push(Product_Type_ID);

            connection.query(updateQuery, queryParams, (error, results) => {
                if (error) {
                    console.log(error);
                    return res.json({ message: "ເກີດຂໍ້ຜິດພາດ" });
                }
                if (results.affectedRows === 0) {
                    return res.json({ message: "ບໍ່ພົບ ID !" });
                }
                connection.end();
                return res.json({
                    status: "ok",
                    message: "ອັບເດດສຳເລັດ",
                });
            });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }
    static async getAllType(req, res) {
        try {
            const connection = connectToMySQL();
            const getAllTypesQuery = 'SELECT * FROM tb_products_type';
            connection.query(getAllTypesQuery, (error, results) => {
                if (error) {
                    console.log(error);
                    return res.json({ message: "Database error" });
                }
                connection.end();
                return res.json({
                    status: "ok",
                    message: "ຂໍ້ມູນທັງໝົດ",
                    data: results,
                });
            });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }
   
}

module.exports = ProductTypeController;

