const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer'); 
const path = require('path'); 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage }); 

router.post('/register', upload.single('avatar'), registerUser); 
router.post('/login', loginUser);
router.post('/profile', authMiddleware, getProfile); 

module.exports = router;