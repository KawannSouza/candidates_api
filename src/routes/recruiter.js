import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import authenticate from '../middlewares/authMiddleware.js';
import { isRecruiter } from '../middlewares/authMiddleware.js';

const router = Router();
const prisma = new PrismaClient();
dotenv.config();

/**
 * @swagger
 * /recruiter/hello-world:
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
});

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
 *               company:
 *                 type: String
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

//REGISTRAR-SE COMO RECRUTADOR
router.post('/register', async (req, res) => {
    try {
        const { name, age, username, company, email, password, confirmPassword } = req.body;
        const externalId = uuidv4();

        if (!name || !age || !username || !company || !email || !password || !confirmPassword) {
            res.status(400).json({ message: 'Fill in all fields' });
        }

        if (password !== confirmPassword) {
            res.status(401).json({ message: 'Passwords do not match' });
        }

        const userExists = await prisma.recruiter.findFirst({ where: { username } });
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
        }
        const emailExists = await prisma.recruiter.findUnique({ where: { email } });
        if (emailExists) {
            res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
    
        const recruiter = await prisma.recruiter.create({
            data: {
                externalId,
                name,
                age,
                username,
                company,
                email,
                password: hashedPassword
            }
        });

        const token = jwt.sign({ id: recruiter.externalId, email: recruiter.email }, process.env.JWT_SECRET, {expiresIn: '1h'});

        res.status(201).json({
            message: 'Recruiter registered successfully',
            recruiter: { name: recruiter.name, username: recruiter.username, email: recruiter.email },
            token
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

/**
 * @swagger
 * /recruiter/login:
 *   post:
 *     summary: Faz login no sistema como recrutador
 *     description: Faz login no sistema, validando a senha e criando um token JWT.
 *     tags: [Recruiter]
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

//FAZ LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Fill in all fields' });
        }

        const recruiter = await prisma.recruiter.findUnique({ where: { email } });
        if (!recruiter) {
            return res.status(400).json({ message: 'Recruiter not found' });
        }
        const passwordMatch = await bcrypt.compare(password, recruiter.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ id: recruiter.externalId, email: recruiter.email, role: recruiter.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            message: 'Recruiter logged in successfully',
            recruiter: { username: recruiter.username, email: recruiter.email },
            token
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
    
})

/**
 * @swagger
 * /recruiter/candidates:
 *   get:
 *     summary: Lista todos os candidatos
 *     description: Retorna um JSON com todos os candidatos.
 *     tags:
 *       - Test
 *     responses:
 *       200:
 *         description: Sucesso. Retorna todos os candidatos
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hello World"
 */

//LISTA TODOS OS CANDIDATOS
router.get('/candidates', authenticate, isRecruiter, async (req, res) => {
    try {
        const candidates = await prisma.candidates.findMany();
        res.status(200).json(candidates);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})



export { router as recruiter };