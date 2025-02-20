import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const router = Router();

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