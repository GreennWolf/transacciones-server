import express from 'express';
import { Server } from 'socket.io';
import http, { validateHeaderValue } from 'http';
import mysql from 'mysql';
import cors from 'cors';

var con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hospital',
});

con.connect(function (err) {
  if (err) {
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});


io.on('connection',(socket)=>{
    // console.log('CONNECTED::' + socket.id)

    socket.on('getUsuarios',()=>{
        con.query(
            'SELECT * FROM personal',
            function(err, usuarios) {
                if (err) throw err;
                io.emit('getUsuarios',usuarios)
                // console.log(usuarios)
            }
        );
    })

    socket.on('addUsuario', (datosCuenta) => {
      const { nombre,apellido, email, password, dni,telefono,cargo,admin} = datosCuenta;
    
      con.query(
        'INSERT INTO personal (nombre,apellido, email, password, dnitelefono,, idcargo,admin) VALUES (?, ?, ?, ?, ?,?,?,?)',
        [nombre,apellido, email, password,dni,telefono, cargo,admin],
        function(err, result) {
          if (err) throw err;
          io.emit('update')
          // console.log('Cuenta insertada con éxito');
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });
    
    socket.on('editUsuario', (datosCuenta) => {
      const { id, nombre,apellido, email,password, dni,telefono ,cargo,admin} = datosCuenta;
    
      con.query(
        `UPDATE personal SET nombre=?,apellido = ?, email = ?, password = ?, dni = ?,telefono=?, idcargo = ? , admin=? WHERE id = ${id}`,
        [nombre,apellido, email, password, dni,telefono ,cargo,admin],
        function(err, result) {
          if (err) throw err;
          io.emit('update');
          // console.log('Cuenta actualizada con éxito');
          io.emit('update')
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });

    socket.on('deleteUsuario', (id) => {
      con.query(
        'DELETE FROM personal WHERE id = ?',
        [id],
        function(err, result) {
          if (err) throw err;
          io.emit('update');
          // console.log('Cuenta eliminada con éxito');
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });

    socket.on('getLlamados',()=>{
      con.query(
          'SELECT * FROM llamados',
          function(err, Llamados) {
              if (err) throw err;
              io.emit('getLlamados',Llamados)
              // console.log(Llamados)
          }
      );
  })

  socket.on('addLlamado', (datosCuenta) => {
    const { idpaciente, idtipo, idarea ,idzona,horario_llamada,horario_atencion,observaciones} = datosCuenta;
  
    con.query(
      'INSERT INTO llamados (idpaciente, idtipo, idarea ,idzona,horario_llamada,horario_atencion,observaciones) VALUES (?, ?, ?, ?, ?,?, ?, ?, ?, ?)',
      [idpaciente, idtipo, idarea ,idzona,horario_llamada,horario_atencion,observaciones],
      function(err, result) {
        if (err) throw err;
        io.emit('update')
        // console.log('Cuenta insertada con éxito');
        // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
      }
    );
  });
  
  socket.on('editLlamado', (datosCuenta) => {
    const { id, idpaciente,idtipo, idarea ,idzona,horario_llamada,horario_atencion,observaciones} = datosCuenta;
  
    con.query(
      `UPDATE llamados SET idpaciente = ?, idtipo = ?, idarea=? ,idzona=?,horario_llamada=?,horario_atencion=?,observaciones = ? WHERE id = ${id}`,
      [idpaciente, idtipo, idarea ,idzona,horario_llamada,horario_atencion,observaciones],
      function(err, result) {
        if (err) throw err;
        // io.emit('update');
        // console.log('Cuenta actualizada con éxito');
        io.emit('update')
        // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
      }
    );
  });

  socket.on('deleteLlamados', (id) => {
    con.query(
      'DELETE FROM llamados WHERE id = ?',
      [id],
      function(err, result) {
        if (err) throw err;
        io.emit('update');
        // console.log('Cuenta eliminada con éxito');
        // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
      }
    );
  });

    

    socket.on('getPacientes',()=>{
      con.query(
          'SELECT * FROM pacientes',
          function(err, Pacientes) {
              if (err) throw err;
              io.emit('getPacientes',Pacientes)
              // console.log(Pacientes)
          }
      );
    })

    socket.on('addPaciente', (datosPacientes) => {
      const { nombre,apellido, dni,telefono,email,nacimiento,grupoSanguineo,factor ,obraSocial, carnet,alergias,personal,area,enfermedades} = datosPacientes;
      console.log(grupoSanguineo,factor)
      con.query(
        'INSERT INTO pacientes (nombre,apellido, dni,telefono,email,nacimiento,grupo_sanguineo,factor_sanguineo ,idobra_social, carnet,alergias,idpersonal,idarea ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [nombre,apellido, dni,telefono,email,nacimiento,grupoSanguineo,factor ,obraSocial, carnet,alergias,personal,area],
        function(err, result) {
          if (err) throw err;
          io.emit('update')
          var fichaId = result.insertId;
          enfermedades.forEach(enfermedad =>{
            con.query(
              'INSERT INTO paciente_enfermedad (idpaciente,idenfermedad) VALUES (?,?)',
              [fichaId,enfermedad],
              function(err, result) {
                if (err) throw err;
                io.emit('update')
                // console.log('Cuenta insertada con éxito');
                // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
              }
            );
          })
          // console.log('Cuenta insertada con éxito');
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });
    
    socket.on('editPaciente', (datosPacientes) => {
      const {id, nombre,apellido, dni,telefono,email,nacimiento,grupoSanguineo,factor ,obraSocial, carnet,alergias,personal,area,enfermedades} = datosPacientes;
    
      con.query(
        `UPDATE pacientes SET nombre=?,apellido=?, dni=?,telefono=?,email=?,nacimiento=?,grupo_sanguineo=?,factor_sanguineo=? ,idobra_social=?, carnet=?,alergias = ?,idpersonal=?,idarea=? WHERE id = ${id}`,
        [nombre,apellido, dni,telefono,email,nacimiento,grupoSanguineo,factor ,obraSocial, carnet,alergias,personal,area],
        function(err, result) {
          if (err) throw err;
          io.emit('update');
          var fichaId = id;
          enfermedades.forEach(enfermedad =>{
            con.query(
              'INSERT INTO paciente_enfermedad (idpaciente,idenfermedad) VALUES (?,?)',
              [fichaId,enfermedad],
              function(err, result) {
                if (err) throw err;
                io.emit('update')
                // console.log('Cuenta insertada con éxito');
                // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
              }
            );
          })
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });

    socket.on('deletePaciente', (id) => {
      con.query(
        'DELETE FROM pacientes WHERE id = ?',
        [id],
        function(err, result) {
          if (err) throw err;
          io.emit('update');
          // console.log('Cuenta eliminada con éxito');
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });

    socket.on('getAreas',()=>{
      con.query(
          'SELECT * FROM areas',
          function(err, areas) {
              if (err) throw err;
              io.emit('getAreas',areas)
              // console.log(areas)
          }
      );
  })

    socket.on('addArea', (datosAreas) => {
      const { nombre} = datosAreas;
    
      con.query(
        'INSERT INTO areas (nombre) VALUES (?)',
        [nombre],
        function(err, result) {
          if (err) throw err;
          io.emit('update')
          console.log('Area insertada con éxito');
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });
    
    socket.on('editArea', (datosAreas) => {
      const { id, nombre} = datosAreas;
    
      con.query(
        `UPDATE areas SET nombre = ? WHERE id = ${id}`,
        [nombre],
        function(err, result) {
          if (err) throw err;
          io.emit('update');
          // console.log('Cuenta actualizada con éxito');
          io.emit('update')
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });

    socket.on('deleteArea', (id) => {
      con.query(
        'DELETE FROM areas WHERE id = ?',
        [id],
        function(err, result) {
          if (err) throw err;
          io.emit('update');
          // console.log('Cuenta eliminada con éxito');
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });

    socket.on('getZonas',()=>{
      con.query(
          'SELECT * FROM zonas',
          function(err, Zonas) {
              if (err) throw err;
              io.emit('getZonas',Zonas)
              // console.log(Zonas)
          }
      );
  })

    socket.on('addZona', (datosZonas) => {
      const { nombre} = datosZonas;
    
      con.query(
        'INSERT INTO zonas (nombre) VALUES (?)',
        [nombre],
        function(err, result) {
          if (err) throw err;
          io.emit('update')
          // console.log('Cuenta insertada con éxito');
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });
    
    socket.on('editZona', (datosZonas) => {
      const { id, nombre} = datosZonas;
    
      con.query(
        `UPDATE zonas SET nombre = ? WHERE id = ${id}`,
        [nombre],
        function(err, result) {
          if (err) throw err;
          io.emit('update');
          // console.log('Cuenta actualizada con éxito');
          io.emit('update')
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });

    socket.on('deleteZona', (id) => {
      con.query(
        'DELETE FROM zonas WHERE id = ?',
        [id],
        function(err, result) {
          if (err) throw err;
          io.emit('update');
          // console.log('Cuenta eliminada con éxito');
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });
    socket.on('getCargos',()=>{
      con.query(
          'SELECT * FROM cargos',
          function(err, Cargos) {
              if (err) throw err;
              io.emit('getCargos',Cargos)
              // console.log(Cargos)
          }
      );
  })

    socket.on('addCargo', (datosCargos) => {
      const { nombre} = datosCargos;
    
      con.query(
        'INSERT INTO cargos (nombre) VALUES (?)',
        [nombre],
        function(err, result) {
          if (err) throw err;
          io.emit('update')
          // console.log('Cuenta insertada con éxito');
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });
    
    socket.on('editCargos', (datosCargos) => {
      const { id, nombre} = datosCargos;
    
      con.query(
        `UPDATE cargos SET nombre = ? WHERE id = ${id}`,
        [nombre],
        function(err, result) {
          if (err) throw err;
          io.emit('update');
          // console.log('Cuenta actualizada con éxito');
          io.emit('update')
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });

    socket.on('deleteCargos', (id) => {
      con.query(
        'DELETE FROM cargos WHERE id = ?',
        [id],
        function(err, result) {
          if (err) throw err;
          io.emit('update');
          // console.log('Cuenta eliminada con éxito');
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });

    socket.on('getTipos',()=>{
      con.query(
          'SELECT * FROM tipos_llamados',
          function(err, Tipos) {
              if (err) throw err;
              io.emit('getTipos',Tipos)
              // console.log(Tipos)
          }
      );
  })

    socket.on('addTipo', (datosTipos) => {
      const { nombre} = datosTipos;
    
      con.query(
        'INSERT INTO tipos_llamados (nombre) VALUES (?)',
        [nombre],
        function(err, result) {
          if (err) throw err;
          io.emit('update')
          // console.log('Cuenta insertada con éxito');
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });
    
    socket.on('editTipo', (datosTipos) => {
      const { id, nombre} = datosTipos;
    
      con.query(
        `UPDATE tipos_llamados SET nombre = ? WHERE id = ${id}`,
        [nombre],
        function(err, result) {
          if (err) throw err;
          io.emit('update');
          // console.log('Cuenta actualizada con éxito');
          io.emit('update')
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });

    socket.on('deleteTipo', (id) => {
      con.query(
        'DELETE FROM tipos_llamados WHERE id = ?',
        [id],
        function(err, result) {
          if (err) throw err;
          io.emit('update');
          // console.log('Cuenta eliminada con éxito');
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });

    socket.on('getEnfermedades',()=>{
      con.query(
          'SELECT * FROM enfermedades',
          function(err, Enfermedads) {
              if (err) throw err;
              io.emit('getEnfermedades',Enfermedads)
              // console.log(Enfermedads)
          }
      );
  })

    socket.on('addEnfermedad', (datosEnfermedads) => {
      const { nombre} = datosEnfermedads;
    
      con.query(
        'INSERT INTO enfermedades (nombre) VALUES (?)',
        [nombre],
        function(err, result) {
          if (err) throw err;
          io.emit('update')
          // console.log('Cuenta insertada con éxito');
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });
    
    socket.on('editEnfermedad', (datosEnfermedads) => {
      const { id, nombre} = datosEnfermedads;
    
      con.query(
        `UPDATE enfermedades SET nombre = ? WHERE id = ${id}`,
        [nombre],
        function(err, result) {
          if (err) throw err;
          io.emit('update');
          // console.log('Cuenta actualizada con éxito');
          io.emit('update')
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });

    socket.on('deleteEnfermedad', (id) => {
      con.query(
        'DELETE FROM enfermedades WHERE id = ?',
        [id],
        function(err, result) {
          if (err) throw err;
          io.emit('update');
          // console.log('Cuenta eliminada con éxito');
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });

    socket.on('getObraSocial',()=>{
      con.query(
          'SELECT * FROM obras_sociales',
          function(err, ObraSocial) {
              if (err) throw err;
              io.emit('getObraSocial',ObraSocial)
              // console.log(ObraSocial)
          }
      );
  })

    socket.on('addObraSocial', (datosObraSocial) => {
      const { nombre} = datosObraSocial;
      // console.log(nombre , 'creando obra social')
      con.query(
        'INSERT INTO obras_sociales (nombre) VALUES (?)',
        [nombre],
        function(err, result) {
          if (err) throw err;
          io.emit('update')
          // console.log('Cuenta insertada con éxito');
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });
    
    socket.on('editObraSocial', (datosObraSocial) => {
      const { id, nombre} = datosObraSocial;
    
      con.query(
        `UPDATE obras_sociales SET nombre = ? WHERE id = ${id}`,
        [nombre],
        function(err, result) {
          if (err) throw err;
          io.emit('update');
          // console.log('Cuenta actualizada con éxito');
          io.emit('update')
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });

    socket.on('deleteObraSocial', (id) => {
      con.query(
        'DELETE FROM obras_sociales WHERE id = ?',
        [id],
        function(err, result) {
          if (err) throw err;
          io.emit('update');
          // console.log('Cuenta eliminada con éxito');
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });

    socket.on('getPacienteEnfermedad',()=>{
      con.query(
          'SELECT * FROM paciente_enfermedad',
          function(err, PacienteEnfermedad) {
              if (err) throw err;
              io.emit('getPacienteEnfermedad',PacienteEnfermedad)
              // console.log(PacienteEnfermedad)
          }
      );
  })

    socket.on('addPacienteEnfermedad', (datosPacienteEnfermedad) => {
      const { idpaciente,idenfermedad} = datosPacienteEnfermedad;
    
      con.query(
        'INSERT INTO paciente_enfermedad (idpaciente,idenfermedad) VALUES (?,?)',
        [idpaciente,idenfermedad],
        function(err, result) {
          if (err) throw err;
          io.emit('update')
          // console.log('Cuenta insertada con éxito');
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });
    
    socket.on('editPacienteEnfermedad', (datosPacienteEnfermedad) => {
      const { id, idpaciente,idenfermedad} = datosPacienteEnfermedad;
    
      con.query(
        `UPDATE paciente_enfermedad SET idpaciente=?,idenfermedad = ? WHERE id = ${id}`,
        [idpaciente,idenfermedad],
        function(err, result) {
          if (err) throw err;
          io.emit('update');
          // console.log('Cuenta actualizada con éxito');
          io.emit('update')
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });

    socket.on('deletePacienteEnfermedad', (id) => {
      con.query(
        'DELETE FROM paciente_enfermedad WHERE id = ?',
        [id],
        function(err, result) {
          if (err) throw err;
          io.emit('update');
          // console.log('Cuenta eliminada con éxito');
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });

    socket.on('getPersonalAreas',()=>{
      con.query(
          'SELECT * FROM personal_areas',
          function(err, PersonalAreas) {
              if (err) throw err;
              io.emit('getPersonalAreas',PersonalAreas)
              // console.log(PersonalAreas)
          }
      );
  })

    socket.on('addPersonalArea', (datosPersonalAreas) => {
      const { idpersonal,idarea} = datosPersonalAreas;

      console.log(idarea,'areaa')
    
      con.query(
        'INSERT INTO personal_areas (idpersonal,idarea) VALUES (?,?)',
        [idpersonal,idarea],
        function(err, result) {
          if (err) throw err;
          io.emit('update')
          console.log('p_area insertada con éxito');
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });
    
    socket.on('editPersonalArea', (datosPersonalAreas) => {
      const { id, idpersonal,idarea} = datosPersonalAreas;
    
      con.query(
        `UPDATE personal_areas SET idpersonal=?,idarea = ? WHERE id = ${id}`,
        [idpersonal,idarea],
        function(err, result) {
          if (err) throw err;
          io.emit('update');
          // console.log('Cuenta actualizada con éxito');
          io.emit('update')
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });

    socket.on('deletePersonalArea', (id) => {
      con.query(
        'DELETE FROM personal_areas WHERE id = ?',
        [id],
        function(err, result) {
          if (err) throw err;
          io.emit('update');
          // console.log('Cuenta eliminada con éxito');
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });

    socket.on('alarmaAzul',(area)=>{
      io.emit('alarmaAzul',area)
    })
})

server.listen(5050,()=>{
    console.log('listen port 5000')
})