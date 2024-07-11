import mongoose from "mongoose";

const TransactionSchema = mongoose.Schema({
    type: {
        type: String,
        enum: ['TRANSFER', 'PURCHASE', 'SERVICE'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        validate: {
            validator: function(value) {
                return value <= 2000;
            },
            message: 'Transfer amount cannot exceed 2000 quetzales'
        }
    },
    date: {
        type: Date,
        default: Date.now
    },
    fromAccount: {
        type: Number,
        required: true
    },
    toAccount: {
        type: Number,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'REVERTED'],
        default: 'PENDING'
    },
    reversible: {
        type: Boolean,
        default: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

export default mongoose.model('Transaction', TransactionSchema);
