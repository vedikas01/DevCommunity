const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: String,
  contentMarkdown: String,
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  tags: [String],
  upvotes : [{type : Schema.Types.ObjectId, ref: 'User'}],
  downvotes : [{type : Schema.Types.ObjectId, ref: 'User'}],
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
