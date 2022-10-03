import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import categoryRouter from './routes/category.router.js';
import gameRouter from './routes/game.router.js';
import costumerRouter from './routes/customer.router.js';
import rentalRouter from './routes/rental.router.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(categoryRouter);
app.use(gameRouter);
app.use(costumerRouter);
app.use(rentalRouter);

// Route for testing app
app.get('/status', (req, res) => {
    res.send('ok');
    return;
}); 

app.listen(process.env.PORT, () => console.log(`Listening to PORT ${process.env.PORT}`));