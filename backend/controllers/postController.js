const Post = require('../models/Post');
const mongoose = require('mongoose');

const processVote = async (postId, userId, voteType) => {
  const post = await Post.findById(postId);
  if (!post) {
    const error = new Error('Post not found!');
    error.statusCode = 404;
    throw error;
  }

  const userIdObjectId = new mongoose.Types.ObjectId(userId);
  const hasUpvoted = post.upvotes.some(id => id.equals(userIdObjectId));
  const hasDownvoted = post.downvotes.some(id => id.equals(userIdObjectId));

  let update = {};

  if (voteType === 'upvote') {
    if (hasUpvoted) {
      update = { $pull: { upvotes: userIdObjectId } };
    } else {
      update = { $push: { upvotes: userIdObjectId } };
      if (hasDownvoted) {
        update.$pull = { ...update.$pull, downvotes: userIdObjectId };
      }
    }
  } else if (voteType === 'downvote') {
    if (hasDownvoted) {
      update = { $pull: { downvotes: userIdObjectId } };
    } else {
      update = { $push: { downvotes: userIdObjectId } };
      if (hasUpvoted) {
        update.$pull = { ...update.$pull, upvotes: userIdObjectId };
      }
    }
  } else {
    const error = new Error('Invalid vote type!');
    error.statusCode = 400;
    throw error;
  }

  const updatedPost = await Post.findByIdAndUpdate(postId, update, { new: true });
  return updatedPost;
};

exports.createPost = async (req, res) => {
  const newPost = new Post({
    title: req.body.title,
    contentMarkdown: req.body.contentMarkdown,
    author: req.user.id,
    tags: req.body.tags || []
  });
  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const { authorId } = req.query;
    let query = {};
    if (authorId) {
      if (!mongoose.Types.ObjectId.isValid(authorId)) {
        return res.status(400).json({ error: 'Author Id not found!' });
      }
      query.author = authorId;
    }

    const posts = await Post.find(query)
      .populate('author', 'username avatarUrl')
      .select('+upvotes +downvotes')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatarUrl')
      .select('+upvotes +downvotes');
    if (!post) {
      return res.status(404).json({ error: 'Post not found!' });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        err: 'Post not found!'
      });
    }
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully!' });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

exports.upvotePost = async (req, res) => {
  try {
    const updatedPost = await processVote(req.params.id, req.user.id, 'upvote');
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

exports.downvotePost = async (req, res) => {
  try {
    const updatedPost = await processVote(req.params.id, req.user.id, 'downvote');
    res.json(updatedPost);
  } catch (error) {
    console.error('Server error :', error); 
    res.status(500).json({ error: error.message });
  }
};