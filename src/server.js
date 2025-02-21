import express from 'express';
import { candidates } from './routes/candidates.js';
import { auth } from './routes/auth.js';
import setupSwagger from '../config/swaggerConfig.js'

const app = express();
const PORT = 3000;
app.use(express.json());

app.use('/candidates', candidates);
app.use('/auth', auth);

setupSwagger(app);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});