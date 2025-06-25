const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes.js');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb+srv://sharma727485:qNivjIWwWfPwEbi6@cluster0.tq4jit1.mongodb.net/community-x?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log(' MongoDB connected successfully!'))
    .catch((err) => console.error(' MongoDB connection error:', err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/admin', adminRoutes);


app.get("/", (req, res) => {
    res.send("hello cuitie")
})

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});