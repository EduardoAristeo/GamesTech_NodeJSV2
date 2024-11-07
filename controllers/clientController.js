const Client = require('../models/Client');

// Obtener todos los clientes
exports.getClients = async (req, res) => {
    try {
        const clients = await Client.find(); // Obtener todos los clientes
        res.status(200).json(clients);
    } catch (error) {
        console.error('Error al obtener los clientes:', error);
        res.status(500).json({ message: 'Error al obtener los clientes', error: error.message });
    }
};

// Crear un nuevo cliente
exports.createClient = async (req, res) => {
    try {
        const { firstName, secondName, lastName, secondLastName, phone, secondPhone } = req.body;

        if (!firstName || !lastName || !phone) {
            return res.status(400).json({ message: 'Los campos firstName, lastName y phone son requeridos.' });
        }

        const newClient = new Client({
            firstName,
            secondName,
            lastName,
            secondLastName,
            phone,
            secondPhone
        });

        const result = await newClient.save(); // Guardar en la base de datos
        res.status(201).json({ _id: result._id });
    } catch (error) {
        console.error('Error al crear el cliente:', error);
        res.status(500).json({ message: 'Error al crear el cliente', error: error.message });
    }
};

// Actualizar un cliente por ID
exports.updateClient = async (req, res) => {
    try {
        const { firstName, secondName, lastName, secondLastName, phone, secondPhone } = req.body;

        if (!firstName || !lastName || !phone) {
            return res.status(400).json({ message: 'Los campos firstName, lastName y phone son requeridos.' });
        }

        const updatedClient = await Client.findByIdAndUpdate(
            req.params.id,
            { firstName, secondName, lastName, secondLastName, phone, secondPhone },
            { new: true } // Retornar el documento actualizado
        );

        if (!updatedClient) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        res.status(200).json(updatedClient);
    } catch (error) {
        console.error('Error al actualizar el cliente:', error);
        res.status(500).json({ message: 'Error al actualizar el cliente', error: error.message });
    }
};

// Eliminar un cliente por ID
exports.deleteClient = async (req, res) => {
    try {
        const deletedClient = await Client.findByIdAndDelete(req.params.id);

        if (!deletedClient) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        res.status(200).json({ message: 'Cliente eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el cliente:', error);
        res.status(500).json({ message: 'Error al eliminar el cliente', error: error.message });
    }
};
