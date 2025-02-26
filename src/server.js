import express from 'express';
import { candidate } from './routes/candidate.js';
import { recruiter } from './routes/recruiter.js';
import setupSwagger from '../config/swaggerConfig.js'

const app = express();
const PORT = 3000;
app.use(express.json());

app.use('/candidate', candidate);
app.use('/recruiter', recruiter);

setupSwagger(app);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});