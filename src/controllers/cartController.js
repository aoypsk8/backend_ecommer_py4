const connectToMySQL = require('../utils/db');

class CartController {
    static async addToCart(req, res) {
        try {
            const connection = connectToMySQL();
            const { cus_ID, Product_ID, amount } = req.body;
            if (!cus_ID || !Product_ID || amount == null) {
                connection.end();
                return res.json({ message: "Please enter all required data!" });
            }
            // Check if the cart exists for the customer
            const insertCheck = `SELECT cart_id FROM cart WHERE Cus_id = ${cus_ID}`;
            connection.query(insertCheck, (error, cartResults) => {
                if (error) {
                    connection.end();
                    return res.json({ message: "Failed to add item to cart", error });
                }
                // If the cart doesn't exist, create it
                if (cartResults.length == 0) {
                    console.log("BR ME");
                    const insertCartQuery = `INSERT INTO cart (Cus_id) VALUES (?)`;
                    connection.query(insertCartQuery, [cus_ID], (error, results) => {
                        if (error) {
                            connection.end();
                            return res.json({ message: "Failed to create cart", error });
                        }
                        // Get the newly created cart ID
                        const newCartIdQuery = `SELECT cart_id FROM cart WHERE Cus_id = ${cus_ID}`;
                        connection.query(newCartIdQuery, (error, newCartResults) => {
                            if (error) {
                                connection.end();
                                return res.json({ message: "Failed to add item to cart", error });
                            }
                            const cart_id = newCartResults[0].cart_id;
                            // Proceed to add or update the item in the cart
                            CartController.addOrUpdateCartItem(connection, cart_id, Product_ID, amount, res);
                        });
                    });
                } else {
                    const cart_id = cartResults[0].cart_id;
                    // Proceed to add or update the item in the cart
                    CartController.addOrUpdateCartItem(connection, cart_id, Product_ID, amount, res);
                }
            });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }

    static addOrUpdateCartItem(connection, cart_id, Product_ID, amount, res) {
        // Fetch the available stock for the product
        const stockCheckQuery = `SELECT ProductQty FROM tb_products WHERE Product_ID = ${Product_ID}`;
        connection.query(stockCheckQuery, (stockError, stockResults) => {
            if (stockError || stockResults.length == 0) {
                connection.end();
                return res.json({ message: "Failed to check product stock or product not found", stockError });
            }
            const availableStock = stockResults[0].ProductQty;
            // Check if the item is already in the cart
            const checkCartItemQuery = `SELECT amount FROM cart_items WHERE cart_id = ? AND Product_ID = ?`;
            connection.query(checkCartItemQuery, [cart_id, Product_ID], (checkError, checkResults) => {
                if (checkError) {
                    connection.end();
                    return res.json({ message: "Failed to check cart item", checkError });
                }
                if (checkResults.length > 0) {
                    // Item exists in the cart, update the quantity
                    const currentAmount = parseInt(checkResults[0].amount, 10);  // Ensure currentAmount is a number
                    const newAmount = currentAmount + parseInt(amount, 10);
                    console.log(amount);
                    console.log(availableStock);
                    console.log(currentAmount);
                    console.log(newAmount);

                    if (newAmount > availableStock) {
                        connection.end();
                        return res.json({ message: "ສິນຄ້າໃນຄັງບໍ່ພໍ" });
                    }
                    const updateQuery = `
                        UPDATE cart_items 
                        SET amount = ? 
                        WHERE cart_id = ? AND Product_ID = ?
                    `;
                    connection.query(updateQuery, [newAmount, cart_id, Product_ID], (updateError, updateResults) => {
                        connection.end();
                        if (updateError) {
                            return res.json({ message: "Failed to update cart item", updateError });
                        }
                        return res.json({ status: "ok", message: "Cart item updated successfully", data: updateResults });
                    });
                } else {
                    // Item does not exist in the cart, insert new item
                    if (amount > availableStock) {
                        connection.end();
                        return res.json({ message: "ສິນຄ້າໃນຄັງບໍ່ພໍ " });
                    }

                    const insertQuery = `INSERT INTO cart_items (cart_id, Product_ID, amount) VALUES (?, ?, ?)`;
                    connection.query(insertQuery, [cart_id, Product_ID, amount], (insertError, insertResults) => {
                        connection.end();
                        if (insertError) {
                            return res.json({ message: "Failed to add item to cart", insertError });
                        }
                        return res.json({ status: "ok", message: "Item added to cart successfully", data: insertResults });
                    });
                }
            });
        });
    }

    static async getCart(req, res) {
        try {
            const { Cus_id } = req.body;
            const connection = connectToMySQL();

            const getAllItemsQuery = `
                SELECT * FROM cart cr 
                JOIN cart_items cri ON cr.cart_id = cri.cart_id
                JOIN tb_products p ON cri.Product_ID = p.Product_ID
                WHERE cr.Cus_id = ${Cus_id}
            `;

            connection.query(getAllItemsQuery, (error, results) => {
                connection.end();
                if (error) {
                    return res.json({ message: "Failed to retrieve cart items", error });
                }
                console.log(results);

                // Initialize variables to calculate total cart amount
                const cartMap = {};

                // Group results by cart_id and calculate total cart amount for each cart
                results.forEach(item => {
                    if (!cartMap[item.cart_id]) {
                        cartMap[item.cart_id] = {
                            cart_id: item.cart_id,
                            Cus_id: item.Cus_id,
                            totalCartAmount: 0, // Initialize total cart amount for this cart
                            products: [],
                        };
                    }

                    // Calculate total product amount and accumulate to total cart amount
                    const totalProduct = parseFloat(item.Price) * parseInt(item.amount);
                    cartMap[item.cart_id].totalCartAmount += totalProduct;

                    // Push product details into products array
                    cartMap[item.cart_id].products.push({
                        Product_ID: item.Product_ID,
                        Product_Type_ID: item.Product_Type_ID,
                        Product_Name: item.Product_Name,
                        Description: item.Description,
                        Price: item.Price,
                        ProductQty: item.ProductQty,
                        Promotion: item.Promotion,
                        Unit: item.Unit,
                        Product_img: item.Product_img,
                        amount: item.amount,
                    });
                });

                // Convert the map to an array
                const cart = Object.values(cartMap);

                // Return response with data including cart array with totalCartAmount inside each cart
                return res.json({
                    status: "ok",
                    message: "Cart items retrieved successfully",
                    data: cart,
                });
            });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }



    static async deleteCartItem(req, res) {
        try {
            const connection = connectToMySQL();
            const { cus_ID } = req.body;
            console.log(cus_ID);
            //SELECT cart_id FROM cart WHERE Cus_id
            const deleteQuery = `SELECT cart_id FROM cart WHERE Cus_id = ${cus_ID}`;
            connection.query(deleteQuery, (er, ress) => {
                console.log(ress);
                if (er) {
                    connection.end();
                    return res.json({ status: "error", message: "Failed ", er });
                }
                const deleteQuery = `DELETE FROM cart WHERE cus_ID = ?`;
                connection.query(deleteQuery, [cus_ID], (error, results) => {
                    if (error) {
                        return res.json({ message: "Failed to delete cart item", error });
                    }
                    const deleteItemQuery = `DELETE FROM cart_items WHERE cart_id = ?`;
                    connection.query(deleteItemQuery, [ress[0].cart_id], (errorr, resultss) => {
                        connection.end();
                        if (errorr) {
                            return res.json({ message: "Failed to delete cart item", errorr });
                        }
                        return res.json({ status: "ok", message: "Cart deleted successfully", data: resultss });
                    });
                });

            });
        } catch (error) {
            return res.json({ message: error.message });
        }
    }
    static async increaseQuantity(req, res) {
        try {
            const connection = connectToMySQL();
            const { cus_ID, Product_ID } = req.body;
            // Fetch the cart_id
            const insertCheck = `SELECT cart_id FROM cart WHERE Cus_id = ${cus_ID}`;
            connection.query(insertCheck, (error, ress) => {
                if (error || ress.length == 0) {
                    connection.end();
                    return res.json({ status: "error", message: "Failed to find cart or cart not found", error });
                }
                // Fetch the available stock for the product
                const stockCheckQuery = `SELECT ProductQty FROM tb_products WHERE Product_ID = ${Product_ID}`;
                connection.query(stockCheckQuery, (stockError, stockResults) => {
                    if (stockError || stockResults.length == 0) {
                        connection.end();
                        return res.json({ status: "error", message: "Failed to check product stock or product not found", stockError });
                    }
                    const availableStock = stockResults[0].ProductQty;
                    // Fetch the current amount of the product in the cart
                    const currentAmountQuery = `SELECT amount FROM cart_items WHERE cart_id = ${ress[0].cart_id} AND Product_ID = ${Product_ID}`;
                    connection.query(currentAmountQuery, (amountError, amountResults) => {
                        if (amountError || amountResults.length == 0) {
                            connection.end();
                            return res.json({ status: "error", message: "Failed to check current amount or item not found in cart", amountError });
                        }
                        const currentAmount = amountResults[0].amount;
                        // Check if there is sufficient stock to increase the quantity
                        if (currentAmount + 1 > availableStock) {
                            connection.end();
                            return res.json({ status: "error", message: "Insufficient stock available" });
                        }
                        // Increase the quantity
                        const increaseQuery = `
                            UPDATE cart_items 
                            SET amount = amount + 1 
                            WHERE cart_id = ? AND Product_ID = ?
                        `;
                        connection.query(increaseQuery, [ress[0].cart_id, Product_ID], (updateError, updateResults) => {
                            connection.end();
                            if (updateError) {
                                return res.json({ status: "error", message: "Failed to increase quantity", updateError });
                            }
                            return res.json({ status: "ok", message: "Quantity increased successfully", data: updateResults });
                        });
                    });
                });
            });
        } catch (error) {
            return res.json({ status: "error", message: error.message });
        }
    }

    static async decreaseQuantity(req, res) {
        try {
            const connection = connectToMySQL();
            const { cus_ID, Product_ID } = req.body;
            const insertCheck = `SELECT cart_id FROM cart WHERE Cus_id = ${cus_ID}`;
            connection.query(insertCheck, (error, ress) => {
                const decreaseQuery = `
                UPDATE cart_items 
                SET amount = CASE 
                                WHEN amount > 0 THEN amount - 1 
                                ELSE 0 
                             END
                WHERE cart_id = ? AND Product_ID = ?
            `;
                connection.query(decreaseQuery, [ress[0].cart_id, Product_ID], (error, results) => {
                    if (error) {
                        connection.end();
                        return res.json({ status: "error", message: "Failed to decrease quantity", error });
                    }
                    // Check if amount is reduced to 0, then delete the item from cart_items
                    if (results.affectedRows > 0) {
                        const deleteQuery = `
                        DELETE FROM cart_items 
                        WHERE cart_id = ? AND Product_ID = ? AND amount = 0
                    `;
                        connection.query(deleteQuery, [ress[0].cart_id, Product_ID], (error, deleteResults) => {
                            connection.end();
                            if (error) {
                                return res.json({ status: "error", message: "Failed to delete item from cart", error });
                            }
                            return res.json({ status: "ok", message: "Quantity decreased and item removed if amount is 0", data: deleteResults });
                        });
                    } else {
                        connection.end();
                        return res.json({ status: "ok", message: "Quantity decreased", data: results });
                    }
                });
            });

        } catch (error) {
            return res.json({ status: "error", message: error.message });
        }
    }
    static async deleteProductInsideCart(req, res) {
        try {
            const connection = connectToMySQL();
            const { cus_ID, Product_ID } = req.body;
            const insertCheck = `SELECT cart_id FROM cart WHERE Cus_id = ${cus_ID}`;
            connection.query(insertCheck, (error, ress) => {
                const deleteQuery = `
                DELETE FROM cart_items 
                WHERE cart_id = ? AND Product_ID = ? 
            `;
                connection.query(deleteQuery, [ress[0].cart_id, Product_ID], (error, deleteResults) => {
                    connection.end();
                    if (error) {
                        return res.json({ status: "error", message: "Failed to delete item from cart", error });
                    }
                    return res.json({ status: "ok", message: "Quantity decreased and item removed if amount is 0", data: deleteResults });
                });
            });

        } catch (error) {
            return res.json({ status: "error", message: error.message });
        }
    }



}

module.exports = CartController;
