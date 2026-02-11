import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import jwt from 'jsonwebtoken';
import moment from 'moment';
const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
    throw new Error('SECRET_KEY environment variable is not set');
}

const authMiddleware = (handler: NextApiHandler) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {

            if (!req.headers.authorization) {
                return res.status(401).json({ message: 'Authorization header is required' });
            }

            const token = req.headers.authorization.split(' ')[1];

            try {
                let user = jwt.verify(token, SECRET_KEY);
                if(moment.unix((user as any).exp).subtract(10, 'minute').isBefore(moment())){
                    const accessToken = jwt.sign({
                        userName  : (user as any).userName,
                        userId    : (user as any).userId,
                        permission: (user as any).permission
                    }, SECRET_KEY, { expiresIn: '1h' });
                    (req as any).userAccessToken = accessToken;
                }
                (req as any).user = user; 
                return handler(req, res);
            } catch (err) {
                // console.log("🚀 ~ return ~ err:", err)
                return res.status(401).json({ success: false, message: "User not authorized" });
            }

    };
};

export default authMiddleware;
