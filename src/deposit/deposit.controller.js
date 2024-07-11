import Deposit from './deposit.model.js';
import User from '../user/user.model.js';
import Account from '../account/account.model.js';

export const createDeposit = async (req, res) => {
    const admin = req.user.uid;
    const { amount, toAccount } = req.body;

    try {
        const adminExists = await User.findById(admin);

        if (adminExists.role !== 'ADMIN') {
            res.status(401).json({ message: 'Unauthorized' });
        }
        console.log(toAccount);

        const accountExists = await Account.findOne({ accountNumber: toAccount });

        if (!accountExists) {
            res.status(404).json({ message: 'Account not found' });
        }

        const deposit = new Deposit({
            amount,
            toAccount,
            adminId: admin,
            status: 'PENDING'
        });

        await deposit.save();

        setTimeout(async () => {
            const dep = await Deposit.findById(deposit._id);
            if (dep && dep.reversible) {
                dep.status = 'COMPLETED';
                dep.reversible = true;
                accountExists.balance += dep.amount;
                await dep.save();
                await accountExists.save();
            }
        }, 1 * 1000);

        setTimeout(async () => {
            const dep = await Deposit.findById(deposit._id);
            if (dep) {
                dep.reversible = false;
                await dep.save();
            }
        }, 10 * 60 * 1000);

        accountExists.receivedDeposit.push( {idDeposit: deposit._id});
        await accountExists.save();

        res.status(201).json({ message: 'Deposit created successfully', deposit });

    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

export const revertDeposit = async (req, res) => {
    const { depositId } = req.params;
    const admin = req.user.uid;
    try {
        const adminExists = await User.findById(admin);

        if (adminExists.role !== 'ADMIN') {
            res.status(401).json({ message: 'Unauthorized' });
        }

        const deposit = await Deposit.findById(depositId);

        if (deposit.status === 'REVERTED') {
            return res.status(400).json({ message: 'Deposit already reverted' });
        }

        if (!deposit.reversible) {
            return res.status(400).json({ message: 'Cannot revert deposit' });
        }

        const account = await Account.findOne({ accountNumber: deposit.toAccount });
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        deposit.status = 'REVERTED';
        deposit.reversible = false;

        account.balance -= deposit.amount;

        await deposit.save();
        await account.save();
        res.status(200).json({ message: 'Deposit reverted successfully', deposit });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

export const editDepositAmount = async (req, res) => {
    const { depositId } = req.params;
    const { amount } = req.body;
    const admin = req.user.uid;

    try {
        const adminExists = await User.findById(admin);

        if (adminExists.role !== 'ADMIN') {
            res.status(401).json({ message: 'Unauthorized' });
        }

        const deposit = await Deposit.findById(depositId);

        if (deposit.status === 'REVERTED') {
            return res.status(400).json({ message: 'Cannot edit a reverted deposit' });
        }

        if (!deposit.reversible) {
            return res.status(400).json({ message: 'Cannot edit deposit' });
        }

        if (deposit.status !== 'COMPLETED') {
            return res.status(400).json({ message: 'Deposit can only be edited if it is in COMPLETED status' });
        }

        const account = await Account.findOne({ accountNumber: deposit.toAccount });

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const amountDifference = amount - deposit.amount;
        deposit.amount = amount;

        account.balance += amountDifference;

        await deposit.save();
        await account.save();

        res.status(200).json({ message: 'Deposit edited successfully', deposit });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

export const getDeposits = async (req, res) => {
    const admin = req.user.uid;

    try {
        const adminExists = await User.findById(admin);

        if (adminExists.role !== 'ADMIN') {
            res.status(401).json({ message: 'Unauthorized' });
        }

        const deposits = await Deposit.find();

        res.status(200).json(deposits);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}
