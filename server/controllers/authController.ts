import User from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
};

export const signup = async (req: any, res: any) => {
    try {
        const { name, email, password, role, department } = req.body;
        const exists = await User.findOne({ email }).lean();
        if (exists) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword, role, department });

        res.status(201).json({
            token: generateToken(user._id.toString()),
            user: {
                id: user._id, name: user.name, role: user.role, department: user.department, eco_stats: user.eco_stats
            }
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const login = async (req: any, res: any) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        res.json({
            token: generateToken(user._id.toString()),
            user: {
                id: user._id, name: user.name, role: user.role, department: user.department, eco_stats: user.eco_stats, avatar: user.avatar
            }
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getMe = async (req: any, res: any) => {
    try {
        res.json({ user: req.user });
    } catch (err: any) {
        res.status(500).json({ error: 'Server error' });
    }
};
