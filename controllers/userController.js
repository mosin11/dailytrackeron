const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
exports.createUser = async (req, res) => {
    try {
        const { name, password, email, phoneNumber } = req.body;
        const isVerified = true;
        // Check if email is provided
        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }  
        const existingUser = await User.findOne({ email });
       // console.log("existingUser",existingUser);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists.' });
        }
   
        const newUser = new User({ name, password, email, isVerified,phoneNumber });
        
        const savedUser =  await newUser.save();
        
        res.status(201).json({ message: 'User created successfully!' });
        logger.debug("User created successfully");
    } catch (error) {
        if (error.code === 11000) {
            // Duplicate key error
            res.status(400).json({ message: 'catch Email already exists.' });
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

exports.getUsers = async (req, res) => {
    try {
        const {password,email } = req.body;
      
        const existingUser = await User.findOne({ email });       
        if (!existingUser) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        const isPasswordValid = await existingUser.comparePassword(password);
       
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

         // Generate a JWT token
         const token = jwt.sign({ userId: existingUser._id,
                                  userName: existingUser.name,
                                  isVerified: existingUser.isVerified,
                                  phoneNumber: existingUser.phoneNumber
                                 }, 
                                  process.env.JWT_SECRET, {
            expiresIn: '24h',
        });

        logger.debug("Login successful")
        return res.status(200).json({
            message: 'Login successful',
            token: token,
            user: existingUser,
        });
        
    } catch (error) {
       
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, password, email, phoneNumber } = req.body;
        const updatedUser = await User.findByIdAndUpdate(id, { name, password, email, phoneNumber }, { new: true });
        res.status(200).json(updatedUser);
        logger.debug("user updated successfully successful")
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        logger.debug("User deleted successfully!")
        res.status(200).json({ message: 'User deleted successfully!' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        logger.info("enter getUserProfile");
        const userId = req.user.userId; 
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        logger.error("error in getUserProfile",error)
        res.status(500).json({ message: error.message });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        logger.info("enter in updateUserProfile");
        const userId = req.user.userId; 
        const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.json(updatedUser);
    } catch (error) {
        logger.error(error.message)
        res.status(500).json({ message: error.message });
    }
};
