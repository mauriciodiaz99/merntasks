const Tarea = require ('../models/Tarea');
const Proyecto = require ('../models/Proyecto');
const { validationResult } = require('express-validator');

//crea una nueva tarea
exports.crearTarea = async (req, res) => {
    //revisar si hay errores
    const errores = validationResult(req);
    if( !errores.isEmpty() ) {
        return res.status(400).json({errores: errores.array() })
    }
    
    try {
        //extraer el proyecto y verificar que exista
        const { proyecto } = req.body;

        const existeProyecto = await Proyecto.findById(proyecto);
        if(!existeProyecto) {
            return res.status(404).json({msg: 'Proyecto no encontrado'})
        }
        
        //revisar si el proyecto actual pertenece al usuario autenticado
        if(existeProyecto.creador.toString() !== req.usuario.id) {
            return res.status(401).json({ msg: 'No esta Autorizado' });
        }

        //creamos la tarea
        const tarea = new Tarea(req.body);
        await tarea.save();
        res.json({ tarea });
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }
}

//obtiene las tarea spor proyecto
exports.obtenerTareas = async (req, res) => {
    try {
        //extraer el proyecto y verificar que exista
        const { proyecto } = req.query;

        const existeProyecto = await Proyecto.findById(proyecto);
        if(!existeProyecto) {
            return res.status(404).json({msg: 'Proyecto no encontrado'})
        }
        
        //revisar si el proyecto actual pertenece al usuario autenticado
        if(existeProyecto.creador.toString() !== req.usuario.id) {
            return res.status(401).json({ msg: 'No esta Autorizado' });
        }

        //obtener las tareas por proyecto
        const tareas = await Tarea.find({ proyecto }).sort({ creado: -1 });
        res.json({ tareas });
    } catch (error) {
        console.log(error);
        res,status(500).send('Hubo un error');
    }
}

//actualizar una tarea
exports.actualizarTarea = async (req, res) => {
    try {
        //extraer el proyecto y verificar que exista
        const { proyecto, nombre, estado } = req.body;

        //si existe la tarea o no
        let tarea = await Tarea.findById(req.params.id);
        if(!tarea) {
            return res.status(404).json({ msg: 'No existe esa tarea' });
        }

        //extraer proyecto
        const existeProyecto = await Proyecto.findById(proyecto);

        //revisar si el proyecto actual pertenece al usuario autenticado
        if(existeProyecto.creador.toString() !== req.usuario.id) {
            return res.status(401).json({ msg: 'No esta Autorizado' });
        }

        //crear un objeto con la nueva informacion
        const nuevaTarea = {};
        nuevaTarea.nombre = nombre;
        nuevaTarea.estado = estado;

        //guardar la tarea
        tarea = await Tarea.findOneAndUpdate({_id: req.params.id }, nuevaTarea, { new: true });
        res.json({ tarea })
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error')
    }
}

//Eliminar una tarea
exports.eliminarTarea = async (req, res) => {
    try {
        //extraer el proyecto y verificar que exista
        const { proyecto } = req.query;

        //si existe la tarea o no
        let tarea = await Tarea.findById(req.params.id);
        if(!tarea) {
            return res.status(404).json({ msg: 'No existe esa tarea' });
        }

        //extraer proyecto
        const existeProyecto = await Proyecto.findById(proyecto);

        //revisar si el proyecto actual pertenece al usuario autenticado
        if(existeProyecto.creador.toString() !== req.usuario.id) {
            return res.status(401).json({ msg: 'No esta Autorizado' });
        }

        //eliminar
        await Tarea.findOneAndRemove({ _id: req.params.id });
        res.json({msg: 'Tarea Eliminada'})
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error')
    }
}