const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth')
const userController = require("../controllers/users");

router.post("/signup", userController.create_a_user);
router.post("/login", userController.login);
router.delete("/:userid", userController.delete_a_user);
router.get("/getUsers", userController.getUsers);
router.get("/logout",auth,userController.logout)

module.exports = router;
