require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/users', require('./routes/users')); 

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    const PORT = process.env.PORT;
    app.listen(PORT, ()=>{
        console.log(`Server running on http://localhost:${process.env.PORT}`);
    }
)
}).catch(err=>{
    console.log(err);
});