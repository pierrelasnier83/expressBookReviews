const express = require('express');
const axios = require('axios');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;
const public_users = express.Router();

const BASE_URL = 'http://localhost:5000';

// Tâche 7 : Inscription d'un nouvel utilisateur
public_users.post('/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Nom d'utilisateur et mot de passe requis." });
  }

  if (users.some(user => user.username === username)) {
    return res.status(404).json({ message: "Cet utilisateur existe déjà !" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "Utilisateur enregistré avec succès. Vous pouvez maintenant vous connecter." });
});

// Tâche 1 : Récupérer la liste de tous les livres (version simple, synchrone)
public_users.get('/', function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Tâche 2 : Détails d'un livre en fonction de l'ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.send(books[isbn]);
  } else {
    res.status(404).json({ message: "Livre non trouvé pour cet ISBN." });
  }
});

// Tâche 3 : Détails des livres en fonction de l'auteur
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const results = Object.keys(books)
    .filter(isbn => books[isbn].author === author)
    .reduce((acc, isbn) => ({ ...acc, [isbn]: books[isbn] }), {});

  if (Object.keys(results).length > 0) {
    res.send(results);
  } else {
    res.status(404).json({ message: "Aucun livre trouvé pour cet auteur." });
  }
});

// Tâche 4 : Détails des livres en fonction du titre
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const results = Object.keys(books)
    .filter(isbn => books[isbn].title === title)
    .reduce((acc, isbn) => ({ ...acc, [isbn]: books[isbn] }), {});

  if (Object.keys(results).length > 0) {
    res.send(results);
  } else {
    res.status(404).json({ message: "Aucun livre trouvé pour ce titre." });
  }
});

// Tâche 5 : Obtenir les critiques d'un livre
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.send(books[isbn].reviews);
  } else {
    res.status(404).json({ message: "Livre non trouvé pour cet ISBN." });
  }
});

// ---------------------------------------------------------------
// Tâche 11 : Implémentations avec Promesses / async-await + Axios
// Ces fonctions appellent les routes ci-dessus via HTTP (Axios)
// pour démontrer un traitement asynchrone côté client.
// ---------------------------------------------------------------

// Tâche 10 (async) : récupérer tous les livres avec une Promise
function getAllBooks() {
  return axios.get(`${BASE_URL}/`)
    .then((response) => {
      console.log("Tous les livres :", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des livres :", error.message);
    });
}

// Tâche 11 (async/await) : recherche par ISBN
async function getBookByISBN(isbn) {
  try {
    const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
    console.log(`Livre pour l'ISBN ${isbn} :`, response.data);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la recherche par ISBN :", error.message);
  }
}

// Tâche 12 (async/await) : recherche par auteur
async function getBooksByAuthor(author) {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    console.log(`Livres de l'auteur ${author} :`, response.data);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la recherche par auteur :", error.message);
  }
}

// Tâche 13 (async/await) : recherche par titre
async function getBooksByTitle(title) {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    console.log(`Livres avec le titre ${title} :`, response.data);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la recherche par titre :", error.message);
  }
}

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
