export const isAdmin = (req, res, next) => {
    const user = req.user;

    if (user.role === "ADMIN") return next();

    return res.status(400).json({ msg: "You don't have the necessary permissions"})
}

export const isUser = (req, res, next) => {
    const user = req.user;

    if (user.role === "USER") return next();

    return res.status(400).json({ msg: "You don't have the necessary permissions"})
}