const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const subsRouter = express.Router();
const db = require('../db');
require('dotenv').config();

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_KEY);
