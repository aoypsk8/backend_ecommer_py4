const multer = require('multer');
const MiddleWare = require('../middleware/authMiddleware');
const connectToMySQL = require('../utils/db');
const multerConfig = require('../utils/multer');
const cloudinary = require('../utils/couldinary');

class AuthCustomerController {
    static async loginCustomer(req, res) {
        try {
            const connection = connectToMySQL();
            const { phoneNumber, password } = req.body;
            if (!phoneNumber || !password) {
                return res.json({
                    message: "ກະລຸນາປ້ອນຂໍ້ມູນກ່ອນ !",
                });
            }
            const queryUserLogin = 'SELECT * FROM tb_customers WHERE Phone_Number = ?';
            connection.query(queryUserLogin, [phoneNumber], async (error, results) => {
                if (error) {
                    return res.json({
                        message: "ເກີດຂໍ້ຜິດພາດ",
                    });
                }
                // Check if user exists
                if (results.length === 0) {
                    return res.json({
                        message: "ບໍ່ພົບ PhoneNumber !",
                    });
                }
                const user = results[0];
                // Compare password
                if (user['Password'] != password) {
                    return res.json({ message: "ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ  !" });
                }
                const payload = {
                    Phone_Number: user['Phone_Number']
                };
                var accessToken = "";
                accessToken = await MiddleWare.GenerateToken(payload);
                // Close MySQL connection
                connection.end();
                return res.json({
                    status: "ok",
                    message: "ເຂົ້າສູ່ລະບົບສຳເລັດ",
                    data: user,
                    token: accessToken,

                });
            });
        } catch (error) {
            return res.json({
                message: error.message,
            });
        }
    }

    static async registerCustomer(req, res) {
        try {
            const connection = connectToMySQL();
            const { First_name, Last_name, Phone_Number, Address, Password } = req.body;
            const Profile_img = req.file ? req.file.path : null;

            if (!First_name || !Last_name || !Phone_Number || !Address || !Password) {
                return res.json({
                    message: "ກະລຸນາປ້ອນຂໍ້ມູນກ່ອນ !",
                });
            } else {
                // Check if phone number already exists
                const checkPhoneNumberQuery = 'SELECT * FROM tb_customers WHERE Phone_Number = ?';
                connection.query(checkPhoneNumberQuery, [Phone_Number], async (error, results) => {
                    if (error) {
                        return res.json({
                            message: "ເກີດຂໍ້ຜິດພາດ",
                        });
                    }
                    if (results.length > 0) {
                        return res.json({
                            message: "ເບີໂທລະສັບນີ້ມີແລ້ວ!",
                        });
                    }
                    // Insert new user if phone number doesn't exist
                    const insertUser = `INSERT INTO tb_customers (First_name, Last_name, Phone_Number, Profile_img, Address, Password) VALUES (?,?,?,?,?,?)`;
                    if (Profile_img) {
                        //upload image
                        await cloudinary.uploader.upload(Profile_img);
                        const result = await cloudinary.uploader.upload(Profile_img);
                        const imageUrl = result.secure_url;
                        connection.query(insertUser, [First_name, Last_name, Phone_Number, imageUrl || "", Address, Password], async (error, results) => {
                            if (error) {
                                return res.json({
                                    message: "ເກີດຂໍ້ຜິດພາດ",
                                });
                            }
                            const user = results[0];
                            // Close MySQL connection
                            connection.end();
                            return res.json({
                                status: "ok",
                                message: "ລົງທະບຽນສຳເລັດ",
                                data: user,
                            });
                        });
                    }else{
                        return res.json({
                            message: "ກະລຸນາເພີ່ມຮູບພາບ",
                        });
                    }
                    
                });
            }
        } catch (error) {
            return res.json({
                message: error.message,
            });
        }
    }

    static async deleteCustomer(req, res) {
        try {
            const connection = connectToMySQL();
            const { Cus_ID } = req.params;
            if (!Cus_ID) {
                return res.json({ message: "ກະລຸນາປ້ອນ ID !" });
            }
            const deleteUserQuery = 'DELETE FROM tb_customers WHERE Cus_ID = ?';
            connection.query(deleteUserQuery, [Cus_ID], (error, results) => {
                if (error) {
                    return res.json({ message: "ເກີດຂໍ້ຜິດພາດ" });
                }
                if (results.affectedRows === 0) {
                    return res.json({ message: "ບໍ່ພົບ ID !" });
                }
                connection.end();
                return res.json({
                    status: "ok",
                    message: "ລຶບຜູ້ໃຊ້ສຳເລັດ",
                });
            });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }
    static async getAllCostomers(req, res) {
        try {
            const connection = connectToMySQL();
            const getAllUsersQuery = 'SELECT * FROM tb_customers';
            connection.query(getAllUsersQuery, (error, results) => {
                if (error) {
                    return res.json({ message: "ເກີດຂໍ້ຜິດພາດ" });
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
    static async getCustomerByID(req, res) {
        try {
            const connection = connectToMySQL();
            const { Cus_ID } = req.params;
            if (!Cus_ID) {
                return res.json({ message: "ກະລຸນາປ້ອນ Phone Number !" });
            }
            const getUserQuery = 'SELECT * FROM tb_customers WHERE Cus_ID = ?';
            connection.query(getUserQuery, [Cus_ID], (error, results) => {
                if (error) {
                    return res.json({ message: "ເກີດຂໍ້ຜິດພາດ" });
                }
                if (results.length === 0) {
                    return res.json({ message: "ບໍ່ພົບ ID !" });
                }
                connection.end();
                return res.json({
                    status: "ok",
                    message: "ຂໍ້ມູນຜູ້ໃຊ້",
                    data: results[0],
                });
            });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }



    static async updateCustomer(req, res) {
        try {
            const connection = connectToMySQL();
            const { Cus_ID } = req.params;
            const { First_name, Last_name, Phone_Number, Address, Password } = req.body;
            const Profile_img = req.file ? req.file.path : null;

            if (!Cus_ID || !First_name || !Last_name || !Phone_Number || !Address || !Password) {
                return res.json({ message: "ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຕ້ອງການອັບເດດ!" });
            }

            let updateQuery = 'UPDATE tb_customers SET First_name = ?, Last_name = ?, Phone_Number = ?, Address = ?, Password = ?';
            let queryParams = [First_name, Last_name, Phone_Number, Address, Password];

            if (Profile_img) {
                const result = await cloudinary.uploader.upload(Profile_img);
                const imageUrl = result.secure_url;
                updateQuery += ', Profile_img = ?';
                queryParams.push(imageUrl);
            }

            updateQuery += ' WHERE Cus_ID = ?';
            queryParams.push(Cus_ID);

            connection.query(updateQuery, queryParams, (error, results) => {
                if (error) {
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




}

module.exports = AuthCustomerController;

