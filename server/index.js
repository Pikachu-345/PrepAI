require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db'); 
const { authLimiter, apiLimiter } = require('./middlewares/rateLimiter');

const app = express();
connectDB();

app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authLimiter);
app.use('/api/documents', apiLimiter);
app.use('/api/chat', apiLimiter);

app.get('/', (req, res) => {
  res.send('API is running!');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/documents', require('./routes/Document'));
app.use('/api/chat', require('./routes/chat'));

app.listen(5000, () => console.log(`Server started on port ${5000}`));