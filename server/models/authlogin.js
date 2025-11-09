import mongoose from 'mongoose';

const authLoginSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
}, { timestamps: true });
const AuthLogin = mongoose.model('AuthLogin', authLoginSchema);
export default AuthLogin;