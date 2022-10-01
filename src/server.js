import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());



// Route for testing app
app.get('/status', (req, res) => {
    res.send('ok');
    return;
});

app.listen(process.env.PORT, () => console.log(`Listening to PORT ${process.env.PORT}`));