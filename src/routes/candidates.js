import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Candidates
 *     description: Operações para gerenciar candidatos
 */

/**
 * @swagger
 * /candidates:
 *   post:
 *     summary: Cria um novo candidato
 *     description: Registra um novo candidato no sistema.
 *     tags: [Candidates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               email:
 *                 type: string
 *               mainSkill:
 *                 type: string
 *     responses:
 *       201:
 *         description: Candidato criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */

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

/**
 * @swagger
 * /candidates:
 *   get:
 *     summary: Lista todos os candidatos
 *     description: Retorna todos os candidatos cadastrados no sistema.
 *     tags: [Candidates]
 *     responses:
 *       200:
 *         description: Lista de candidatos retornada com sucesso
 */

//LISTAR TODOS OS CANDIDATOS
router.get('/', async (req, res) => {
    
    const users = await prisma.candidates.findMany();

    res.status(200).json(users);
})

/**
 * @swagger
 * /candidates/skill/{skill}:
 *   get:
 *     summary: Lista candidatos por skill
 *     description: Retorna candidatos filtrados pela habilidade principal.
 *     tags: [Candidates]
 *     parameters:
 *       - name: skill
 *         in: path
 *         required: true
 *         description: A habilidade principal dos candidatos
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de candidatos retornada com sucesso
 */

//LISTAR CANDIDATO POR SKILL
router.get('/skill/:skill', async (req, res) => {

    const users = await prisma.candidates.findMany({
        where: {
            mainSkill: req.params.skill
        }
    })

    res.status(200).json(users);
})

/**
 * @swagger
 * /candidates/{id}:
 *   put:
 *     summary: Edita as informações de um candidato
 *     description: Atualiza as informações de um candidato baseado no ID fornecido.
 *     tags: [Candidates]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do candidato
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               email:
 *                 type: string
 *               mainSkill:
 *                 type: string
 *     responses:
 *       200:
 *         description: Candidato atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Candidato não encontrado
 */

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

/**
 * @swagger
 * /candidates/{id}:
 *   delete:
 *     summary: Deleta um candidato por ID
 *     description: Remove um candidato do sistema baseado no ID fornecido.
 *     tags: [Candidates]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do candidato
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Candidato deletado com sucesso
 *       404:
 *         description: Candidato não encontrado
 */

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