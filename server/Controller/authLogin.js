import AuthLogin from "../models/authlogin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const createAuthLogin = async (req, res) => {
    try {
        const { fullName, password, email, phoneNumber } = req.body;
        const authUser = await AuthLogin.findOne({ email });
        if (authUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAuthLogin = new AuthLogin({
            fullName,
            password: hashedPassword,
            email,
            phoneNumber,
        });
        await newAuthLogin.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const userExit = await AuthLogin.findOne({ email });
    if (!userExit) {
        return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, userExit.password);

    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
        { id: userExit._id, email: userExit.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
    res.status(200).json({ token, message: "Login successful" });
};
export const getAuthLogins = async (req, res) => {
    try {
        const authLogins = await AuthLogin.find();
        res.status(200).json(authLogins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};