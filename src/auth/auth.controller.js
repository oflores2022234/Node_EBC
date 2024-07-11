import bcryptjs from 'bcryptjs';
import User from '../user/user.model.js';
import { generateJWT } from '../helpers/generate-jwt.js';

export const login = async (req, res) => {
    const { codeUser, password } = req.body;

    try {
        const user = await User.findOne({ codeUser });

        if (user && (await bcryptjs.compare(password, user.password))) {
            const token = await generateJWT(user.id)

            res.status(200).json({
                msg: "Login Ok!!!",
                userDetails: {
                    id: user.id,
                    token: token,
                    role: user.role
                },
            });
        }

        if (!user) {
            return res
                .status(400)
                .send(`Wrong credentials, ${codeUser} doesn't exists en database`);
        }

        const validPassword = bcryptjs.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(400).send("wrong password");
        }
    } catch (e) {
        res.status(500).json({ msg: 'Comuniquese con el administrador' });
    }
}

