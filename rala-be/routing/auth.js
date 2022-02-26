const express=require('express');
const app = express.Router();

const auth = require('../modules/auth/auth');

app.post('/check', auth.checkLogin);
app.get('/otp', auth.requestOTP);
app.post('/otp', auth.verifyOTP);


module.exports = app;