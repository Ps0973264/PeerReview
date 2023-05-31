import express from 'express';
import session from 'express-session'
import loginRouter from './ServerFiles/Login.js';
import ws from 'ws';
import http from 'http';


const app = express();
const server = http.createServer(app);




app.use(loginRouter)
app.use(express.json())
app.use(express.static('client'));
server.listen(3000, () => { console.log('Server is running') });
