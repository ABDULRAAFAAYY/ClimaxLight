export const requireAdmin = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Basic ')) {
            return res.status(401).json({ message: 'Authentication required. Access denied.' });
        }

        // Extract token
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Invalid authentication header format.' });
        }

        // Decode credentials
        const decoded = Buffer.from(token, 'base64').toString('ascii');
        const [username, password] = decoded.split(':');

        const expectedUsername = process.env.ADMIN_USERNAME || 'CRST';
        const expectedPassword = process.env.ADMIN_PASSWORD || 'climaxshafay';

        if (username === expectedUsername && password === expectedPassword) {
            next();
        } else {
            return res.status(401).json({ message: 'Invalid username or password. Access denied.' });
        }
    } catch (error) {
        console.error('Authentication middleware error:', error);
        return res.status(500).json({ message: 'Internal server error during authentication.' });
    }
};
