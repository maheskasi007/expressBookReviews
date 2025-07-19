const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

public_users.post("/register", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  // const userExists = users.some((user) => user.username === username);
  if (!isValid(username)) {
    users.push({ username: username, password: password });
    return res
      .status(200)
      .json({ message: "User successfully registered. Now you can login" });
  } else {
    return res.status(404).json({ message: "User already exists" });
  }
});

// Get the book list available in the shop
public_users.get("/", (req, res) => {
  new Promise((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject("No books found");
    }
  })
    .then((bookList) => {
      res.status(200).json(bookList);
    })
    .catch((err) => {
      res.status(404).json({ message: err });
    });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found for ISBN " + isbn);
    }
  })
    .then((bookData) => {
      res.status(200).json(bookData);
    })
    .catch((err) => {
      res.status(404).json({ message: err });
    });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const authorName = req.params.author.toLowerCase();

  new Promise((resolve, reject) => {
    const results = Object.values(books).filter(
      (book) => book.author.toLowerCase() === authorName
    );
    if (results.length > 0) {
      resolve(results);
    } else {
      reject("No books found by author " + req.params.author);
    }
  })
    .then((matchedBooks) => {
      res.status(200).json(matchedBooks);
    })
    .catch((err) => {
      res.status(404).json({ message: err });
    });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const titleQuery = req.params.title.toLowerCase();

  new Promise((resolve, reject) => {
    const results = Object.values(books).filter(
      (book) => book.title.toLowerCase() === titleQuery
    );
    if (results.length > 0) {
      resolve(results);
    } else {
      reject("No books found with title " + req.params.title);
    }
  })
    .then((matchedBooks) => {
      res.status(200).json(matchedBooks);
    })
    .catch((err) => {
      res.status(404).json({ message: err });
    });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    res.send(book.reviews);
  } else {
    res.status(404).json({ message: "No Reviews found" });
  }
});

module.exports.general = public_users;
