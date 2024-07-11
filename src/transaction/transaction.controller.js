import Transaction from './transaction.model.js';
import Account from '../account/account.model.js';
import User from '../user/user.model.js';
import Deposit from '../deposit/deposit.model.js';
import mongoose from 'mongoose';

export const createTransaction = async (req, res) => {
    const { amount, toAccount, description } = req.body;
    const user = req.user.uid;

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const detailsUser = await User.findById(user);
        if (!detailsUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const fromAccountExists = await Account.findOne({ _id: detailsUser.accountNumber }).populate('transactions.idTransaction');
        const toAccountExists = await Account.findOne({ accountNumber: toAccount });
        if (!fromAccountExists) {
            return res.status(404).json({ message: 'Account not found' });
        }
        if (!toAccountExists) {
            return res.status(404).json({ message: 'Destination account not found' });
        }

        if (fromAccountExists.balance < amount) {
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        const transactionsToday = fromAccountExists.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.idTransaction.date);
            return transaction.idTransaction.type === 'TRANSFER' && transactionDate >= today && transactionDate < tomorrow;
        });

        const totalAmountToday = transactionsToday.reduce((acc, transaction) => acc + transaction.idTransaction.amount, 0);

        if (totalAmountToday + amount > 10000) {
            return res.status(400).json({ message: `Exceeded daily transfer limit of 10,000 quetzales` });
        }

        const transaction = new Transaction({
            amount,
            type: 'TRANSFER',
            fromAccount: fromAccountExists.accountNumber,
            toAccount: toAccountExists.accountNumber,
            description: description,
            status: 'PENDING',
            userId: user
        });
        await transaction.save();

        fromAccountExists.balance -= amount;
        toAccountExists.balance += amount;
        fromAccountExists.transactions.push({ idTransaction: transaction._id });
        toAccountExists.receivedTransactions.push({ idTransaction: transaction._id });
        await fromAccountExists.save();
        await toAccountExists.save();

        setTimeout(async () => {
            const trans = await Transaction.findById(transaction._id);
            if (trans && trans.reversible) {
                trans.status = 'COMPLETED';
                trans.reversible = true;
                await trans.save();
            }
        }, 1 * 1000);

        setTimeout(async () => {
            const trans = await Transaction.findById(transaction._id);
            if (trans && trans.reversible) {
                trans.reversible = false;
                await trans.save();
            }
        }, 10 * 60 * 1000);

        res.status(201).json({ message: 'Transaction created successfully, after 10 minutes you will no longer be able to reverse it.', transaction });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};


export const revertTransaction = async (req, res) => {
    const userId = req.user.uid;
    const { transactionId } = req.params;

    try {
        const transaction = await Transaction.findById(transactionId);
        
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.status === 'REVERTED') {
            return res.status(400).json({ message: 'Transaction cannot be reverted' });
        }

        if (transaction.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You do not have permission to revert this transaction' });
        }

        const fromAccount = await Account.findOne({ accountNumber: transaction.fromAccount });
        const toAccount = await Account.findOne({ accountNumber: transaction.toAccount });

        if (!fromAccount || !toAccount) {
            return res.status(404).json({ message: 'Account not found' });
        }

        fromAccount.balance += transaction.amount;
        toAccount.balance -= transaction.amount;

        await fromAccount.save();
        await toAccount.save();

        transaction.status = 'REVERTED';
        transaction.reversible = false;
        await transaction.save();

        res.status(200).json({ message: 'Transaction reverted successfully' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

export const getTransactions = async (req, res) => {
    const userId = req.user.uid;

    try {

        const userDetails = await User.findById(userId);

        if (!userDetails) {
            return res.status(404).json({ message: 'User not found' });
        }

        const accountDetails = await Account.findOne({ _id: userDetails.accountNumber })
            .populate('transactions.idTransaction')
            .populate('receivedTransactions.idTransaction')
            .populate('receivedDeposit.idDeposit');

        if (!accountDetails) {
            return res.status(404).json({ message: 'Account not found' });
        }

        res.status(200).json(
            {
                transactions: accountDetails.transactions,
                receivedTransactions: accountDetails.receivedTransactions,
                receivedDeposit: accountDetails.receivedDeposit
            }
        );

    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}