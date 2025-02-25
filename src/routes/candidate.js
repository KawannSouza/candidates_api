import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import authenticate from '../middlewares/authMiddleware.js';

const router = Router();
const prisma = new PrismaClient();
dotenv.config();

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('Connected to the database');
    } catch (error) {
        console.log('Error connecting to the database');
    }
}

connectDB();

/**
 * @swagger
 * /candidate/hello-world:
 *   get:
 *     summary: Testa a conexão com o servidor
 *     description: Retorna uma mensagem de teste para verificar se o servidor está respondendo.
 *     tags:
 *       - Test
 *     responses:
 *       200:
 *         description: Sucesso. Retorna uma mensagem de saudação.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hello World"
 */

//ROTA DE TESTE
router.get('/hello-world', async (req, res) => {
    res.status(200).json({ message: 'Hello World' });
})

/**
 * @swagger
 * /candidate/register:
 *   post:
 *     summary: Registra um novo usuário
 *     description: Cria um novo usuário no sistema, validando a senha, email e criando um token JWT.
 *     tags: [Candidate]
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
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Erro de validação, usuário já existe ou email já cadastrado
 *       500:
 *         description: Erro interno do servidor
 */

//REGISTRAR UM USUÁRIO
router.post('/register', async (req, res) => {
    try {
        const { name, age, username, email, password, confirmPassword } = req.body;
        const externalId = uuidv4();


        if (!name || !age || !username || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: 'Fill in all fields' });
        }
        
        if (password !== confirmPassword) {
            return res.status(401).json({ message: 'Passwords do not match' });
        }

        const userExists = await prisma.candidates.findFirst({ where: { username } });
        if (userExists) {
            return res.status(400).json({ message: 'User already taken' });
        }
        const emailExists = await prisma.candidates.findUnique({ where: { email } });
        if (emailExists) {
            return res.status(400).json({ message: 'Email already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const candidate = await prisma.candidates.create({
            data: {
                externalId: externalId,
                name,
                age,
                username,
                email,
                password: hashedPassword
            }
        });

        const token = jwt.sign({ id: candidate.externalId, email: candidate.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        res.status(201).json({
            message: 'Candidate registered successfully',
            candidate: { name: candidate.name, username: candidate.username, email: candidate.email },
            token
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @swagger
 * /candidate/login:
 *   post:
 *     summary: Faz login no sistema
 *     description: Faz login no sistema, validando a senha e criando um token JWT.
 *     tags: [Candidate]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Erro de validação, usuário já existe ou email já cadastrado
 *       500:
 *         description: Erro interno do servidor
 */

//FAZER LOGIN
router.post('/login', async (req, res) => {

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Fill in all fields' });
        }

        const candidate = await prisma.candidates.findUnique({ where: { email } });
        if (!candidate) {
            return res.status(401).json({ message: 'Candidate not found' });
        }

        const passwordMatch = await bcrypt.compare(password, candidate.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }
    
        const token = jwt.sign({ id: candidate.externalId, email: candidate.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            message: 'Candidate logged in successfully',
            candidate: { username: candidate.username, email: candidate.email },
            token
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @swagger
 * /candidate/:id/profile:
 *   post:
 *     summary: Atualiza o perfil de um candidato
 *     description: Atualiza o perfil de um candidato com informações adicionais.
 *     tags: [Candidate]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schooling:
 *                 type: string
 *               intituition:
 *                 type: string
 *               summary:
 *                 type: string
 *               mainSkill:
 *                 type: string
 *               otherSkills:    
 *                 type: string
 *               experience:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       500:
 *         description: Erro interno do servidor
 */

//ATUALIZA O PERFIL DO CANDIDATO COM INFORMAÇÕES ADICIONAIS
router.post('/:id/profile', authenticate, async (req, res) => {
    const { id } = req.params;
    const { schooling, instituition, summary, mainSkill, otherSkills, experience } = req.body;

    try {
        const existingCandidate = await prisma.candidatesProfile.findUnique({
            where: { userId: id }
        });

        let profile;

        if (existingCandidate) {
            profile = await prisma.candidatesProfile.update({
                where: { userId: id },
                data: { schooling, instituition, summary, mainSkill, otherSkills, experience }
            });
        }else {
            profile = await prisma.candidatesProfile.create({
                data: {
                    userId: id,
                    schooling,
                    instituition,
                    summary,
                    mainSkill,
                    otherSkills,
                    experience
                }
            });
        }

        res.status(200).json({ message: 'Candidate profile updated successfully', profile });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export { router as candidate };