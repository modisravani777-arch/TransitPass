-- MySQL dump 10.13  Distrib 9.6.0, for macos26.3 (arm64)
--
-- Host: localhost    Database: transitpass
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `route_id` int NOT NULL,
  `pass_type_id` int NOT NULL,
  `start_date` date NOT NULL,
  `amount` decimal(8,2) NOT NULL,
  `status` enum('Pending','Approved','Rejected','Pass Issued') NOT NULL DEFAULT 'Pending',
  `payment_status` enum('Unpaid','Paid') NOT NULL DEFAULT 'Unpaid',
  `rejection_reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `route_id` (`route_id`),
  KEY `pass_type_id` (`pass_type_id`),
  CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`),
  CONSTRAINT `applications_ibfk_3` FOREIGN KEY (`pass_type_id`) REFERENCES `pass_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
INSERT INTO `applications` VALUES (1,2,1,1,'2026-09-25',450.00,'Pass Issued','Paid',NULL,'2026-09-21 14:38:37','2026-10-05 14:38:37'),(2,2,5,2,'2026-10-25',750.00,'Rejected','Unpaid','Document is blurry. Please upload a clear photo of your college ID.','2026-09-29 14:38:37','2026-10-05 14:38:37'),(3,2,2,2,'2026-10-10',750.00,'Pending','Paid',NULL,'2026-10-04 14:38:37','2026-10-05 14:38:37'),(4,3,1,1,'2026-09-30',450.00,'Pass Issued','Paid',NULL,'2026-09-26 14:38:37','2026-10-05 14:38:37'),(5,4,3,2,'2026-08-26',750.00,'Pass Issued','Paid',NULL,'2026-08-18 14:38:37','2026-10-05 14:38:37'),(6,5,5,3,'2026-07-17',1900.00,'Pass Issued','Paid',NULL,'2026-07-09 14:38:37','2026-10-05 14:38:37'),(7,6,1,2,'2026-10-03',750.00,'Pass Issued','Paid',NULL,'2026-09-30 14:38:37','2026-10-05 14:38:37'),(8,7,2,1,'2026-10-08',450.00,'Rejected','Paid','photo is blur','2026-10-03 14:38:37','2026-11-17 17:16:00'),(9,8,4,1,'2026-10-13',450.00,'Approved','Unpaid',NULL,'2026-10-04 14:38:37','2026-11-17 16:47:54'),(10,9,6,3,'2026-06-07',1900.00,'Pass Issued','Paid',NULL,'2026-05-30 14:38:37','2026-10-05 14:38:37'),(11,4,1,1,'2026-10-17',450.00,'Approved','Unpaid',NULL,'2026-10-02 14:38:37','2026-10-05 14:38:37'),(12,3,3,2,'2026-07-22',750.00,'Pass Issued','Paid',NULL,'2026-07-15 14:38:37','2026-10-05 14:38:37'),(14,2,1,1,'2026-11-18',450.00,'Pass Issued','Paid',NULL,'2026-11-18 06:49:21','2026-11-18 06:49:57'),(15,10,1,2,'2026-11-18',750.00,'Pass Issued','Paid',NULL,'2026-11-18 07:02:43','2026-11-18 07:03:33');
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bus_passes`
--

DROP TABLE IF EXISTS `bus_passes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bus_passes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `application_id` int NOT NULL,
  `user_id` int NOT NULL,
  `pass_number` varchar(30) NOT NULL,
  `valid_from` date NOT NULL,
  `valid_until` date NOT NULL,
  `issued_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `application_id` (`application_id`),
  UNIQUE KEY `pass_number` (`pass_number`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `bus_passes_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`),
  CONSTRAINT `bus_passes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bus_passes`
--

