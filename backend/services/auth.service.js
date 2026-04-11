const prisma = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const ErrorResponse = require('../utils/errorResponse');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const registerUser = async (userData) => {
  const { fullName, email, phone, password, role } = userData;

  const userExists = await prisma.user.findUnique({ where: { email } });

  if (userExists) {
    throw new ErrorResponse('User already exists', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: role || 'user',
      // Automatically create a wallet for the new user at the exact same time
      wallet: {
        create: {} // Accepts defaults
      }
    }
  });

  const token = generateToken(user.id);

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    token
  };
};

const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ErrorResponse('Invalid credentials', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ErrorResponse('Invalid credentials', 401);
  }

  const token = generateToken(user.id);

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    token
  };
};

module.exports = {
  registerUser,
  loginUser,
};
