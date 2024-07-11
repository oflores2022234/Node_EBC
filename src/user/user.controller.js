import { response } from 'express'
import bcrypt from 'bcryptjs';
import User from '../user/user.model.js';
import Account from '../account/account.model.js';
import nodemailer from 'nodemailer';
import { generateUniqueCode, generateRandomPassword, minMonthlyIncome } from '../helpers/db-validators.js';
import { config } from 'dotenv';
import accountModel from '../account/account.model.js';

export const addUser = async (req, res) => {
    const {
        codeUser,
        password,
        username,
        names,
        lastNames,
        role,
        dpi,
        address,
        phone,
        email,
        job,
        monthlyIncome,
        status,
        type
    } = req.body;

    try {
        const accountNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
        const account = new Account({
            accountNumber,
            balance: 0,
            type: type
        });

        await account.save();

        const user = new User({
            codeUser, password, username, names, lastNames, role,
            dpi, address, phone, email, job, monthlyIncome, status,
            accountNumber: account._id
        });

        await user.save();

        const config = {
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: "echamale018@gmail.com",
                pass: process.env.PASS
            }
        };

        const transport = nodemailer.createTransport(config);

        const mensaje = {
            from: 'kinalgrupo@gmail.com',
            to: email,
            subject: 'Bienvenido a Easy Bank Code',
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Bienvenido a Easy Bank Code</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f5f5f5;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #fff;
                        padding: 40px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    h1 {
                        color: #333;
                    }
                    p {
                        color: #666;
                    }
                    .cta-button {
                        display: inline-block;
                        background-color: #007bff;
                        color: #fff;
                        text-decoration: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        margin-top: 20px;
                    }
                    .cta-button:hover {
                        background-color: #0056b3;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Bienvenido a Easy Bank Code</h1>
                    <p>Hola ${names} ${lastNames},</p>
                    <p>Tus credenciales son:</p>
                    <ul>
                        <li><strong>Usuario:</strong> ${codeUser}</li>
                        <li><strong>Contraseña:</strong> ${req.plainPassword}</li>
                    </ul>
                    <p>No los compartas con nadie.</p>
                    <a href="https://easybankcode.web.app" class="cta-button">Iniciar Sesión</a>
                    <p>Gracias por confiar en nosotros.</p>
                    <img src="https://github.com/echamale-2022222/imagenes/blob/main/MicrosoftTeams-image.png?raw=true" alt="Easy Bank Code" style="max-width: 50px;">
                </div>
            </body>
            </html>
            `
        };


        const info = await transport.sendMail(mensaje);

        res.status(201).json({ msg: 'User created and email sent', info });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error creating user or account' });
    }
};

export const validateAddUser = async (req, res, next) => {
    try {
        minMonthlyIncome(req.body.monthlyIncome);
        req.body.codeUser = await generateUniqueCode();

        const plainPassword = generateRandomPassword();
        req.plainPassword = plainPassword;

        const salt = bcrypt.genSaltSync();
        req.body.password = bcrypt.hashSync(plainPassword, salt);

        next();
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: 'Error in middleware' });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { dpi, ...rest } = req.body;

    try {
        const user = await User.findByIdAndUpdate(id, rest);

        res.status(200).json({ msg: 'User updated successfully', user });
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: 'Error updating user' });

    }

}

//lista solo los usuarios con el rol de user
export const getUsers = async (req, res) => {
    const users = await User.find({ role: "USER" });

    res.status(200).json(users);
}

export const adminExists = async (req, res) => {
    const admin = await User.findOne({ codeUser: "ADMINB" });

    if (!admin) {
        adminD(res);
    }
}

export const adminD = async (res = response) => {
    const adminDefault = new User({
        codeUser: "ADMINB",
        password: bcrypt.hashSync("ADMINB", 10),
        username: "ADMIN",
        names: "ADMIN",
        lastNames: "ADMIN",
        role: "ADMIN",
        dpi: 383992212,
        address: "ADMIN",
        phone: 12345678,
        email: "admin@gmail.com",
        job: "ADMIN",
        monthlyIncome: 150,
        status: "ASSET"
    });

    await adminDefault.save();
}

// solo para traer los detalles de la persona que esta logeada
export const myDetails = async (req, res) => {
    const user = req.user.uid;

    const details = await User.findById(user);

    const accountDetails = await accountModel.findOne({ accountNumber: details.accountNumber})

    res.status(200).json({
        details, accountDetails
    })
}

// Funcion para el admin para que le muestre un usuario en especifico, es decir los detalles de solo uno....
export const getUser = async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);

    const accountDetails = await accountModel.findOne({ _id: user.accountNumber})

    res.status(200).json({
        user, accountDetails
    })
}

// Funcion para que los usuarios editen solo su informacion
export const editMyUser = async (req, res) => {
    const user = req.user.uid;
    const { names, lastNames, address, job, monthlyIncome } = req.body;

    try {
        const userExists = await User.findById(user);

        if ( userExists._id !== user) {
            res.status(401).json({ msg: 'You are not authorized to update this user' });
        }

        userExists.names = names;
        userExists.lastNames = lastNames;
        userExists.address = address;
        userExists.job = job;
        userExists.monthlyIncome = monthlyIncome;

        await userExists.save();

        res.status(200).json({ msg: 'User updated successfully', userExists });

    } catch (e) {
        res.status(500).json({ msg: e.message });
    }
}

export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        await User.findByIdAndDelete(id);

        res.status(200).json({ msg: 'User deleted successfully' });
    } catch (e) {
        res.status(500).json({ msg: 'Error deleting user' });
    }
}

export const getUserDetails = async (req, res) => {
    const user = req.user.uid;

    try {
        const detailsUser = await User.findById(user).populate('accountNumber');
        if (!detailsUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const accountDetails = await Account.findById(detailsUser.accountNumber._id)
        if (!accountDetails) {
            return res.status(404).json({ message: 'Account not found' });
        }

        res.status(200).json({ accountNumber: accountDetails.accountNumber, balance: accountDetails.balance, type: accountDetails.type});

    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}
