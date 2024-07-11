import { config } from 'dotenv';
config();

import express from 'express';
import cors from 'cors';
import Server from './config/server.js';

const app = express();
const server = new Server();

// Configurar CORS
const allowedOrigins = [
    'http://localhost:5173', // Reemplaza con el dominio de tu frontend
    'https://tudominio.com' // Añade cualquier otro dominio que necesites permitir
];

const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Resto de la configuración de tu aplicación
server.listen();