const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logged in" });
  }
  if (!authenticatedUser(username, password)) {
    return res
      .status(401)
      .json({ message: "Invalid username and/or password" });
  }

  const accessToken = jwt.sign(
    { username: authenticatedUser.username },
    "access",
    {
      expiresIn: 60 * 60,
    }
  );

  // Store token in session as expected by the middleware
  req.session.authorization = {
    accessToken,
  };
  req.session.username = username;
  return res.status(200).json({ message: "login successfully", username });
});

// Add a book review
// Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewText = req.query.review;
  const username = req.session.username;

  if (!username) {
    return res
      .status(401)
      .json({ message: "You must be logged in to post a review!" });
  }

  if (!reviewText) {
    return res
      .status(400)
      .json({ message: "Review text is required in the query" });
  }

  const book = books[isbn];
  if (!book) {
    return res
      .status(404)
      .json({ message: `Book not found for ISBN: ${isbn}` });
  }

  book.reviews[username] = reviewText; // Add or update review by the user

  return res.status(200).json({
    message: "Review posted/updated successfully",
    reviews: book.reviews,
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.username;

  if (!username) {
    return res
      .status(401)
      .json({ message: "You must be logged in to delete a review!" });
  }

  const book = books[isbn];
  if (!book) {
    return res
      .status(404)
      .json({ message: `Book not found for ISBN: ${isbn}` });
  }

  if (book.reviews && book.reviews[username]) {
    delete book.reviews[username];
    return res
      .status(200)
      .json({ message: "Review deleted successfully", reviews: book.reviews });
  } else {
    return res.status(404).json({ message: "Review not found for this user" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
