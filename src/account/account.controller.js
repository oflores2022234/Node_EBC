import Account from "./account.model.js";
import User from "../user/user.model.js";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import Service from '../service/service.model.js'

export const addFavorite = async (req, res) => {
    const user = req.user.uid;

    try {
        const userDetails = await User.findById(user);

        const account = await Account.findById({ _id: userDetails.accountNumber });

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const { accountNumber, alias } = req.body;

        const accountExists = await Account.findOne({ accountNumber: accountNumber });

        if (!accountExists) {
            return res.status(404).json({ message: 'Account not found' });
        }

        console.log(accountExists._id);

        const favorite = {
            accountNumber: accountExists._id,
            alias
        };

        if (!account.favorites) {
            account.favorites = [];
        }

        account.favorite.push(favorite);

        await account.save();

        res.status(201).json({ message: 'Favorite added successfully', favorite });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

export const listFavorites = async (req, res) => {
    const user = req.user.uid;

    try {
        const userDetails = await User.findById(user).populate({
            path: 'accountNumber',
            populate: {
                path: 'favorite.accountNumber',
                model: 'Account'
            }
        });

        if (!userDetails) {
            return res.status(404).json({ message: 'User not found' });
        }

        const account = userDetails.accountNumber;

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const favorites = account.favorite.map(fav => ({
            accountNumber: fav.accountNumber.accountNumber,
            alias: fav.alias
        }));

        res.status(200).json({
            accountNumber: account.accountNumber,
            alias: account.alias,
            favorites: favorites
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

export const obtenerCuentasAsc = async (req, res) => {
    try {
        const { order } = req.params;

        const accounts = await Account.aggregate([
            {
                $lookup: {
                    from: "transactions", // Colección de transacciones
                    localField: "transactions.idTransaction",
                    foreignField: "_id",
                    as: "transactionsDetails"
                }
            },
            {
                $addFields: {
                    transactionsDetailsSorted: {
                        $slice: [
                            {
                                $filter: {
                                    input: "$transactionsDetails",
                                    as: "transaction",
                                    cond: { $eq: ["$$transaction.status", "COMPLETED"] }
                                }
                            },
                            -5
                        ]
                    }
                }
            },
            {
                $project: {
                    accountNumber: 1,
                    balance: 1,
                    type: 1,
                    favorite: 1,
                    transactions: "$transactionsDetailsSorted",
                    receivedTransactions: 1,
                    receivedDeposit: 1,
                    createdAt: 1,
                    status: 1,
                    completedTransactionsCount: {
                        $size: "$transactionsDetailsSorted"
                    }
                }
            },
            {
                $sort: {
                    completedTransactionsCount: order === 'asc' ? 1 : -1
                }
            }
        ]);

        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const obtenerDetallesCuenta = async (req, res) => {
    try {
        const { accountId } = req.params;

        const accountDetails = await Account.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(accountId) } },
            {
                $lookup: {
                    from: "transactions",
                    localField: "transactions.idTransaction",
                    foreignField: "_id",
                    as: "transactionsDetails"
                }
            },
            {
                $addFields: {
                    recentTransactions: {
                        $slice: [
                            {
                                $filter: {
                                    input: "$transactionsDetails",
                                    as: "transaction",
                                    cond: { $eq: ["$$transaction.status", "COMPLETED"] }
                                }
                            },
                            5
                        ]
                    }
                }
            },
            {
                $project: {
                    accountNumber: 1,
                    balance: 1,
                    type: 1,
                    favorite: 1,
                    transactions: 1,
                    receivedTransactions: 1,
                    receivedDeposit: 1,
                    createdAt: 1,
                    status: 1,
                    recentTransactions: 1
                }
            }
        ]);

        if (!accountDetails || accountDetails.length === 0) {
            return res.status(404).json({ message: "Account not found" });
        }

        res.json(accountDetails[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAccountDetails = async (req, res) => {
    const user = req.user.uid;

    try {
        const detailsUser = await User.findById(user).populate('accountNumber');
        if (!detailsUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const accountDetails = await Account.findById(detailsUser.accountNumber._id);
        if (!accountDetails) {
            return res.status(404).json({ message: 'Account not found' });
        }

        res.status(200).json({ accountNumber: accountDetails.accountNumber, balance: accountDetails.balance });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

export const getAccountDetailsUser = async (req, res) => {
    const user = req.user.uid;

    try {
        const detailsUser = await User.findById(user).populate('accountNumber');
        if (!detailsUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const accountDetails = await Account.findById(detailsUser.accountNumber._id);

        if (!accountDetails) {
            return res.status(404).json({ message: 'Account not found' });
        }

        res.status(200).json({ accountDetails, detailsUser });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};


export const changePassword = async (req, res) => {
    try {
        const { uid } = req.user;
        const userData = await User.findById(uid, { password: 1 });
        const passwordCorrect = await bcryptjs.compare(password, userData.password)

        if (!passwordCorrect) {
            return res.status(400).send('Invalid Password. Please try again.')
        }

        const encryptedPassword = await bcryptjs.hash(newPassword, 8);

        await User.updateOne({ _id: uid }, { password: encryptedPassword });

        return res.status(200).send('Password updated successfully.');

    } catch (e) {
        res.status(500).json('Something went wrong. Please try again.');
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

        res.status(200).json({ accountNumber: accountDetails.accountNumber, balance: accountDetails.balance, type: accountDetails.type });

    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

export const addService = async (req, res) => {
    const user = req.user.uid;

    try {
        const userDetails = await User.findById(user);

        const account = await Account.findById({ _id: userDetails.accountNumber });

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const { idService } = req.params;

        const serviceExists = await Service.findById(idService);

        if (!serviceExists) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const service = {
            idService: serviceExists._id
        };

        if (!account.servicesAssociates) {
            account.servicesAssociates = [];
        }

        account.servicesAssociates.push(service);
        account.balance -= serviceExists.price;
        
        await account.save();

        res.status(201).json({ message: 'Service added successfully', service });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

export const myServices = async (req, res) => {
    const user = req.user.uid;

    try {
        const userDetails = await User.findById(user);

        const account = await Account.findById({ _id: userDetails.accountNumber });

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const services = await Account.populate(account, { path: 'servicesAssociates.idService' });

        res.status(200).json({ services });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

export const getQuery = async (req, res) => {
    const user = req.user.uid;

    try {
        const queryDetails = await User.findById(user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const accountDetails = await Account.findById({_id: queryDetails.accountNumber});

        if (!accountDetails) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const userDetails = {
            accountNumber: accountDetails.accountNumber,
            name: queryDetails.names,
            lastName: queryDetails.lastNames,
            username: queryDetails.username,
            balance: accountDetails.balance,
            accountType: accountDetails.type, 
            status: accountDetails.status,
        };

        res.status(200).json(userDetails);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}
