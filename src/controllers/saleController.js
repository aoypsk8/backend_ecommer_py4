const connectToMySQL = require('../utils/db');
class SaleController {
    static async createSale(req) {
        return new Promise((resolve, reject) => {
            try {
                const connection = connectToMySQL();
                const { order_id, cus_ID } = req.body;
                console.log(cus_ID);
                if (!order_id) {
                    reject(new Error("Please enter all required data!"));
                }
                const insertSaleQuery = `INSERT INTO tb_sale_history (order_id, status,cus_ID) VALUES (?, ?,?)`;
                const status = true;
                connection.query(insertSaleQuery, [order_id, status, cus_ID], (error, results) => {
                    connection.end();
                    if (error) {
                        reject(new Error(`Failed to create sale${error}`));
                    } else {
                        resolve({ status: "ok", message: "Sale created successfully", data: results });
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    static async getSaleAll(req, res) {
        try {
            const connection = connectToMySQL();
            const getOrderDetailsQuery = `
                SELECT 
                    sh.sh_id,
                    sh.order_id,
                    sh.status,
                    sh.cus_ID,
                    sh.date,

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

                FROM tb_sale_history sh
                JOIN orders o ON o.order_id = sh.order_id
                JOIN order_items oi ON o.order_id = oi.order_id
                JOIN tb_products p ON oi.Product_ID = p.Product_ID
                JOIN tb_customers c ON o.Cus_ID = c.Cus_ID
            `;
            //order_items
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
}

module.exports = SaleController;
