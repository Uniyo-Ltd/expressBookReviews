const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');



public_users.post("/register", (req,res) => {
    try {
        const { username, password } = req.body;

        // Check if username and password are provided
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required for registration." });
        }

        // Check if the username already exists
        if (users.find(user => user.username === username)) {
            return res.status(409).json({ message: "Username already exists. Choose a different username." });
        }

        // Add the new user to the users array
        users.push({ username, password });

        // Optionally, you can generate a token or handle further authentication logic here

        return res.status(201).json({ message: "User registered successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    try {
        const formattedBookList = JSON.stringify(books, null, 2);

        res.status(200).json({books: formattedBookList });
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal Server Error"});
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    try {
        const isbn = req.params.isbn;
        const bookDetails = getBookDetailsByISBN(isbn);

        if (bookDetails) {
            res.status(200).json({ book: bookDetails });
        } else {
            res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    try {
        const author = req.params.author;
        const booksByAuthor = getBooksByAuthor(author);

        if (booksByAuthor.length > 0) {
            res.status(200).json({ books: booksByAuthor });
        } else {
            res.status(404).json({ message: "No books found by the author" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    try {
        const title = req.params.title;
        const booksByTitle = getBooksByTitle(title);

        if (booksByTitle.length > 0) {
            res.status(200).json({ books: booksByTitle });
        } else {
            res.status(404).json({ message: "No books found with the title" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    try {
        const isbn = req.params.isbn;
        const bookReview = getBookReviewByISBN(isbn);

        if (bookReview) {
            res.status(200).json({ review: bookReview });
        } else {
            res.status(404).json({ message: "Review not found for the book" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

public_users.put("/review/:isbn", (req, res) => {
    try {
        const { isbn } = req.params;
        const { review } = req.query;
        const { username } = req.user; // Assuming you have set req.user during authentication

        if (!review) {
            return res.status(400).json({ message: "Review text is required." });
        }

        // Find the book based on ISBN
        const book = books[isbn];

        if (!book) {
            return res.status(404).json({ message: "Book not found." });
        }

        // Check if the user has already posted a review for this ISBN
        const userReviewIndex = book.reviews.findIndex(r => r.username === username);

        if (userReviewIndex !== -1) {
            // Modify the existing review
            book.reviews[userReviewIndex].text = review;
        } else {
            // Add a new review
            book.reviews.push({ username, text: review });
        }

        return res.status(200).json({ message: "Review added or modified successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    try {
      // Extract ISBN from request parameters
      const isbn = req.params.isbn;
  
      // Check if the user is logged in
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized - User not logged in" });
      }
  
      // Find the book in the books data based on the ISBN
      const book = books[isbn];
  
      // Check if the book exists
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
  
      // Check if the user has posted a review for this book
      if (!book.reviews || !book.reviews[req.user]) {
        return res.status(404).json({ message: "Review not found for the user and ISBN" });
      }
  
      // Delete the user's review for the book
      delete book.reviews[req.user];
  
      // Respond with a success message
      return res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
      console.error(error);
      // Respond with an internal server error message
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });

  public_users.get('/', async function (req, res) {
    try {
      // Make a request to fetch the list of books using Axios
      const response = await axios.get('http://localhost:5000/books');
  
      // Extract the book data from the response
      const books = response.data;
  
      // Format the book list
      const formattedBookList = JSON.stringify(books, null, 2);
  
      // Respond with the formatted book list
      return res.status(200).json({ books: formattedBookList });
    } catch (error) {
      console.error(error);
      
      // Respond with an internal server error message
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

  // Get book details based on ISBN using async-await with Axios
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
      const isbn = req.params.isbn;
  
      // Make a request to fetch the book details by ISBN using Axios
      const response = await axios.get(`http://localhost:5000/
      books/${isbn}`);
  
      // Extract the book data from the response
      const bookDetails = response.data;
  
      // Respond with the book details
      return res.status(200).json({ bookDetails });
    } catch (error) {
      console.error(error);
  
      // Respond with an internal server error message
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });


  // Assuming books API endpoint for getting details based on author
const booksApiBaseUrl = 'http://localhost:5000/books';

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  try {
    const author = req.params.author;

    // Make a GET request to the books API with the author parameter
    const response = await axios.get(`${booksApiBaseUrl}/author/${author}`);

    // Extract data from the response
    const bookDetails = response.data;

    res.status(200).json({ books: bookDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Assuming books API endpoint for getting details based on title
const booksApiBaseUrl = 'http://localhost:5000/books';

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  try {
    const title = req.params.title;

    // Make a GET request to the books API with the title parameter
    const response = await axios.get(`${booksApiBaseUrl}/title/${title}`);

    // Extract data from the response
    const bookDetails = response.data;

    res.status(200).json({ books: bookDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




module.exports.general = public_users;


