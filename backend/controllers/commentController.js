const Comment = require('../models/Comment');
const mongoose = require('mongoose');

exports.addComment = async (req, res) => {
  const { contentMarkdown, parentComment } = req.body;

  const newComment = new Comment({
    postId: req.params.postId,
    author: req.user.id,
    contentMarkdown,
    parentComment: parentComment || null
  });

  try{
  await newComment.save();
  const populatedComment = await newComment.populate('author', 'username avatarUrl');
  res.status(201).json(populatedComment);
  }catch(error){
  res.status(500).json({error : error.message});
}
};

exports.getCommentsForPost = async (req, res) => {
  try{
    const comments = await Comment.find({postId : req.params.postId}).populate('author', 'username avatarUrl');
    res.json(comments);
  }catch(error){
    res.status(500).json({
      error : error.message
    });
  }
};

exports.deleteComment = async(req,res)=>{
  try{
    const commentId = req.params.id;
    const comment = await Comment.findById(commentId);
    if(!comment){
      return res.status(404).json({
        error : 'Comment not found!'
      });
    }
    if(comment.author.toString()!==req.user.id){
      return res.status(403).json({
        error : 'Not authorized to delete this comment!'
      });
    }
    await comment.deleteOne();
    res.json({
      message : 'Comment deleted successfully!'
    });
    }catch(err){
      console.err('Error deleting this comment :', err);
      res.status(500).json({err : 'Server error'});
    }
}
