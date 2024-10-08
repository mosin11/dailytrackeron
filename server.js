require('dotenv').config();
const express = require('express');
const connectDB = require('./config/dbConfig');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');
const notesRoutes = require('./routes/notesRoutes');
const plansRoutes = require('./routes/plansRoutes');
const helmet = require('helmet');

connectDB();

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json()); // Middleware to parse JSON
app.use('/api/users', userRoutes); // Mount user routes under `/api`

app.use('/api/notes', notesRoutes); // Apply routes under /api/notes
app.use('/api/plans', plansRoutes); // Apply routes under /api/notes



app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
