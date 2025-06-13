const express = require('express');
const router = express.Router();
const {createPost, getAllPosts, getPostById, deletePost, upvotePost, downvotePost} = require('../controllers/postController'); // Import new functions
const auth = require('../middlewares/authMiddleware');

router.post('/', auth, createPost);
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.delete('/:id', auth, deletePost);

router.post('/:id/upvote', auth, upvotePost); 
router.post('/:id/downvote', auth, downvotePost); 

module.exports = router;