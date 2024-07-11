'use strict'

import mongoose from 'mongoose'

export const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.URI_MONGO, {
            serverSelectionTimeoutMS: 10000,
        })
    } catch (e) {
        console.log('Database connection error: ', e)
    }
}