const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth')
const userController = require("../controllers/users");

router.post("/signup", userController.create_a_user);
router.post("/login", userController.login);
router.delete("/:userid", userController.delete_a_user);
router.get("/getUsers", userController.getUsers);
<<<<<<< HEAD
router.get("/getMyTeams", userController.getMyTeams);
=======
router.get("/logout",auth,userController.logout)
>>>>>>> 875a39ad95268bb1642df8422cb076e5302a4bc8

module.exports = router;
