const express=require('express');
const app = express.Router();

const auth = require('../modules/auth/auth');
const playlist = require('../modules/playlist/playlist');

app.all('*', auth.authenticateJWT)

app.get('/playlists', playlist.getMyLists);
app.post('/playlist', playlist.createNewList);
app.patch('/playlist', playlist.updateList);

module.exports = app;