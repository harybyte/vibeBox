    const express = require('express');
    const mongoose = require('mongoose');
    require('dotenv').config(); // For environment variables

    const app = express();
    const PORT = process.env.PORT || 5000;

    app.use(express.json()); // For parsing JSON request bodies
    app.use(cors()); // For handling Cross-Origin Resource Sharing

    // Basic route
    app.get('/', (req, res) => {
        res.send('API is running');
    });

    // Connect to MongoDB (if using)
    mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('MongoDB Connected'))
        .catch(err => console.error(err));

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));