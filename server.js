const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

let users = [];

let bookLoanId = 1;
let bookLoans = [];
let favorites = [];




// ---------------------- Users ----------------------

app.get('/users', (req, res) => {
  res.json(users);
});

app.post('/users/registrar', async (req, res) => {
  try {
    const existingUser = users.find(u => u.name === req.body.name);
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = {
      id: Date.now().toString(),
      name: req.body.name,
      password: hashedPassword
    };
    users.push(user);
    res.status(201).json({ success: true, message: "User created" });
  } catch (error) {
    res.status(500).json({ error: "User creation failed" });
  }
});

app.post('/users/login', async (req, res) => {
  const user = users.find(u => u.name === req.body.name);

  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  try {
    const passwordMatch = await bcrypt.compare(req.body.password, user.password);

    if (passwordMatch) {
      res.json({
        success: true,
        user: { id: user.id, name: user.name }
      });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------- Book Loans ----------------------

app.get('/loans', (req, res) => {
  res.json(bookLoans);
});

app.get('/loans/:id', (req, res) => {
  const loanId = req.params.id;
  const loan = bookLoans.find(l => l.id === loanId);

  if (!loan) {
    return res.status(404).json({ error: 'Loan not found' });
  }

  res.json(loan);
});

app.post('/loans/add', (req, res) => {
  try {
    if (bookLoans.length === 0) {
      bookLoanId = 1;
    }

    const newLoan = {
      id: bookLoanId.toString(),
      bookTitle: req.body.bookTitle,
      image: req.body.image,
      description: req.body.description,
      price: req.body.price,
    };

    bookLoans.push(newLoan);
    bookLoanId++;

    res.status(201).json({ success: true, message: 'Book loan added' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to add loan' });
  }
});

app.delete('/loans/delete/:id', (req, res) => {
  const loanId = req.params.id;
  const index = bookLoans.findIndex(l => l.id === loanId);

  if (index === -1) {
    return res.status(404).json({ error: 'Loan not found' });
  }

  bookLoans.splice(index, 1);
  res.json({ success: true, message: 'Book loan deleted' });
});


// ---------------------- favorites books ----------------------


app.get('/favorites', (req, res) => {
  res.json(favorites);
});

app.post('/favorites/add', (req, res) => {
  const { bookTitle, image, description, price } = req.body;

  const exists = favorites.find(fav => fav.bookTitle === bookTitle);
  if (exists) {
    return res.status(409).json({ error: 'Book already in favorites' });
  }

  const favorite = {
    id: Date.now().toString(),
    bookTitle,
    image,
    description,
    price,
  };
  favorites.push(favorite);
  res.status(201).json({ success: true, message: 'Added to favorites' });
});

app.delete('/favorites/delete/:title', (req, res) => {
  const { title } = req.params;
  const index = favorites.findIndex(f => f.bookTitle === title);
  if (index === -1) {
    return res.status(404).json({ error: 'Favorite not found' });
  }
  favorites.splice(index, 1);
  res.json({ success: true, message: 'Removed from favorites' });
});


app.delete('/favorites/delete/:id', (req, res) => {
  const favoritesId = req.params.id;
  const index = favorites.findIndex(l => l.id === favoritesId);

  if (index === -1) {
    return res.status(404).json({ error: 'Loan not found' });
  }

  favorites.splice(index, 1);
  res.json({ success: true, message: 'Book loan deleted' });
});





// ---------------------- Server ----------------------

const PORT = process.env.PORT || 3470;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

setInterval(() => { }, 1000); // Keeps server awake (for some platforms)
app.delete('/favorites/delete-by-title/:title', (req, res) => {
  const bookTitle = decodeURIComponent(req.params.title);
  const index = favorites.findIndex(f => f.bookTitle === bookTitle);

  if (index === -1) {
    return res.status(404).json({ error: 'Favorite not found' });
  }

  favorites.splice(index, 1);
  res.json({ success: true, message: 'Favorite deleted' });
});
