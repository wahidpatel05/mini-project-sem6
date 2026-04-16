const express = require("express");
const router = express.Router();
const { adminLogin, employeeLogin } = require("../controllers/authController");

router.post("/admin-login", adminLogin);
router.post("/employee-login", employeeLogin);

module.exports = router;
