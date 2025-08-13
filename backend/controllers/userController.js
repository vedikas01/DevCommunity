const User = require('../models/User');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

exports.getUserProfileById = async (req, res) => {
    try {
        const userId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user Id!' });
        }

        const user = await User.findById(userId)
            .select('-password -email').populate('followers', 'username avatarUrl').populate('following', 'username avatarUrl');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found!' });
        }

        // Optional auth: decode JWT if provided to identify requester
        let requesterId;
        const authHeader = req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.replace('Bearer ', '');
            try {
                const verified = jwt.verify(token, process.env.JWT_SECRET);
                requesterId = verified.id;
            } catch (e) {
                // ignore invalid token, treat as unauthenticated
            }
        }

        const isOwner = requesterId && requesterId.toString() === userId.toString();
        const isFollowedByRequester = requesterId
            ? user.followers.some(f => f._id?.toString?.() === requesterId.toString())
            : false;
        // Owners should always be able to view their own profile, regardless of privacy setting
        const canViewFull = isOwner || !user.isPrivate || isFollowedByRequester;

        const userObj = user.toObject();
        if (!canViewFull) {
            userObj.bio = '';
            // For private profiles, only show counts, not the actual arrays
            userObj.followers = user.followers ? user.followers.length : 0;
            userObj.following = user.following ? user.following.length : 0;
        } else {
            // For public profiles or authorized users, ensure we have the populated arrays
            userObj.followers = user.followers || [];
            userObj.following = user.following || [];
        }

        res.json({
            success: true,
            user: userObj,
            canViewFull,
            isFollowing: isFollowedByRequester
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.followUser = async (req, res) => {
    try {
        const userIdToFollow = req.params.id;
        const currentUserId = req.user.id;

        if (userIdToFollow === currentUserId) {
            return res.status(400).json({ success: false, message: 'Cannot follow yourself!' });
        }

        if (!mongoose.Types.ObjectId.isValid(userIdToFollow)) {
            return res.status(400).json({ success: false, message: 'Invalid user Id!' });
        }

        const userToFollow = await User.findByIdAndUpdate(
            userIdToFollow,
            { $addToSet: { followers: currentUserId } },
            { new: true, runValidators: true }
        );

        if (!userToFollow) {
            return res.status(404).json({ success: false, message: 'User to follow not found!' });
        }

        const currentUser = await User.findByIdAndUpdate(
            currentUserId,
            { $addToSet: { following: userIdToFollow } },
            { new: true, runValidators: true }
        );

        if (!currentUser) {
            return res.status(404).json({ success: false, message: 'Current user not found.' });
        }

        res.json({
            success: true,
            message: `Successfully followed ${userToFollow.username}!`,
            userFollowersCount: userToFollow.followers.length,
            currentUserFollowingCount: currentUser.following.length,
            isFollowing : true
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.unfollowUser = async (req, res) => {
    try {
        const userIdToUnfollow = req.params.id;
        const currentUserId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(userIdToUnfollow)) {
            return res.status(400).json({ success: false, message: 'Invalid user Id!' });
        }

        const userToUnfollow = await User.findByIdAndUpdate(
            userIdToUnfollow,
            { $pull: { followers: currentUserId } },
            { new: true, runValidators: true }
        );

        if (!userToUnfollow) {
            return res.status(404).json({ success: false, message: 'User to unfollow not found!' });
        }

        const currentUser = await User.findByIdAndUpdate(
            currentUserId,
            { $pull: { following: userIdToUnfollow } },
            { new: true, runValidators: true }
        );

        if (!currentUser) {
            return res.status(404).json({ success: false, message: 'Current user not found.' });
        }

        res.json({
            success: true,
            message: `Successfully unfollowed ${userToUnfollow.username}.`,
            userFollowersCount: userToUnfollow.followers.length,
            currentUserFollowingCount: currentUser.following.length,
            isFollowing: false
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while unfollowing user.' });
    }
};

exports.updatePrivacy = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { isPrivate } = req.body;
        const updated = await User.findByIdAndUpdate(currentUserId, { isPrivate: !!isPrivate }, { new: true });
        if (!updated) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, isPrivate: updated.isPrivate });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};