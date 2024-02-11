const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();



public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  //Write your code here
  try {
    const books = await getBooksPromise();
    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch books" });
  }
});

function getBooksPromise() {
    return new Promise((resolve, reject) => {
      if (books) {
        resolve(books);
      } else {
        reject(new Error('Failed to fetch books'));
      }
    });
}

async function getBookDetailsByISBNAsyncAwait(isbn) {
    try {
      // Look up book details from the local 'books' object
      const bookDetails = books[isbn];
      if (bookDetails) {
        return bookDetails;
      } else {
        throw new Error(`Book details not found for ISBN ${isbn}`);
      }
    } catch (error) {
      console.error(`Error fetching book details for ISBN ${isbn}:`, error.message);
      throw error;
    }
}
  

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    // Write your code here
    const isbn = req.params.isbn;
    try {
      const bookDetails = await getBookDetailsByISBNAsyncAwait(isbn);
  
      if (bookDetails) {
        return res.status(200).json(bookDetails);
      } else {
        return res.status(404).json({ message: "Book not found" });
      }
    } catch (error) {
      console.error(`Error fetching book details for ISBN ${isbn}:`, error.message);
      return res.status(500).json({ message: "Failed to fetch book details" });
    }
});

async function getBookDetailsByAuthorAsyncAwait(author) {
    try {
      // Look up book details from the local 'books' object
      const bookDetails = Object.values(books).filter(book => book.author === author);
      if (bookDetails) {
        return bookDetails;
      } else {
        throw new Error(`Book details not found for author ${author}`);
      }
    } catch (error) {
      console.error(`Error fetching book details for author ${author}:`, error.message);
      throw error;
    }
}

// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  //Write your code here
  const author = req.params.author;
  try {
    const bookDetails = await getBookDetailsByAuthorAsyncAwait(author);
    if (bookDetails) {
      return res.status(200).json(bookDetails);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    console.error(`Error fetching book details for author ${author}:`, error.message);
    return res.status(500).json({ message: "Failed to fetch book details" });
  }
});

async function getBookDetailsByTitleAsyncAwait(title) {
    try {
      // Look up book details from the local 'books' object
      const bookDetails = Object.values(books).filter(book => book.title === title);
      if (bookDetails) {
        return bookDetails;
      } else {
        throw new Error(`Book details not found for title ${title}`);
      }
    } catch (error) {
      console.error(`Error fetching book details for title ${title}:`, error.message);
      throw error;
    }
}

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  //Write your code here
  const title = req.params.title;
  try {
    const bookDetails = await getBookDetailsByTitleAsyncAwait(title);
    if (bookDetails) {
      return res.status(200).json(bookDetails);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    console.error(`Error fetching book details for title ${title}:`, error.message);
    return res.status(500).json({ message: "Failed to fetch book details" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book or reviews not found" });
  }
});


module.exports.general = public_users;
