import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import initDB from './config/db.js';
import transactionRoutes from './routes/transactionRoutes.js'
dotenv.config()

const app = express()
app.use(express.json());

const PORT = process.env.PORT || 5000

app.use(cors({
  origin: [
    'http://localhost:8081',  // Expo web
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}))
// INITIALIZED DATABASE

app.use('/api/transactions', transactionRoutes);

initDB().then(() => {
   app.listen(PORT , ()=> 
      console.log('> Server is up and running on port : ' + PORT)
   )
});
