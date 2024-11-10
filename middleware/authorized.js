function authoriz(requiredRole) {
  return (req, res, next) => {
    if (!req.session.user) {
      // If user is not logged in, redirect or send "Access Denied"
      return res.status(403).render("401");
    }

    if (req.session.user.role !== requiredRole) {
      // If user's role doesn't match requiredRole, deny access
      return res.status(403).render("401");
    }

    next();
  };
}

module.exports = authoriz;
