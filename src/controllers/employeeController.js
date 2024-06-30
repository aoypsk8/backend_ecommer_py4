const multer = require('multer');
const MiddleWare = require('../middleware/authMiddleware');
const connectToMySQL = require('../utils/db');
const multerConfig = require('../utils/multer');
const cloudinary = require('../utils/couldinary');

class EmployeeController {
    static async loginEmployee(req, res) {
        try {
            const connection = connectToMySQL();
            const { phoneNumber, password } = req.body;
            if (!phoneNumber || !password) {
                return res.json({
                    message: "ກະລຸນາປ້ອນຂໍ້ມູນກ່ອນ !",
                });
            }
            const queryUserLogin = 'SELECT * FROM tb_employee WHERE Phone_Number = ?';
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

    static async registerEmployee(req, res) {
        try {
            const connection = connectToMySQL();
            const { Emp_ID, First_name, Last_name, gender, Roles, Village, District, Province, Phone_Number, Password } = req.body;
            console.log(req.body);
            const Profile_img = req.file ? req.file.path : null;
    
            if (  !First_name || !Last_name || !gender || !Roles || !Village || !District || !Province || !Phone_Number || !Password) {
                return res.json({
                    message: "ກະລຸນາປ້ອນຂໍ້ມູນກ່ອນ !",
                });
            } else {
                // Check if phone number already exists
                const checkPhoneNumberQuery = 'SELECT * FROM tb_employee WHERE Phone_Number = ?';
                connection.query(checkPhoneNumberQuery, [Phone_Number], async (error, results) => {
                    if (error) {
                        return res.json({
                            message: "ເກີດຂໍ້ຜິດພາດ",
                            error
                        });
                    }
                    if (results.length > 0) {
                        return res.json({
                            message: "ເບີໂທລະສັບນີ້ມີແລ້ວ!",
                        });
                    }
                    // Insert new employee if phone number doesn't exist
                    const insertEmployee = `INSERT INTO tb_employee (Emp_ID, First_name, Last_name, gender, Roles, Village, District, Province, Phone_Number, Profile_img, Password) VALUES (?,?,?,?,?,?,?,?,?,?,?)`;
                    if (Profile_img) {
                        // Upload image
                        await cloudinary.uploader.upload(Profile_img);
                        const result = await cloudinary.uploader.upload(Profile_img);
                        const imageUrl = result.secure_url;
                        connection.query(insertEmployee, [Emp_ID, First_name, Last_name, gender, Roles, Village, District, Province, Phone_Number, imageUrl || "", Password], async (error, results) => {
                            if (error) {
                                console.log(error);
                                return res.json({
                                    message: "ເກີດຂໍ້ຜິດພາດ",
                                });
                            }
                            const employee = results[0];
                            // Close MySQL connection
                            connection.end();
                            return res.json({
                                status: "ok",
                                message: "ລົງທະບຽນສຳເລັດ",
                                data: employee,
                            });
                        });
                    } else {
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
    
    static async deleteEmployee(req, res) {
        try {
            const connection = connectToMySQL();
            const { Emp_ID } = req.params;
            if (!Emp_ID) {
                return res.json({ message: "ກະລຸນາປ້ອນ ID !" });
            }
            const deleteUserQuery = 'DELETE FROM tb_employee WHERE Emp_ID = ?';
            connection.query(deleteUserQuery, [Emp_ID], (error, results) => {
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
    static async getAllEmployee(req, res) {
        try {
            const connection = connectToMySQL();
            const getAllUsersQuery = 'SELECT * FROM tb_employee';
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
    static async getEmployeeByID(req, res) {
        try {
            const connection = connectToMySQL();
            const { Emp_ID } = req.params;
            if (!Emp_ID) {
                return res.json({ message: "ກະລຸນາປ້ອນ Phone Number !" });
            }
            // const getUserQuery = 'SELECT * FROM tb_employee WHERE Emp_ID = ?';
            // connection.query(getUserQuery, [Emp_ID], (error, results) => {
            //     if (error) {
            //         return res.json({ message: "ເກີດຂໍ້ຜິດພາດ" });
            //     }
            //     if (results.length === 0) {
            //         return res.json({ message: "ບໍ່ພົບ ID !" });
            //     }
            //     connection.end();
            //     return res.json({
            //         status: "ok",
            //         message: "ຂໍ້ມູນຜູ້ໃຊ້",
            //         data: results[0],
            //     });
            // });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }
    
    static async updateEmployee(req, res) {
        try {
            const connection = connectToMySQL();
            const { Emp_ID } = req.params;
            const { First_name, Last_name, gender, Roles, Village, District, Province, Phone_Number, Password } = req.body;
            const Profile_img = req.file ? req.file.path : null;

            console.log(req.body);
            console.log(Profile_img);

            // if ( !First_name || !Last_name || !gender || !Roles || !Village || !District || !Province || !Phone_Number || !Password ) {
            //     return res.json({ message: "ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຕ້ອງການອັບເດດ!" });
            // }

            let updateQuery = 'UPDATE tb_employee SET First_name = ?, Last_name = ?, gender = ?, Roles = ?, Village = ?, District = ?, Province = ?, Phone_Number = ?, Password=?';
            let queryParams = [First_name, Last_name, gender, Roles, Village, District, Province, Phone_Number, Password];

            if (Profile_img) {
                const result = await cloudinary.uploader.upload(Profile_img);
                const imageUrl = result.secure_url;
                updateQuery += ', Profile_img = ?';
                queryParams.push(imageUrl);
            }

            updateQuery += ' WHERE Emp_ID = ?';
            queryParams.push(Emp_ID);

            connection.query(updateQuery, queryParams, (error, results) => {
                if (error) {
                    return res.json({ message: "ເກີດຂໍ້ຜິດພາດ",error });
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


module.exports = EmployeeController;

