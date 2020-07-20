const express = require("express");
const router = express.Router();

const teamController = require("../controllers/teams");

router.post("/create", teamController.createTeam);
router.post("/addUser", teamController.addUser);
router.get("/getTeams", teamController.getTeams);
router.post("/joinTeam", teamController.joinTeam);
module.exports = router;
