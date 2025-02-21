import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import authMiddleware from '../middlewares/authMiddleware.js';

const prisma = new PrismaClient();

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Operações de autenticação e gerenciamento de usuários
 */

/**
 * @swagger
 * /user/test:
 *   get:
 *     summary: Testa a autenticação do usuário
 *     description: Rota protegida para testar a autenticação do usuário.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Autenticação bem-sucedida
 *       401:
 *         description: Não autorizado
 */

//ROTA DE TESTE
router.get('/user/test', authMiddleware, (req, res) => {
    res.status(200).json({ message: 'Authenticated' });
});

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Registra um novo usuário
 *     description: Cria um novo usuário no sistema, validando a senha e criando um token JWT.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
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
 *         description: Erro de validação ou usuário já existe
 *       500:
 *         description: Erro interno do servidor
 */

//REGISTRAR UM USUÁRIO
router.post('/user/register', async (req, res) => {
    const {name, email, password, confirmPassword} = req.body;

    if(password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if(userExists) {
        return res.status(400).json({ message: 'User already taken' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {expiresIn: '1h'});

        res.status(201).json({
            message: 'User registered successfully',
            user: { name: user.name, email: user.email },
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error'});
    }
})

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Realiza o login do usuário
 *     description: Faz login do usuário, validando o email e a senha e retornando um token JWT.
 *     tags: [Auth]
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
 *       200:
 *         description: Login bem-sucedido
 *       400:
 *         description: Erro de validação ou credenciais inválidas
 *       500:
 *         description: Erro interno do servidor
 */

//FAZER LOGIN
router.post('/user/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email }});
    if(!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if(!passwordMatch) {
        return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {expiresIn: '1h'});
    res.status(200).json({ message: 'User logged in sucessfully', token});
});

console.log('Auth route loaded');

export { router as auth };