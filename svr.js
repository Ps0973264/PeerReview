import express from 'express';
import loginRouter from './ServerFiles/Login.js';
import *  as authenticateUser from './ServerFiles/UserAuthentication.js'
import http from 'http';

const app = express();
const server = http.createServer(app);

app.get('/authenticateUser', authenticateUser.verifyToken, (req, res) => {
    res.json(200)
});

app.use(loginRouter)
app.use(express.json())
app.use(express.static('client'));
server.listen(3000, () => { console.log('Server is running') });
