
CREATE TABLE orders (
order_id INT AUTO_INCREMENT PRIMARY KEY,
Cus_ID INT,
order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
status VARCHAR(50)
);


CREATE TABLE order_items (
order_item_id INT AUTO_INCREMENT PRIMARY KEY,
order_id INT,
Product_ID INT,
quantity INT,
Unit_ID INT,
);








SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `data_dictionary`
--

-- --------------------------------------------------------

--
-- Table structure for table `tb_customers`
--

CREATE TABLE `tb_customers` (
  `Cus_ID` int(10) NOT NULL COMMENT 'ລະຫັດລູກຄ້າ',
  `First_name` varchar(50) NOT NULL COMMENT 'ຊື່',
  `Last_name` varchar(50) NOT NULL COMMENT 'ນາມສະກຸນ',
  `Phone_Number` int(20) NOT NULL COMMENT 'ເບີໂທລະສັບ',
  `Profile_img` varchar(150) NOT NULL COMMENT 'ຮູບພາບໂປຣ໌ໄຟລ໌',
  `Address` varchar(150) NOT NULL COMMENT 'ທີ່ຢູ່',
  `Password` varchar(10) NOT NULL COMMENT 'ລະຫັດຜ່ານ'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `tb_employee`
--

CREATE TABLE `tb_employee` (
  `Emp_ID` int(10) NOT NULL COMMENT 'ລະຫັດພະນັກງານ',
  `First_name` varchar(50) NOT NULL COMMENT 'ຊື່',
  `Last_name` varchar(30) NOT NULL COMMENT 'ນາມສະກຸນ',
  `gender` varchar(10) NOT NULL COMMENT 'ເພດ',
  `Roles` varchar(100) NOT NULL COMMENT 'ໜ້າທີ່',
  `Village` varchar(50) NOT NULL COMMENT 'ບ້ານ',
  `District` varchar(40) NOT NULL COMMENT 'ເມືອງ',
  `Province` varchar(50) NOT NULL COMMENT 'ແຂວງ',
  `Phone_Number` int(55) NOT NULL COMMENT 'ເບີໂທລະສັບ',
  `Profile_img` varchar(100) NOT NULL COMMENT '\r\nຮູບພາບໂປຣໄຟລ໌',
  `Password` int(11) NOT NULL COMMENT 'ລະຫັດຜ່ານ'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `tb_products`
--

CREATE TABLE `tb_products` (
  `Product_ID` int(20) NOT NULL COMMENT 'ລະຫັດສິນຄ້າ',
  `Product_Type_ID` int(30) NOT NULL COMMENT 'ລະຫັດປະເພດສິນຄ້າ',
  `Product_Name` varchar(50) NOT NULL COMMENT 'ຊື່ສິນຄ້າ',
  `Description` varchar(100) NOT NULL COMMENT 'ລາຍລະອຽດ',
  `Price` varchar(20) NOT NULL COMMENT 'ລາຄາ',
  `ProductQty` int(50) NOT NULL COMMENT 'ຈຳນວນ',
  `Promotion` varchar(50) NOT NULL COMMENT 'ໂປຣຫຼຸດລາຄາ',
  `Sold_Out` varchar(50) NOT NULL COMMENT 'ສິນຄ້າໝົດ',
  `Unit` int(20) NOT NULL COMMENT 'ຫົວໜ່ວຍ',
  `Product_img` varchar(50) NOT NULL COMMENT 'ຮູບສິນຄ້າ'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `tb_products_type`
--

CREATE TABLE `tb_products_type` (
  `Product_Type_ID` int(30) NOT NULL COMMENT 'ລະຫັດປະເພດສິນຄ້າ',
  `Product_Type_Name` varchar(50) NOT NULL COMMENT 'ຊື່ປະເພດສິນຄ້າ',
  `img` varchar(50) NOT NULL COMMENT 'ຮູບພາບ'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `tb_purchase_order` (
  `Order_ID` int(10) NOT NULL COMMENT 'ລະຫັດສັ່ງຊື້',
  `Order_Date` datetime NOT NULL COMMENT 'ວັນທີເວລາການສັ່ງຊື້',
  `OrderQty` int(50) NOT NULL COMMENT 'ຈຳນວນສັ່ງຊື້',
  `Order_Total` varchar(50) NOT NULL COMMENT 'ຍອດການສັ່ງຊື້',
  `Supplier_ID` int(10) NOT NULL COMMENT 'ລະຫັດຜູ້ສະໜອງ',
  `Status` int(20) NOT NULL COMMENT 'ສະຖານະ',
  `Emp_ID` int(10) NOT NULL COMMENT 'ລະຫັດພະນັກງານ'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tb_sale` (
  `Sale_ID` int(15) NOT NULL COMMENT 'ລະຫັດຂາຍສິນຄ້າ',
  `Emp_ID` int(10) NOT NULL COMMENT 'ລະຫັດພະນັກງານ',
  `Cus_ID` int(10) NOT NULL COMMENT 'ລະຫັດລູກຄ້າ',
  `Status` int(20) NOT NULL COMMENT 'ສະຖານະ',
  `Tel` int(15) NOT NULL COMMENT 'ເບີໂທຕິດຕໍ່',
  `Delivery_location` varchar(50) NOT NULL COMMENT 'ສະຖານທີ່ຈັດສົ່ງ',
  `Price_Total` varchar(50) NOT NULL COMMENT 'ລາຄາລວມທັງໝົດ',
  `Receipt_img` varchar(50) NOT NULL COMMENT 'ຮູບພາບການໂອນເງິນ'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tb_sale_detail` (
  `Sale_detail_ID` int(20) NOT NULL,
  `Sale_ID` int(20) NOT NULL,
  `Product_ID` int(10) NOT NULL,
  `Product_Name` varchar(50) NOT NULL,
  `Product_price` varchar(50) NOT NULL,
  `ProductQty` int(50) NOT NULL,
  `Product_total` varchar(50) NOT NULL,
  `Unit_ID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tb_sale_history` (
  `sh_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `status` tinyint(1) NOT NULL,
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`sh_id`),
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;





-- --------------------------------------------------------

--
-- Table structure for table `tb_received_product`
--
//////////////////////////////////////////////////////
CREATE TABLE `tb_received_product` (
  `Rec_ID` int(10) NOT NULL,
  `Emp_ID` int(10) NOT NULL,
  `Date_received` date NOT NULL,
  `ReceivedQty` int(50) NOT NULL,
  `Sub_Price` varchar(50) NOT NULL,
  `Price_Total` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `tb_sale`
--


-- --------------------------------------------------------

--
-- Table structure for table `tb_unit`
--

CREATE TABLE `tb_unit` (
  `Unit_ID` int(20) NOT NULL,
  `Unit_Name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tb_customers`
--
ALTER TABLE `tb_customers`
  ADD PRIMARY KEY (`Cus_ID`);

--
-- Indexes for table `tb_employee`
--
ALTER TABLE `tb_employee`
  ADD PRIMARY KEY (`Emp_ID`);

--
-- Indexes for table `tb_products`
--
ALTER TABLE `tb_products`
  ADD PRIMARY KEY (`Product_ID`);

--
-- Indexes for table `tb_products_type`
--
ALTER TABLE `tb_products_type`
  ADD PRIMARY KEY (`Product_Type_ID`);

--
-- Indexes for table `tb_purchase_order`
--
ALTER TABLE `tb_purchase_order`
  ADD PRIMARY KEY (`Order_ID`);

--
-- Indexes for table `tb_received_product`
--
ALTER TABLE `tb_received_product`
  ADD PRIMARY KEY (`Rec_ID`);

--
-- Indexes for table `tb_sale`
--
ALTER TABLE `tb_sale`
  ADD PRIMARY KEY (`Sale_ID`);

--
-- Indexes for table `tb_sale_detail`
--
ALTER TABLE `tb_sale_detail`
  ADD PRIMARY KEY (`Sale_detail_ID`);

--
-- Indexes for table `tb_unit`
--
ALTER TABLE `tb_unit`
  ADD PRIMARY KEY (`Unit_ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
