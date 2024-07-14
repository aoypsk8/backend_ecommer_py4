const connectToMySQL = require('../utils/db');
const cloudinary = require('../utils/couldinary');
const SaleController = require('./saleController');
class OrderController {
    static async createOrder(req, res) {
        try {
            const connection = connectToMySQL();
            const { Cus_ID, Product, Location, phone } = req.body;
            const ImagePay = req.file ? req.file.path : null;
            // Parse Product from string to array of objects
            const parsedProduct = JSON.parse(Product);
            // Check if parsedProduct is an array
            if (!Array.isArray(parsedProduct)) {
                return res.json({ message: "Products should be provided as an array." });
            }
            // Validation checks for required fields
            if (!Cus_ID || !Location || !phone) {
                return res.json({ message: "Please enter all required data!" });
            }
            // SQL query to insert a new order
            const insertOrderQuery = `INSERT INTO orders (Cus_ID, status) VALUES (?, ?)`;
            if (ImagePay) {
                const result = await cloudinary.uploader.upload(ImagePay);
                const imageUrl = result.secure_url;
                const status = false;

                connection.query(insertOrderQuery, [Cus_ID, status], async (error, result) => {
                    if (error) {
                        return res.json({ message: "Failed to create order", error });
                    }
                    const orderId = result.insertId;
                    // Mapping products to orderItems format
                    const orderItems = parsedProduct.map(product => [
                        orderId,
                        product.Product_ID,
                        product.quantity,
                        product.Price,
                        Location,
                        phone,
                        imageUrl || ""
                    ]);
                    console.log(orderItems);
                    const orderItemsQuery = 'INSERT INTO order_items (order_id, Product_ID, quantity, Price, Location, phone, ImagePay) VALUES ?';
                    connection.query(orderItemsQuery, [orderItems], (error, results) => {
                        if (error) {
                            return res.json({ message: "Database error", error: error });
                        }
                        // Decrease product stock
                        const decreaseStockQueries = parsedProduct.map(product => {
                            return new Promise((resolve, reject) => {
                                const decreaseStockQuery = 'UPDATE tb_products SET ProductQty = ProductQty - ? WHERE Product_ID = ?';
                                connection.query(decreaseStockQuery, [product.quantity, product.Product_ID], (error, results) => {
                                    if (error) {
                                        return reject(error);
                                    }
                                    resolve(results);
                                });
                            });
                        });

                        Promise.all(decreaseStockQueries)
                            .then(() => {
                                connection.end();
                                return res.json({ status: "ok", message: "Order created successfully", data: results, orderId: orderId });
                            })
                            .catch(error => {
                                return res.json({ message: "Error updating product stock", error });
                            });
                    });
                });
            } else {
                return res.json({ message: "Please upload a product image" });
            }
        } catch (error) {
            return res.json({ message: error.message });
        }
    }

