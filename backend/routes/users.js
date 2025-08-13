const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware');

router.get('/:id', userController.getUserProfileById);
router.post('/:id/follow', auth, userController.followUser);
router.post('/:id/unfollow', auth, userController.unfollowUser);
router.patch('/me/privacy', auth, userController.updatePrivacy);

module.exports = router;