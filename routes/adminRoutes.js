const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, 'secretKey', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (admin) return res.status(400).send('Admin already exists');
    const newAdmin = new User({ username, password, role: 'admin' });
    await newAdmin.save();
    res.status(201).send('Admin registered successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/requests', authenticateAdmin, async (req, res) => {
  try {
    const groups = await Group.find({ status: 'pending' }).populate('users');
    res.send(groups);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.put('/complete/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const group = await Group.findById(id);
    if (!group) return res.status(404).send('Group not found');
    group.status = 'completed';
    await group.save();

    // Send email to users
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-password',
      },
    });

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: group.users.map(user => user.email).join(', '),
      subject: 'Group Completed',
      text: 'Your group has been completed. Please make the payment.',
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res.send('Group completed and email sent');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;