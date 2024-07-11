'use strict'

import { dbConnection } from "./mongo.js"
import express from 'express'
import cors from 'cors'
import helmet from "helmet" 
import morgan from "morgan"
import userRoutes from "../src/user/user.routes.js"
import loginRoutes from "../src/auth/auth.routes.js"
import serviceRoutes from "../src/service/service.routes.js"
import transactionRoutes from "../src/transaction/transaction.routes.js"
import depositRoutes from '../src/deposit/deposit.routes.js'
import accountRoutes from '../src/account/account.routes.js'
import currencyRoutes from '../src/currency/currency.routes.js'
import { adminExists } from "../src/user/user.controller.js"

class Server{
    constructor(){
        this.app = express()
        this.port = process.env.PORT || 3000
        this.userPath = '/ebc/v1/user'
        this.loginPath = '/ebc/v1/login'
        this.servicePath = '/ebc/v1/service'
        this.transactionPath = '/ebc/v1/transaction'
        this.depositPath = '/ebc/v1/deposit'
        this.accountPath = '/ebc/v1/account'
        this.currencyPath = '/ebc/v1/currency'

        this.conectarDB()
        this.middlewares()
        this.routes()
    }

    async conectarDB(){
        await dbConnection()
        await adminExists()
    }

    middlewares(){
        this.app.use(express.urlencoded({ extended: true }))
        this.app.use(express.json())
        this.app.use(cors())
        this.app.use(helmet())
        this.app.use(morgan('dev'))
    }

    routes(){
        this.app.use(this.userPath, userRoutes)
        this.app.use(this.loginPath, loginRoutes)
        this.app.use(this.servicePath, serviceRoutes)
        this.app.use(this.transactionPath, transactionRoutes)
        this.app.use(this.depositPath, depositRoutes)
        this.app.use(this.accountPath, accountRoutes)
        this.app.use(this.currencyPath, currencyRoutes)
    }

    listen(){
        this.app.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`)
        })
    }
}

export default Server