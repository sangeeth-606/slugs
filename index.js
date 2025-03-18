import express from 'express';
import { resolve } from 'path';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const app = express();
const port = 3010;

app.use(express.static('static'));
app.use(express.json());

mongoose.connect('mongodb://localhost:8080//login', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
  email: String,
  passwordHash: String,
});

const User = mongoose.model('User', UserSchema);

app.get('/', (req, res) => {
  res.sendFile(resolve('pages/index.html'));
});

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = new User({ email, passwordHash });
  await newUser.save();

  res.status(201).json({ message: 'User registered successfully' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  res.status(200).json({ message: 'Login successful' });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
