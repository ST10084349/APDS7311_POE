import jwt from 'jsonwebtoken';

class CheckAuth {
 constructor(req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;
 }

 checkToken() {
    const token = this.req.headers['authorization'];

    if (!token) {
      return this.res.status(401).send('Access denied. No token provided.');
    }

    try {
      const decoded = jwt.decode(token, 'secret_this_should_be_longer_than_it_is');
      console.log(decoded);
      this.req.user = decoded;
      this.next();
    } catch (error) {
      console.log(token);
      return this.res.status(400).send('Invalid token.');
    }
 }
}

export default CheckAuth;