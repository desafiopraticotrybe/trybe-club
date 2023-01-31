// src/middlewares/adminValidations.js

const validateLoginUser = (req, res, next) => {
  const { user } = req.body;
  if (!user) return res.status(400).json({ message: 'user não informado.' });
  if (user !== 'admin') return res.status(401).json({ message: 'user inválido.' });
  next();
};

const validateLoginPassword = (req, res, next) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: 'password não informado.' });
  if (password !== 'xablau') return res.status(401).json({ message: 'password inválido.' });
  next();
};

module.exports = {
  validateLoginUser,
  validateLoginPassword,
};
