import jwt from 'jsonwebtoken';

export function generateUserToken(user) {
    const secretKey  = '9b2649b5b779f6b84f8d23a14ec7ad9f8adefc25f341d4d41b091849e0e4a3e9'
    const token = jwt.sign(user, secretKey)
    return token
}

export function verifyToken(req, res, next) {
    const secretKey  = '9b2649b5b779f6b84f8d23a14ec7ad9f8adefc25f341d4d41b091849e0e4a3e9'
    const token = req.header('Authorization');
  
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }
  
      req.user = user;
      next();
    });
}