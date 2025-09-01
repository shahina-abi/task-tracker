import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : null;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = {
                id: decoded.id || decoded._id || decoded.userId,
            };

            return next();
        } catch (error) {
            return res.status(401).json({ message: "Invalid authentication token" });
        }
    }

    const fallbackUserId = req.headers["x-user-id"];

    if (fallbackUserId) {
        req.user = { id: String(fallbackUserId) };
        return next();
    }

    return res.status(401).json({ message: "Authentication required" });
};
