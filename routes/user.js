import express from 'express';
import bcryptjs from 'bcryptjs';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const router = express.Router();

// Generate a new JWT secret key
const generateJwtSecret = () => {
  return crypto.randomBytes(32).toString('hex'); // 256 bits (32 bytes)
};

const jwtSecret = generateJwtSecret();


router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Save the new user to the database
    await newUser.save();

    return res.status(201).json({ status: true, message: 'Record registered' });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User is not registered' });
  }

  const validPassword = await bcryptjs.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ message: 'Password is incorrect' });
  }

  try {
    // Generate JWT token
    const token = jwt.sign({ username: user.username }, jwtSecret, { expiresIn: '7d' }); // Token valid for 7 days

    // Set cookie with the JWT token
    res.cookie('token', token,{ httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // Max age in milliseconds (7 days)

    return res.status(200).json({ token });
  } catch (error) {
    console.error('Error generating JWT token:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/forgotpassword', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'User not registered' });
    }
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '5m' });

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mannethainfra@gmail.com',
        pass: 'wwpq lhol wiuf lail'
      }
    });

    var mailOptions = {
      from: 'mannethainfra@gmail.com',
      to: email,
      subject: 'Reset Password',
      text: `http://localhost:3000/resetPassword/${token}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return res.json({ message: 'Error sending mail' });
      } else {
        return res.json({ status: true, message: 'Email Sent' });
      }
    });

  } catch (err) {
    console.log(err);
  }
});

router.post('/resetPassword/:token', async (req, res) => {
  const token = req.params.token;
  const { password } = req.body;
  try {
    const decoded = jwt.verify(token, jwtSecret);
    console.log('Decoded Token:', decoded); // Debugging: log the decoded token
    const id = decoded.id;
    const hashedPassword = await bcryptjs.hash(password, 10);
    await User.findByIdAndUpdate({ _id: id }, { password: hashedPassword });
    return res.json({ status: true, message: 'Updated password' });
  } catch (err) {
    console.error('Token verification error:', err); // Improved error logging
    return res.status(403).json({ message: 'Invalid token' });
  }
});

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

router.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'Protected route', user: req.user });
});


router.get('/logout', (req, res) => {
  res.clearCookie('token', { path: '/' });
  return res.json({ status: true, message: 'Logged out successfully' });
});



export { router as UserRouter };
