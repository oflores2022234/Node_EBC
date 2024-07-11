import Service from "../service/service.model.js";
import userModel from "../user/user.model.js";
import User from "../user/user.model.js";

export const addService = async (req, res) => {
    const {imagen, nameService, description, price } = req.body;
    const admin = req.user.uid;

    const adminExists = await User.findById(admin);

    try {
        const service = new Service({imagen, nameService, description, price, createdBy: adminExists._id });

        await service.save();

        res.status(201).json({ msg: 'Service created successfully', service });
    } catch (error) {
        res.status(500).json({ msg: 'Error creating service' });
    }
}

export const getServices = async (req, res) => {
    const services = await Service.find();

    res.status(200).json(services);
}

export const getService = async (req, res) => {
    const { id } = req.params;

    const service = await Service.findById(id);

    if (!service) {
        return res.status(404).json({ msg: 'Service not found' });
    }

    res.status(200).json(service);

}

export const updateService = async (req, res) => {
    const { id } = req.params;
    const { imagen, nameService, description, price } = req.body;
    const admin = req.user.uid;

    const user = await User.findById(admin);

    console.log(user, "user")

    const service = await Service.findById(id);

    if (!service) {
        return res.status(404).json({ msg: 'Service not found' });
    }

    if (user.role === "ADMIN") {

    service.nameService = nameService;
    service.description = description;
    service.price = price;

    await service.save();
    
    res.status(200).json({ msg: 'Service updated successfully', service });

    } else {
        res.status(401).json({ msg: 'You are not authorized to update this service' });
    }

}

export const deleteService = async (req, res) => {
    const { id } = req.params;
    const admin = req.user.uid;

    const user = await User.findById(admin);

    if (user.role === "ADMIN") {
        const service = await Service.findByIdAndDelete(id);

        if (!service) {
            return res.status(404).json({ msg: 'Service not found' });
        }

        res.status(200).json({ msg: 'Service deleted successfully' });
    }

}