LOCK TABLES `bus_passes` WRITE;
/*!40000 ALTER TABLE `bus_passes` DISABLE KEYS */;
INSERT INTO `bus_passes` VALUES (1,1,2,'TP-2026-100001','2026-09-25','2026-10-24','2026-10-05 14:38:37'),(2,4,3,'TP-2026-100002','2026-09-30','2026-10-29','2026-10-05 14:38:37'),(3,5,4,'TP-2026-100003','2026-08-26','2026-09-24','2026-10-05 14:38:37'),(4,6,5,'TP-2026-100004','2026-07-17','2026-10-14','2026-10-05 14:38:37'),(5,7,6,'TP-2026-100005','2026-10-03','2026-11-01','2026-10-05 14:38:37'),(6,10,9,'TP-2026-100006','2026-06-07','2026-09-04','2026-10-05 14:38:37'),(7,12,3,'TP-2026-100007','2026-07-22','2026-08-20','2026-10-05 14:38:37'),(8,14,2,'TP-2026-695739','2026-11-18','2026-12-17','2026-11-18 06:49:57'),(9,15,10,'TP-2026-685880','2026-11-18','2026-12-17','2026-11-18 07:03:33');
/*!40000 ALTER TABLE `bus_passes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `application_id` int NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `application_id` (`application_id`),
  CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
INSERT INTO `documents` VALUES (1,1,'sample-college-id.svg','college-id.svg','2026-10-05 14:38:37'),(2,2,'sample-college-id.svg','college-id.svg','2026-10-05 14:38:37'),(3,3,'sample-college-id.svg','college-id.svg','2026-10-05 14:38:37'),(4,4,'sample-college-id.svg','college-id.svg','2026-10-05 14:38:37'),(5,5,'sample-college-id.svg','college-id.svg','2026-10-05 14:38:37'),(6,6,'sample-college-id.svg','college-id.svg','2026-10-05 14:38:37'),(7,7,'sample-college-id.svg','college-id.svg','2026-10-05 14:38:37'),(8,8,'sample-college-id.svg','college-id.svg','2026-10-05 14:38:37'),(9,9,'sample-college-id.svg','college-id.svg','2026-10-05 14:38:37'),(10,10,'sample-college-id.svg','college-id.svg','2026-10-05 14:38:37'),(11,11,'sample-college-id.svg','college-id.svg','2026-10-05 14:38:37'),(12,12,'sample-college-id.svg','college-id.svg','2026-10-05 14:38:37'),(14,14,'1794984561422-902099.jpeg','img2.jpeg','2026-11-18 06:49:21'),(15,15,'1794985363511-699279.jpg','IMG-20261118-WA0009.jpg','2026-11-18 07:02:43');
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pass_types`
--

DROP TABLE IF EXISTS `pass_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pass_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  `duration_days` int NOT NULL,
  `price` decimal(8,2) NOT NULL,
  `description` varchar(255) NOT NULL DEFAULT '',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pass_types`
--

LOCK TABLES `pass_types` WRITE;
/*!40000 ALTER TABLE `pass_types` DISABLE KEYS */;
INSERT INTO `pass_types` VALUES (1,'Student Monthly',30,450.00,'Discounted monthly pass for students with a valid college ID.',1),(2,'General Monthly',30,750.00,'Unlimited rides on your route for 30 days.',1),(3,'Quarterly',90,1900.00,'Best value: three months of unlimited rides.',1),(4,'Weekly Express',7,199.00,'Short-term pass for visitors and interns.',1);
/*!40000 ALTER TABLE `pass_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `application_id` int NOT NULL,
  `user_id` int NOT NULL,
  `amount` decimal(8,2) NOT NULL,
  `method` enum('UPI','Card','Net Banking') NOT NULL,
  `transaction_id` varchar(40) NOT NULL,
  `status` enum('Success') NOT NULL DEFAULT 'Success',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  KEY `application_id` (`application_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`),
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,2,450.00,'UPI','TXN1700000007919','Success','2026-09-21 14:38:37'),(2,3,2,750.00,'Card','TXN1700000023757','Success','2026-10-04 14:38:37'),(3,4,3,450.00,'UPI','TXN1700000031676','Success','2026-09-26 14:38:37'),(4,5,4,750.00,'Net Banking','TXN1700000039595','Success','2026-08-18 14:38:37'),(5,6,5,1900.00,'UPI','TXN1700000047514','Success','2026-07-09 14:38:37'),(6,7,6,750.00,'Card','TXN1700000055433','Success','2026-09-30 14:38:37'),(7,8,7,450.00,'UPI','TXN1700000063352','Success','2026-10-03 14:38:37'),(8,10,9,1900.00,'Net Banking','TXN1700000079190','Success','2026-05-30 14:38:37'),(9,12,3,750.00,'Card','TXN1700000095028','Success','2026-07-15 14:38:37'),(11,14,2,450.00,'UPI','TXN1794984565097249','Success','2026-11-18 06:49:25'),(12,15,10,750.00,'UPI','TXN1794985372724820','Success','2026-11-18 07:02:52');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `routes`
--

DROP TABLE IF EXISTS `routes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `routes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `source` varchar(80) NOT NULL,
  `destination` varchar(80) NOT NULL,
  `fare` decimal(8,2) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `routes`
--

LOCK TABLES `routes` WRITE;
/*!40000 ALTER TABLE `routes` DISABLE KEYS */;
INSERT INTO `routes` VALUES (1,'Visakhapatnam → Madhurawada','Visakhapatnam','Madhurawada',30.00,1),(2,'Madhurawada → Visakhapatnam','Madhurawada','Visakhapatnam',30.00,1),(3,'Visakhapatnam → Gajuwaka','Visakhapatnam','Gajuwaka',35.00,1),(4,'Gajuwaka → Visakhapatnam','Gajuwaka','Visakhapatnam',35.00,1),(5,'Visakhapatnam → Sangivalasa','Visakhapatnam','Sangivalasa',40.00,1),(6,'Visakhapatnam → Anakapalle','Visakhapatnam','Anakapalle',45.00,1);
/*!40000 ALTER TABLE `routes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('student','admin') NOT NULL DEFAULT 'student',
  `photo` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Transit Admin','admin@transitpass.com','9000000001','$2a$10$y1CDjL5rVEecqrQlsIYiMu9tFL84.M3h/KiT7KujGR66LhqOxhrfW','admin',NULL,1,'2026-10-05 14:38:37'),(2,'Sai Kiran','student@transitpass.com','9848012345','$2a$10$Ter8NI3RMNSZ1knPLPSGgubtniYDwC5.YZKGrKxWK.IfsVB3Jlb6W','student','1794984991880-561190.jpg',1,'2026-10-05 14:38:37'),(3,'Ananya Rao','ananya.rao@example.com','9848023456','$2a$10$Ter8NI3RMNSZ1knPLPSGgubtniYDwC5.YZKGrKxWK.IfsVB3Jlb6W','student',NULL,1,'2026-10-05 14:38:37'),(4,'Harsha Vardhan','harsha.v@example.com','9848034567','$2a$10$Ter8NI3RMNSZ1knPLPSGgubtniYDwC5.YZKGrKxWK.IfsVB3Jlb6W','student',NULL,1,'2026-10-05 14:38:37'),(5,'Meghana Reddy','meghana.r@example.com','9848045678','$2a$10$Ter8NI3RMNSZ1knPLPSGgubtniYDwC5.YZKGrKxWK.IfsVB3Jlb6W','student',NULL,1,'2026-10-05 14:38:37'),(6,'Praneeth Kumar','praneeth.k@example.com','9848056789','$2a$10$Ter8NI3RMNSZ1knPLPSGgubtniYDwC5.YZKGrKxWK.IfsVB3Jlb6W','student',NULL,1,'2026-10-05 14:38:37'),(7,'Divya Lakshmi','divya.l@example.com','9848067890','$2a$10$Ter8NI3RMNSZ1knPLPSGgubtniYDwC5.YZKGrKxWK.IfsVB3Jlb6W','student',NULL,1,'2026-10-05 14:38:37'),(8,'Karthik Varma','karthik.v@example.com','9848078901','$2a$10$Ter8NI3RMNSZ1knPLPSGgubtniYDwC5.YZKGrKxWK.IfsVB3Jlb6W','student',NULL,1,'2026-10-05 14:38:37'),(9,'Sravani Devi','sravani.d@example.com','9848089012','$2a$10$Ter8NI3RMNSZ1knPLPSGgubtniYDwC5.YZKGrKxWK.IfsVB3Jlb6W','student',NULL,1,'2026-10-05 14:38:37'),(10,'Sai Ganesh','saiganesh@gmail.com','9999996363','$2a$10$.qUKWJUzWl17pMydN6KtHetxIKgjdiozOlaRqIku446qd8qiHdZeS','student',NULL,1,'2026-11-18 07:01:04');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-18 12:59:59
