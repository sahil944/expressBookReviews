const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    //write code to check is the username is valid
    let userswithsamename = users.filter((user)=>{
        return user.username === username
      });
      if(userswithsamename.length > 0){
        return true;
      } else {
        return false;
      }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    //write code to check if username and password match the one we have in records.
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
      });
      if(validusers.length > 0){
        return true;
      } else {
        return false;
      }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const review = req.body.review;
    const username = req.session.authorization['username'];
    const isbn = req.params.isbn;

    if (!isValid(username)) {
        return res.status(400).json({ message: "Invalid username" });
    }

    // Check if the user is authenticated (you may want to enhance this check)
    if (!authenticatedUser(username, "pwd123")) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    // Find the book by ISBN and add the review
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Remove existing review by the same user (if any)
    if(Object.values(book.reviews).length > 0){
        book.reviews = book.reviews.filter((e) => e.username !== username);
    }

    // Add the new review
    const newReview = {
        username: username,
        review: review,
    };

    Object.values(book.reviews).push(newReview);

    // Update the books array
    books[isbn] = book;

    return res.json({ message: "Review added successfully" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization['username'];
    const isbn = req.params.isbn;

    // Find the book by ISBN
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    } else {
        if (book.reviews.length > 0) {
            // Remove the review by the specified user
            if(Object.values(book.reviews).length > 0){
                book.reviews = book.reviews.filter((e) => e.username !== username);
            }

            // Update the books array
            books[isbn] = book;

            return res.json({ message: "Review deleted successfully" });
        } else {
            return res.status(405).json({ message: "Book has no reviews" });
        }
    }
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
