const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');
const regd_users = express.Router();

let users = [];

const SECRET_KEY = "clé_secrète_projet_final";

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Tâche 8 : Connexion en tant qu'utilisateur enregistré
regd_users.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Nom d'utilisateur et mot de passe requis." });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(208).json({ message: "Nom d'utilisateur ou mot de passe invalide." });
  }

  const accessToken = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

  req.session.authorization = { accessToken, username };
  return res.status(200).json({ message: "Connexion réussie.", token: accessToken });
});

// Tâche 9 : Ajouter ou modifier une critique de livre
regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization ? req.session.authorization.username : null;

  if (!username) {
    return res.status(403).json({ message: "Utilisateur non authentifié." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Livre non trouvé pour cet ISBN." });
  }

  if (!review) {
    return res.status(404).json({ message: "Le paramètre 'review' est requis." });
  }

  books[isbn].reviews[username] = review;
  return res.status(200).json({
    message: "Critique ajoutée/mise à jour avec succès.",
    reviews: books[isbn].reviews
  });
});

// Tâche 10 : Supprimer une critique de livre
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization ? req.session.authorization.username : null;

  if (!username) {
    return res.status(403).json({ message: "Utilisateur non authentifié." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Livre non trouvé pour cet ISBN." });
  }

  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Critique supprimée avec succès." });
  } else {
    return res.status(404).json({ message: "Aucune critique trouvée pour cet utilisateur." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
