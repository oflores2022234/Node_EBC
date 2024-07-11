import axios from 'axios';
import User from '../user/user.model.js';
import Account from '../account/account.model.js';

export const convertData = async (req, res) => {
    const path = process.env.API_URL;
    const key = process.env.EXCHANGE_RATE_API_KEY;

    try {
        const { to, } = req.body;

        const userId = req.user.uid; // Asumiendo que el token contiene la información del usuario

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const accountExists = await Account.findOne({ _id: user.accountNumber });

        const baseCurrency = 'GTQ'; // Moneda base del usuario
        const account = accountExists;

        if (!account) {
            return res.status(404).json({ message: 'La cuenta del usuario no encontrada.' });
        }

        const currentBalance = account.balance; // Saldo actual en la moneda base

        const url = `${path}/${key}/pair/${baseCurrency}/${to}/${currentBalance}`;

        const response = await axios.get(url);

        if (response.data && response.data.result === 'success') {
            const convertedAmount = response.data.conversion_result;

            res.status(200).json({
                base: baseCurrency,
                target: to,
                conversionRate: response.data.conversion_rate,
                currentBalance,
                convertedAmount,
            });
        } else {
            return res.status(400).json({ message: 'Datos inválidos.' });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: e.message });
    }
}