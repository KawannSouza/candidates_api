import express from 'express';
import { candidates } from './routes/candidates.js';
import { auth } from './routes/auth.js';

const app = express();
app.use(express.json());

app.use('/candidates', candidates);
app.use('/auth', auth);

const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});