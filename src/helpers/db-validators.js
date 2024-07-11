import bcrypt from 'bcryptjs';
import User from '../user/user.model.js';

export const generateRandomCode = () => {
    const length = 6; // Define la longitud del código
    let code = '';
    for (let i = 0; i < length; i++) {
        const randomDigit = Math.floor(Math.random() * 10); // Genera un dígito aleatorio entre 0 y 9
        code += randomDigit;
    }
    return code;
};

export const isUniqueCodeUser = async (codeUser) => {
    const user = await User.findOne({ codeUser });
    return !user;
};

export const generateUniqueCode = async () => {
    let codeUser;
    let isUnique = false;

    while (!isUnique) {
        codeUser = generateRandomCode();
        isUnique = await isUniqueCodeUser(codeUser);
    }
    

    return codeUser;
};

export const generateRandomPassword = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

export const existEmail = async ( email = '') => {
    const existenteEmail = await User.findOne({ email });
    if (existenteEmail) {
        throw new Error(`The email ${email} already exists`);
    }
}

export const existUsername = async ( username = '') => {
    const existenteUsername = await User.findOne({ username });
    if (existenteUsername) {
        throw new Error(`The user ${username} already exists`);
    }
}

export const existDpi = async ( dpi = '') => {
    const existenteDpi = await User.findOne({ dpi });
    if (existenteDpi) {
        throw new Error(`The dpi ${dpi} already exists`);
    }
}

export const existPhone = async ( phone = '') => {
    const existentePhone = await User.findOne({ phone });
    if (existentePhone) {
        throw new Error(`The phone ${phone} already exists`);
    }
}

export const minMonthlyIncome = (monthlyIncome) => {
    if (monthlyIncome < 100) {
        throw new Error('The monthly income must be at least 100');
    }
}