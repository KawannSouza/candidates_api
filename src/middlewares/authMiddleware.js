import jwt from 'jsonwebtoken';

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if(!token) {
        return res.status(401).json({ message: 'Access denied. No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
}

const isRecruiter =  (req, res, next) => {
    if (!req.user) {
        return res.status(401),json({ message: 'Unauthorized' });
    }

    if (req.user.role !== 'RECRUITER') {
        return res.status(403).json({ message: 'Access forbidden: Recruiters only' });
    }

    next();
}

export default authenticate;
export { isRecruiter };