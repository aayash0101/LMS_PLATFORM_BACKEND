import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

dotenv.config();

connectDB();
const app = express();
const allowed_origin = process.env.CLIENT_URL;  
app.use(cors({
    origin:allowed_origin, 
    credentials: true
}))
app.get('/', (req, res) => {
    res.json({message:"API is running"})
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
})
