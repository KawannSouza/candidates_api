import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const router = Router();

//CRIAR CANDIDATO
router.post('/', async (req, res) => {
    
    await prisma.candidates.create({
        data: {
            name: req.body.name,
            age : req.body.age,
            email: req.body.email,
            mainSkill: req.body.mainSkill
        }
    })

    res.status(201).json({ message: 'Candidate created', data: req.body });
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

    await prisma.candidates.delete({
        where: {
            id: req.params.id
        }
    })

    res.status(200).json({ message: 'Candidate deleted', data: req.body });
})

console.log('Candidates route loaded');

export { router as candidates };