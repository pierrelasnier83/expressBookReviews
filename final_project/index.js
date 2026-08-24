const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({
  secret: "clé_session_projet_final",
  resave: true,
  saveUninitialized: true
}));

// Middleware d'authentification pour toutes les routes sous /customer/auth/*
app.use("/customer/auth/*", function auth(req, res, next) {
  if (req.session.authorization) {
    const token = req.session.authorization['accessToken'];
    jwt.verify(token, "clé_secrète_projet_final", (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Utilisateur non authentifié." });
      } else {
        req.user = user;
        next();
      }
    });
  } else {
    return res.status(403).json({ message: "Vous n'êtes pas connecté(e)." });
  }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Le serveur est démarré sur le port ${PORT}`));
