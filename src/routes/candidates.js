import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const router = Router();

//CRIAR CANDIDATO
router.post('/', async (req, res) => {
    try {
        const candidate = await prisma.candidates.create({
            data: {
                name: req.body.name,
                age : req.body.age,
                email: req.body.email,
                mainSkill: req.body.mainSkill
            }
        });

        res.status(201).json({ message: 'Candidate created', data: req.body });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error'});
    }
})

//LISTAR TODOS OS CANDIDATOS
router.get('/', async (req, res) => {
    
    const users = await prisma.candidates.findMany();

    res.status(200).json(users);
})

//LISTAR CANDIDATO POR SKILL
router.get('/skill/:skill', async (req, res) => {

    const users = await prisma.candidates.findMany({
        where: {
            mainSkill: req.params.skill
        }
    })

    res.status(200).json(users);
})

//EDITAR CANDIDATO POR ID
router.put('/:id', async (req, res) => {

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

    res.status(200).json({ message: 'Candidate updated', data: req.body});
});


//DELETAR CANDIDATO POR ID
router.delete('/:id', async (req, res) => {
    try {
        const candidate = await prisma.candidates.findUnique({
            where: { id: req.params.id }
        });

        if(!candidate) {
            res.status(404).json({ message: 'Candidate not found' });
        }

        await prisma.candidates.delete({ where: { id: req.params.id } });
        res.status(200).json({ message: 'Candidate deleted', data: req.body });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
})

console.log('Candidates route loaded');

export { router as candidates };