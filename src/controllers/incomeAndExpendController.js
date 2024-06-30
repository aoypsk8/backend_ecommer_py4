const connectToMySQL = require("../utils/db");

class incomeAndExpendController {
    static async getIncome(req, res) {
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
                            order_date: item.order_date,
                            total: 0,
                        };
                    }
                    const order = acc[item.order_id];
                    const totalProduct = item.Price * item.quantity;
                    order.total += totalProduct;
                    return acc;
                }, {});

                // Convert the map to an array
                const orders = Object.values(ordersMap);

                connection.end();
                return res.json({
                    status: "ok",
                    message: "get all income successfully",
                    data: orders,
                });
            });
        } catch (error) {
            return res.json({ status: "error", message: error.message });
        }
    }
    static async getOutcome(req, res) {
        try {
            const connection = connectToMySQL();
            const getAllImportsQuery = `SELECT Ip_ID,Date_received,Price_Total FROM tb_import_product`;

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

}

module.exports = incomeAndExpendController;
