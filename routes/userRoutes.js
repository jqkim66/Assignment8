const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = (app) => {
  // POST: Create User
  app.post('/user/create', async (req, res) => {
    try {
      const { fullName, email, password } = req.body;

      // Validations
      if (!fullName || fullName.length < 3) return res.status(400).send({ message: "Invalid full name, must be at least 3 characters" });

      // Email validation
      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      if (!email || !emailRegex.test(email)) return res.status(400).send({ message: "Invalid email" });

      // Strong password validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!password || !passwordRegex.test(password)) {
        return res.status(400).send({
          message: "Password must be at least 8 characters, include at least one uppercase letter, one lowercase letter, one number and one special character"
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        fullName,
        email,
        password: hashedPassword
      });

      await newUser.save();

      res.status(201).send({ message: "User created successfully!" });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });


  // PUT: Update User
  app.put('/user/edit', async (req, res) => {
    try {
      const { email, fullName, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) return res.status(404).send({ message: "User not found" });

      // Full name validation
      if (fullName && fullName.length < 3) {
        return res.status(400).send({ message: "Invalid full name" });
      }

      // Strong password validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (password && !passwordRegex.test(password)) {
        return res.status(400).send({
          message: "Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number and one special character"
        });
      }

      // Update full name if provided
      if (fullName) {
        user.fullName = fullName;
      }

      // Update password if provided and valid
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }

      await user.save();

      res.send({ message: "Updated successfully" });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });


  // DELETE: Delete User
  app.delete('/user/delete', async (req, res) => {
    try {
      const { email } = req.body;
      const result = await User.findOneAndDelete({ email });

      if (!result) return res.status(404).send({ message: "User not found" });

      res.send({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });

  // GET: Get All Users
  app.get('/user/getAll', async (req, res) => {
    try {
      const users = await User.find({});
      res.send(users);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });
};
