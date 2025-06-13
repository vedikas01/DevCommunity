const express = require('express');
const router = express.Router();
const { addComment, getCommentsForPost, deleteComment } = require('../controllers/commentController');
const auth = require('../middlewares/authMiddleware');

router.post('/:postId', auth, addComment);
router.get('/:postId', getCommentsForPost);
router.delete('/:id', auth, deleteComment);

module.exports = router;
