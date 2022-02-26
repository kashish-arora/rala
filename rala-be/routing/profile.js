const express=require('express');
const app = express.Router();

const auth = require('../modules/auth/auth');
const profile = require('../modules/profile/profile');

app.all('*', auth.authenticateJWT)
app.post('/name', profile.updateName);
app.get('/info', profile.getUserInfo);
app.patch('/info', profile.updateUserInfo);


module.exports = app;