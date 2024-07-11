import mongoose from "mongoose";

const AccountSchema = mongoose.Schema({
    accountNumber: {
        type: Number,
        required: true,
    },
    balance: {
        type: Number,
        default: 0,
        required: true,
    },
    type: {
        type: String,
        enum: ['SAVING', 'MONETARY'],
        required: true,
    },
    favorite: [{
        accountNumber: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account"
        },
        alias: {
            type: String
        }
    }],
    transactions: [{
        idTransaction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transaction"
        }  
    }],
    receivedTransactions: [{
        idTransaction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transaction"
        }  
    }],
    receivedDeposit: [{
        idDeposit: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Deposit"
        }  
    }],
    servicesAssociates: [{
        idService: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service"
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: [ 'ACTIVE', 'INACTIVE' ],
        default: 'ACTIVE'
    }
});

export default mongoose.model('Account', AccountSchema);