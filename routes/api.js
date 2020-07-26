const express = require ('express');
const router = express.Router ();
const controllerApi=require('../controllerApi/user')
module.exports = router;

router.post("/login",controllerApi.checkLogin)
router.post("/register",controllerApi.checkRegister)