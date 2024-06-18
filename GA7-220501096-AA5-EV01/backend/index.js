const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'tu_usuario',
    password: 'tu_contraseña',
    database: 'servicio_web'
});

// Conexión a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

// Ruta para registro de usuarios
app.post('/registro', (req, res) => {
    const { usuario, clave } = req.body;
    const hashedPassword = bcrypt.hashSync(clave, 8);

    const sql = 'INSERT INTO usuarios (usuario, clave) VALUES (?, ?)';
    db.query(sql, [usuario, hashedPassword], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al registrar usuario' });
        }
        res.json({ message: 'Registro exitoso' });
    });
});

// Ruta para inicio de sesión
app.post('/inicio_sesion', (req, res) => {
    const { usuario, clave } = req.body;

    const sql = 'SELECT * FROM usuarios WHERE usuario = ?';
    db.query(sql, [usuario], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        if (results.length === 0) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        const user = results[0];
        const isValidPassword = bcrypt.compareSync(clave, user.clave);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        res.json({ message: 'Autenticación satisfactoria' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
