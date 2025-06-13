const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: 'Post' },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  contentMarkdown: String,
  parentComment: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);
