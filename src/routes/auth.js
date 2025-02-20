import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const router = Router();

router.post('/user/register', async (req, res) => {
    const {name, email, password, confirmPassword} = req.body;

    if(user.password !== user.confirmPassword) {
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
        res.status(201).json({
            message: 'User created',
            user: { name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error'});
    }
})

console.log('Auth route loaded');

export { router as auth };