const ensureAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/login');
};

const forwardAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect('/tasks');
  }
  next();
};

module.exports = { ensureAuth, forwardAuth };
