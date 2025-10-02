const express = require("express");
const authController = require("../controllers/auth.controller");
const auth = require("../middlewares/auth");

const router = express.Router();

router.get("/me", auth, authController.me);

router.post("/register", authController.register);
router.post("/verify", authController.registerAndVerify);

router.post("/login", authController.login);
router.post("/logout", authController.logout);

router.post("/forgot_password", authController.forgotPassword);
router.post("/verify_forgot_password", authController.verifyResetPassword);
router.post("/confirm_new_password", authController.confirmNewPassword);
router.post("/resend_code", authController.resendVerificationCode);

module.exports = router;