    static async updateOrder(req, res) {
        try {
            const connection = connectToMySQL();
            const { order_id } = req.params;
            const { cus_ID } = req.body;
            const status = true;
            const updateQuery = 'UPDATE orders SET status = ? WHERE order_id = ?';
            connection.query(updateQuery, [status, order_id], async (error, results) => {
                if (error) {
                    return res.json({ message: "Database error" });
                }
                if (results.affectedRows === 0) {
                    return res.json({ message: "order ID not found!" });
                }

                try {
                    console.log(`==${cus_ID}`);
                    await SaleController.createSale({ body: { order_id, cus_ID } });
                    connection.end();
                    return res.json({
                        status: "ok",
                        message: "Orders updated successfully and sale created",
                    });


                } catch (saleError) {
                    connection.end();
                    return res.json({ message: saleError.message });
                }
            });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }

    static async getAllOrders(req, res) {
        try {
            const connection = connectToMySQL();
            const getOrderDetailsQuery = `
                SELECT 
                    o.order_id,
                    o.Cus_ID,
                    o.order_date,
                    o.status,
                    oi.order_item_id,
                    oi.Product_ID,
                    oi.quantity,
                    oi.Price,
                    oi.Location,
                    oi.phone,
                    oi.ImagePay,
                    p.Product_Name,
                    p.Description,
                    p.Product_img,
                    c.First_name AS Cus_name
                FROM orders o
                JOIN order_items oi ON o.order_id = oi.order_id
                JOIN tb_products p ON oi.Product_ID = p.Product_ID
                JOIN tb_customers c ON o.Cus_ID = c.Cus_ID
                WHERE o.status = false
            `;

            connection.query(getOrderDetailsQuery, (error, results) => {
                if (error) {
                    connection.end();
                    return res.json({ message: "Database error", error });
                }

                if (results.length === 0) {
                    connection.end();
                    return res.json({ status: "ok", message: "No orders found" });
                }

                // Group results by order_id
                const ordersMap = results.reduce((acc, item) => {
                    if (!acc[item.order_id]) {
                        acc[item.order_id] = {
                            order_id: item.order_id,
                            Cus_name: item.Cus_name,
                            order_date: item.order_date,
                            status: item.status,
                            Location: item.Location,
                            phone: item.phone,
                            ImagePay: item.ImagePay,
                            total: 0,
                            products: []
                        };
                    }
                    const order = acc[item.order_id];
                    const totalProduct = item.Price * item.quantity;
                    order.total += totalProduct;
                    order.products.push({
                        Product_Name: item.Product_Name,
                        quantity: item.quantity,
                        Price: item.Price,
                        Description: item.Description,
                        Product_img: item.Product_img,
                        totalProduct: totalProduct
                    });
                    return acc;
                }, {});

                // Convert the map to an array
                const orders = Object.values(ordersMap);

                connection.end();
                return res.json({
                    status: "ok",
                    message: "Orders retrieved successfully",
                    data: orders,
                });
            });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }

    static async getOrderToday(req, res) {
        try {
            const connection = connectToMySQL();
            const today = new Date().toISOString().slice(0, 10); // Get today's date in 'YYYY-MM-DD' format
            const getOrderDetailsQuery = 'SELECT * FROM orders WHERE DATE(order_date) = ?';
            connection.query(getOrderDetailsQuery, [today], (error, results) => {
                if (error) {
                    connection.end();
                    return res.json({ message: "Database error", error });
                }
                connection.end();
                return res.json({
                    status: "ok",
                    message: "Orders retrieved successfully",
                    data: results,
                });
            })
        } catch (error) {
            return res.json({ message: error.message });
        }
    }

    static async getOrdersByCustomer(req, res) {
        try {
            const { Cus_ID } = req.params; // Get Cus_ID from the request parameters
            const connection = connectToMySQL();
            const getOrderDetailsQuery = `
                SELECT 
                    o.order_id,
                    o.Cus_ID,
                    o.order_date,
                    o.status,
                    oi.order_item_id,
                    oi.Product_ID,
                    oi.quantity,
                    oi.Price,
                    oi.Location,
                    oi.phone,
                    oi.ImagePay,
                    p.Product_Name,
                    p.Description,
                    p.Product_img,
                    c.First_name AS Cus_name
                FROM orders o
                JOIN order_items oi ON o.order_id = oi.order_id
                JOIN tb_products p ON oi.Product_ID = p.Product_ID
                JOIN tb_customers c ON o.Cus_ID = c.Cus_ID
                WHERE o.Cus_ID = ?
            `;

            connection.query(getOrderDetailsQuery, [Cus_ID], (error, results) => {
                if (error) {
                    connection.end();
                    return res.json({ message: "Database error", error });
                }

                if (results.length === 0) {
                    connection.end();
                    return res.json({ status: "ok", message: "No orders found" });
                }

                // Group results by order_id
                const ordersMap = results.reduce((acc, item) => {
                    if (!acc[item.order_id]) {
                        acc[item.order_id] = {
                            order_id: item.order_id,
                            Cus_name: item.Cus_name,
                            order_date: item.order_date,
                            status: item.status,
                            Location: item.Location,
                            phone: item.phone,
                            ImagePay: item.ImagePay,
                            total: 0,
                            products: []
                        };
                    }
                    const order = acc[item.order_id];
                    const totalProduct = item.Price * item.quantity;
                    order.total += totalProduct;
                    order.products.push({
                        Product_Name: item.Product_Name,
                        quantity: item.quantity,
                        Price: item.Price,
                        Description: item.Description,
                        Product_img: item.Product_img,
                        totalProduct: totalProduct
                    });
                    return acc;
                }, {});

                // Convert the map to an array
                const orders = Object.values(ordersMap);

                connection.end();
                return res.json({
                    status: "ok",
                    message: "Orders retrieved successfully",
                    data: orders,
                });
            });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }
    static async getOrderById(req, res) {
        try {
            const connection = connectToMySQL();
            const { order_id } = req.params; // Get order_id from the request parameters

            const getOrderDetailsQuery = `
                SELECT 
                    o.order_id,
                    o.Cus_ID,
                    o.order_date,
                    o.status,
                    oi.order_item_id,
                    oi.Product_ID,
                    oi.quantity,
                    oi.Price,
                    oi.Location,
                    oi.phone,
                    oi.ImagePay,
                    p.Product_Name,
                    p.Description,
                    p.Product_img,
                    c.First_name AS Cus_name
                FROM orders o
                JOIN order_items oi ON o.order_id = oi.order_id
                JOIN tb_products p ON oi.Product_ID = p.Product_ID
                JOIN tb_customers c ON o.Cus_ID = c.Cus_ID
                WHERE o.order_id = ?
            `;

            connection.query(getOrderDetailsQuery, [order_id], (error, results) => {
                if (error) {
                    connection.end();
                    return res.json({ message: "Database error", error });
                }

                if (results.length === 0) {
                    connection.end();
                    return res.json({ status: "ok", message: "Order not found" });
                }

                // Group results by order_id
                const ordersMap = results.reduce((acc, item) => {
                    if (!acc[item.order_id]) {
                        acc[item.order_id] = {
                            order_id: item.order_id,
                            Cus_name: item.Cus_name,
                            order_date: item.order_date,
                            status: item.status,
                            Location: item.Location,
                            phone: item.phone,
                            ImagePay: item.ImagePay,
                            total: 0,
                            products: []
                        };
                    }
                    const order = acc[item.order_id];
                    const totalProduct = item.Price * item.quantity;
                    order.total += totalProduct;
                    order.products.push({
                        Product_Name: item.Product_Name,
                        quantity: item.quantity,
                        Price: item.Price,
                        Description: item.Description,
                        Product_img: item.Product_img,
                        totalProduct: totalProduct
                    });
                    return acc;
                }, {});

                // Convert the map to an array
                const orders = Object.values(ordersMap);

                connection.end();
                return res.json({
                    status: "ok",
                    message: "Order retrieved successfully",
                    data: orders[0], // Since we are fetching a single order by order_id
                });
            });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }


}

module.exports = OrderController;
