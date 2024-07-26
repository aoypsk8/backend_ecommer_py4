const express = require('express');
const router = express.Router();
const AuthCustomerController = require('../controllers/CustomerController');
const EmployeeController = require('../controllers/employeeController');
const ProductTypeController = require('../controllers/productTypeController');
const UnitController = require('../controllers/unitController');
const ProductController = require('../controllers/productController');
const SupplierController = require('../controllers/supplierController');
const ImportProductController = require('../controllers/importController');
const OrderProductController = require('../controllers/orderController');
const SaleProductController = require('../controllers/saleController');
const CartProductController = require('../controllers/cartController');
const incomeAndExpendController = require('../controllers/incomeAndExpendController');
const upload = require('../utils/multer');


//======================= AuthCustomerController =============================
router.post("/auth/customer/loginUser",AuthCustomerController.loginCustomer); 
router.post("/auth/customer/registerUser",upload.single('image'),AuthCustomerController.registerCustomer); 
router.delete("/auth/customer/delete/:Cus_ID",AuthCustomerController.deleteCustomer); 
router.get("/auth/customer/getAll",AuthCustomerController.getAllCostomers); 
router.get('/auth/customer/:Cus_ID', AuthCustomerController.getCustomerByID);
router.put('/auth/customer/update/:Cus_ID', upload.single('image'), AuthCustomerController.updateCustomer); 

//======================= EmployeeController =============================
router.post("/auth/employee/loginUser",EmployeeController.loginEmployee); 
router.post("/auth/employee/registerUser",upload.single('image'),EmployeeController.registerEmployee); 
router.delete("/auth/employee/delete/:Emp_ID",EmployeeController.deleteEmployee); 
router.get("/auth/employee/getAll",EmployeeController.getAllEmployee); 
router.get('/auth/employee/:Emp_ID', EmployeeController.getEmployeeByID);
router.put('/auth/employee/update/:Emp_ID', upload.single('image'), EmployeeController.updateEmployee); 

//======================= ProductTypeController =============================
router.post("/productType/create",upload.single('image'),ProductTypeController.createType); 
router.put('/productType/update/:Product_Type_ID', upload.single('image'), ProductTypeController.updateType); 
router.delete("/productType/delete/:Product_Type_ID",ProductTypeController.deleteType); 
router.get("/productType/getAll",ProductTypeController.getAllType); 

//======================= UnitController =============================
router.post("/unit/create",upload.single('image'),UnitController.createUnit); 
router.put('/unit/update/:Unit_ID',upload.single('image'),UnitController.updateUnit); 
router.delete("/unit/delete",UnitController.deleteUnit); 
router.get("/unit/getAll",UnitController.getAllUnits); 

//======================= ProductController =============================
router.post("/product/create",upload.single('image'),ProductController.createProduct); 
router.delete("/product/delete/:Product_ID",ProductController.deleteProduct); 
router.get("/product/getAll",ProductController.getAllProducts); 
router.get("/product/getAllWhere",ProductController.getAllProductsWhere); 
router.get("/product/getNew",ProductController.getNewestProducts); 
router.get("/product/getProductByType/:Product_Type_ID",ProductController.getAllByTypeProducts); 
router.put('/product/update/:Product_ID', upload.single('image'), ProductController.updateProduct); 

//======================= SupplierController =============================
router.post("/supplier/create",SupplierController.createSupplier); 
router.delete("/supplier/delete",SupplierController.deleteSupplier); 
router.get("/supplier/getAll",SupplierController.getAllSupplier); 
router.put('/supplier/update/:Sl_ID',SupplierController.updateSupplier); 

//======================= IMport Product Controller =============================
router.post("/import/create",ImportProductController.createImport); 
router.delete("/import/delete",ImportProductController.deleteImport); 
router.get("/import/getAll",ImportProductController.getAllImport); 
router.put('/import/update/:Ip_ID',ImportProductController.updateImport); 

//======================= OrderController =============================
router.post("/order/create",upload.single('image'),OrderProductController.createOrder); 
router.post("/order/sellFrontOfStore",OrderProductController.createInStoreOrder); 
router.get("/order/getAll",OrderProductController.getAllOrders); 
router.get("/order/getOrderToday",OrderProductController.getOrderToday); 
router.put('/order/update/:order_id',OrderProductController.updateOrder); 
router.get('/orders/getByCustomer/:Cus_ID', OrderProductController.getOrdersByCustomer);
router.get('/orders/getByID/:order_id', OrderProductController.getOrderById);


//======================= SaleController =============================
router.post("/sale/create",SaleProductController.createSale); 
// router.get("/sale/getDetail",SaleProductController.getSaleDetails); 
router.get("/sale/getAll",SaleProductController.getSaleAll); 

//======================= CartController =============================
router.post("/cart/addToCart",CartProductController.addToCart); 
router.post("/cart/getAll",CartProductController.getCart); 
router.delete("/cart/delete",CartProductController.deleteCartItem); 
router.post("/cart/increaseQuantity",CartProductController.increaseQuantity); 
router.post("/cart/decreaseQuantity",CartProductController.decreaseQuantity); 
router.post("/cart/deleteProductInsideCart",CartProductController.deleteProductInsideCart); 


//======================= incomeAndExpendController =============================
router.get("/income/getAll",incomeAndExpendController.getIncome); 
router.get("/outcome/getAll",incomeAndExpendController.getOutcome); 
module.exports = router;
