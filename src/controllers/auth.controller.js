import User from "../models/user.model.js";
import { hash, compare } from "../utils/hash.js";
import { sign, verify } from "../utils/jwt.js";

// Registering a new user
export async function createUser(req, res, next) {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                msg: "User with this email already exists"
            });
        }

        // Validate required fields
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                msg: "All fields are required"
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                msg: "Please enter a valid email address"
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                msg: "Password must be at least 6 characters long"
            });
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: await hash(password),
        });

        res.status(201).json({
            success: true,
            token: sign({ id: user._id }, "7d"),
            msg: "Account created successfully"
        });
    } catch (e) {
        console.error('Create user error:', e);
        if (e.code === 11000) {
            return res.status(400).json({
                success: false,
                msg: "User with this email already exists"
            });
        }
        next(e);
    }
}

// Login existing user
export async function connectUser(req, res, next) {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                msg: "Email and password are required"
            });
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({
                success: false,
                msg: "Invalid email or password"
            });
        }

        if (!(await compare(password, user.password))) {
            return res.status(400).json({
                success: false,
                msg: "Invalid email or password"
            });
        }

        res.json({
            success: true,
            token: sign({ id: user._id }, "7d"),
            msg: "Login successful"
        });
    } catch (e) {
        console.error('Login error:', e);
        next(e);
    }
}

// Getting user data
export async function getUser(req, res, next) {
    try {
        const user = await User.findById(req.user.id);
        if (!user)
            return res.status(404).json({ msg: 'No User found' });

        res.json({ user });
    } catch (e) { next(e); }
}

// Update user data
export async function updateUser(req, res, next) {
    try {
        const { firstName, lastName, email, password } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'No user found' });

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;

        if (password) {
            const isSame = await compare(password, user.password);
            if (isSame) {
                return res.status(400).json({ msg: 'New password must be different from the current password.' });
            }
            user.password = await hash(password);
        }

        await user.save();

        res.json({ user });
    } catch (e) { next(e); }
}


// Forgot password
export async function requestReset(req, res, next) {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ msg: 'No User found' });

        const token = sign({ id: user._id }, "15m");
        const resetUser = `${process.env.CLIENT_URL}/reset-password/${token}`;

        // Placeholder for email
        console.log('Reset user:', resetUser);
        res.json({ msg: 'Reset link sent to your email' });
    } catch (e) { next(e); }
}

// Reset password
export async function confirmReset(req, res, next) {
    try {
        const { password } = req.body;
        const decoded = verify(req.params.token);
        const user = await User.findById(decoded.id).select('+password');
        if (!user)
            return res.status(400).json({ msg: 'Invalid reset token' });

        const isSame = await compare(password, user.password);
        if (isSame)
            return res.status(400).json({ msg: 'Password must be different' });

        user.password = await hash(password);
        await user.save();

        res.json({ msg: 'Password successfully updated' });
    } catch (err) {
        if (err.name === 'JsonWebTokenError')
            return res.status(400).json({ msg: 'Reset link expired' });
        next(err);
    }
}