const express = require('express')
const router = express.Router()

const userController = require('../controllers/users')

router.post('/signup',userController.create_a_user)

router.post('/login',userController.login)

router.delete('/:userid',userController.delete_a_user)

module.exports = router