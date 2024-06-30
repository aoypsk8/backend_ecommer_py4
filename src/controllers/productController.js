const multer = require('multer');
const MiddleWare = require('../middleware/authMiddleware');
const connectToMySQL = require('../utils/db');
const multerConfig = require('../utils/multer');
const cloudinary = require('../utils/couldinary');

class ProductController {
    static async createProduct(req, res) {
        try {
            const connection = connectToMySQL();
            const { Product_Type_ID, Product_Name, Description, Price, ProductQty, Promotion, Unit } = req.body;
            const Product_img = req.file ? req.file.path : null;//image
            console.log(req.file);
            // Validation checks for required fields
            console.log(Product_Type_ID);
            console.log(Product_Name);
            console.log(Description);
            console.log(Price);
            console.log(ProductQty);
            console.log(Promotion);
            console.log(Unit);
            console.log(Product_img);
            if (!Product_Type_ID || !Product_Name || !Description || !Price || !ProductQty || !Unit) {
                return res.json({ message: "Please provide all required fields!" });
            }
            // SQL query to insert a new product
            const insertProductQuery = `INSERT INTO tb_products (Product_Type_ID, Product_Name, Description, Price, ProductQty, Promotion, Unit, Product_img) VALUES (?, ?, ?, ?, ?, ?, ?,  ?)`;
            
            if (Product_img) {
                // Upload image to cloudinary
                const result = await cloudinary.uploader.upload(Product_img);
                const imageUrl = result.secure_url;
                
                // Execute the SQL query to insert the product into the database
                connection.query(insertProductQuery, [Product_Type_ID, Product_Name, Description, Price, ProductQty, Promotion, Unit, imageUrl || ""], async (error, results) => {
                    if (error) {
                        return res.json({ message: "Failed to create product", error: error });
                    }
                    
                    // Retrieve the newly inserted product data
                    const data = results[0];
                    connection.end();
                    
                    // Respond with success message and data
                    return res.json({ status: "ok", message: "ສ້າງສຳເລັດ", data: data });
                });
            } else {
                return res.json({ message: "Please upload a product image" });
            }
        } catch (error) {
            return res.json({ message: error.message });
        }
    }
    
    static async deleteProduct(req, res) {
        try {
            const connection = connectToMySQL();
            const { Product_ID } = req.params;
            console.log(Product_ID);
            if (!Product_ID) {
                return res.json({ message: "Please provide the Product ID" });
            }
            
            // SQL query to delete a product
            const deleteProductQuery = 'DELETE FROM tb_products WHERE Product_ID = ?';
            
            // Execute the delete query
            connection.query(deleteProductQuery, [Product_ID], (error, results) => {
                if (error) {
                    return res.json({ message: "Failed to delete product", error: error });
                }
                
                // Check if any rows were affected (product deleted)
                if (results.affectedRows === 0) {
                    return res.json({ message: "Product not found" });
                }
                
                connection.end();
                return res.json({ status: "ok", message: "Product deleted successfully" });
            });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }
    
    static async getAllProducts(req, res) {
        try {
            const connection = connectToMySQL();
            const getAllProductsQuery = 
            'SELECT p.* ,pt.Product_Type_Name FROM tb_products AS p LEFT JOIN tb_products_type AS pt ON p.Product_Type_ID = pt.Product_Type_ID ORDER BY RAND()';
            
            // Execute query to get all products
            connection.query(getAllProductsQuery, (error, results) => {
                if (error) {
                    return res.json({ message: "Failed to fetch products", error: error });
                }
                
                connection.end();
                return res.json({ status: "ok", message: "All products fetched successfully", data: results });
            });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }

    static async updateProduct(req, res) {
        try {
            const connection = connectToMySQL();
            const { Product_ID } = req.params;
            const { Product_Type_ID, Product_Name, Description, Price, ProductQty, Promotion, Unit } = req.body;
            const Profile_img = req.file ? req.file.path : null;

            // if ( !Product_Type_ID || !Product_Name || !Description || !Price || !Price || !ProductQty || !Promotion || !Unit  ) {
            //     return res.json({ message: "ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຕ້ອງການອັບເດດ!" });
            // }

            let updateQuery = 'UPDATE tb_products SET Product_Type_ID=?, Product_Name=?, Description=?, Price=?, ProductQty=?, Promotion=?, Unit =? ';
            let queryParams = [Product_Type_ID, Product_Name, Description, Price, ProductQty, Promotion, Unit];

            if (Profile_img) {
                const result = await cloudinary.uploader.upload(Profile_img);
                const imageUrl = result.secure_url;
                updateQuery += ', Product_img = ?';
                queryParams.push(imageUrl);
            }

            updateQuery += ' WHERE Product_ID = ?';
            queryParams.push(Product_ID);

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
    static async getNewestProducts(req, res) {
        try {
            const connection = connectToMySQL();
            
            const getNewestProductsQuery = 'SELECT p.* ,pt.Product_Type_Name FROM tb_products AS p LEFT JOIN tb_products_type AS pt ON p.Product_Type_ID = pt.Product_Type_ID ORDER BY Product_ID DESC LIMIT 5';

            // Execute query to get the newest products
            connection.query(getNewestProductsQuery, (error, results) => {
                if (error) {
                    return res.json({ message: "Failed to fetch newest products", error: error });
                }

                connection.end();
                return res.json({ status: "ok", message: "Newest products fetched successfully", data: results });
            });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }

    static async getAllByTypeProducts(req, res) {
        try {
            const connection = connectToMySQL();
            const { Product_Type_ID } = req.params;
            const getAllProductsQuery = 
            `SELECT *  FROM tb_products WHERE Product_Type_ID =${Product_Type_ID}`;
            
            // Execute query to get all products
            connection.query(getAllProductsQuery, (error, results) => {
                if (error) {
                    return res.json({ message: "Failed to fetch products", error: error });
                }
                
                connection.end();
                return res.json({ status: "ok", message: "All products fetched successfully", data: results });
            });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }

    
}

module.exports = ProductController;
