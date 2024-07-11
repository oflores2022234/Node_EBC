import mongoose from 'mongoose';

const DepositSchema = mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    toAccount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'REVERTED'],
        default: 'COMPLETED'
    },
    reversible: {
        type: Boolean,
        default: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

export default mongoose.model('Deposit', DepositSchema);
