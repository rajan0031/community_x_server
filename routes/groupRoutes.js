const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, 'secretKey', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

router.post('/', authenticateToken, async (req, res) => {
  const { name, subscription, members } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    const group = new Group({ name, users: [user._id], subscription, members });
    await group.save();
    res.status(201).send('Group created successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const groups = await Group.find().populate('users');
    res.send(groups);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;