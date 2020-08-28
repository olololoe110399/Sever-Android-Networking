const express = require("express");
const router = express.Router();
const controllerApiUser = require("../controllerApi/user");
const controllerApiProduct = require("../controllerApi/product");
const verify_token = require("../config/veryfi_token");
module.exports = router;

// User
router.post("/user/login", controllerApiUser.checkLogin);
router.post("/user/register", controllerApiUser.checkRegister);
router.get("/user/all", verify_token, controllerApiUser.getAllUser);
router.put("/user/logout", verify_token, controllerApiUser.logout);
router.get("/user/verify", controllerApiUser.verifyEmail);
router.post("/user/forget", controllerApiUser.forgotPassword);
router.post("/user/reset/:code", controllerApiUser.resetPassword);
router.post("/user/delete/:id", verify_token,controllerApiUser.deleteUser);
router.post("/user/detail/:id", verify_token,controllerApiUser.getUser);
router.post("/user/edit/:id", verify_token,controllerApiUser.editUser);

// Product

router.post("/product/add", verify_token,controllerApiProduct.addProduct);
router.post("/upload", verify_token,controllerApiProduct.uploadImage);
router.get("/product/all", verify_token,controllerApiProduct.getAllProduct);
router.post("/product/delete/:id", verify_token,controllerApiProduct.deleteProduct);
router.post("/product/edit/:id", verify_token,controllerApiProduct.editProduct);
router.get("/product/detail/:id", verify_token,controllerApiProduct.getProduct);
router.get("/product/find", verify_token,controllerApiProduct.getProductsByName);
