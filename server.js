import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = express();
app.use(express.json());

//CRIAR CANDIDATO
app.post('/candidates', async (req, res) => {
    
    await prisma.candidates.create({
        data: {
            name: req.body.name,
            age : req.body.age,
            email: req.body.email,
            mainSkill: req.body.mainSkill
        }
    })

    res.status(201).json({ message: 'Candidate created' }, req.body);
})

//LISTAR TODOS OS CANDIDATOS
app.get('/candidates', async (req, res) => {
    
    const users = await prisma.candidates.findMany();

    res.status(200).json(users);
})

//LISTAR CANDIDATO POR SKILL
app.get('/candidates/skill/:skill', async (req, res) => {

    const users = await prisma.candidates.findMany({
        where: {
            mainSkill: req.params.skill
        }
    })

    res.status(200).json(users);
})

//EDITAR CANDIDATO POR ID
app.put('/candidates/:id', async (req, res) => {

    await prisma.candidates.update({
        where: {
            id: req.params.id
        },
        data: {
            name: req.body.name,
            age : req.body.age,
            email: req.body.email,
            mainSkill: req.body.mainSkill
        }
    })

    res.status(200).json({ message: 'Candidate updated' }), req.body
});


//DELETAR CANDIDATO POR ID
app.delete('/candidates/:id', async (req, res) => {

    await prisma.candidates.delete({
        where: {
            id: req.params.id
        }
    })

    res.status(200).json({ message: 'Candidate deleted' }, req.params.id);
})

app.listen(4000);