const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatarUrl: { 
        type: String,
        default: '/uploads/default-avatar.jpg', 
    },
    bio: { 
        type: String,
        maxlength: 500,
        default: '',
    },
    followers: [{ 
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    following: [{ 
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
}, {
    timestamps: true, 
});

module.exports = mongoose.model('User', userSchema);