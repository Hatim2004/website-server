const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

let users = [];

let num = 1;

let Employees = [];




app.get('/users', (req, res) => {
  res.json(users);
});

app.post('/users/registrar', async (req, res) => {
  try {
    // Check if user already exists
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


app.get('/emp/:id', (req, res) => {
  const employeeId = req.params.id;
  const employee = Employees.find(e => e.id === employeeId);

  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  res.json(employee);
});

app.delete('/emp/delete/:id', (req, res) => {
  const employeeId = req.params.id;
  const index = Employees.findIndex(e => e.id === employeeId);

  if (index === -1) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  Employees.splice(index, 1); // Remove employee from array
  res.json({ success: true, message: 'Employee deleted' });
});



app.post('/emp/add', async (req, res) => {
  try {
    if (Employees.length === 0) {
      num = 1
    }
    const Employe = {
      id: num.toString(),
      FirstName: req.body.FirstName,
      LastName: req.body.LastName,
      Email: req.body.Email,
      Phone: req.body.Phone
    };
    Employees.push(Employe);
    res.status(201).send()
    num++;
  } catch (error) {
    res.status(400).send()
  }
})

app.get('/emp', async (req, res) => {
  res.json(Employees);
})

app.post('/users/login', async (req, res) => {
  // Fix: Use === for comparison instead of = (assignment)
  const user = users.find(u => u.name === req.body.name);

  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  try {
    const passwordMatch = await bcrypt.compare(req.body.password, user.password);

    if (passwordMatch) {
      // Return success response with user info
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

app.listen(3470, () => {
  console.log('Server running on http://localhost:3470');
});

setInterval(() => { }, 1000);
