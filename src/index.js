import express from 'express';
import { Server } from 'socket.io';
import http, { validateHeaderValue } from 'http';
import mysql from 'mysql';
import cors from 'cors';

var con = mysql.createConnection({
  host: 'localhost',
  user: 'c1991871_trans',
  password: 'wazigoFE73',
  database: 'c1991871_trans',
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

    socket.on('getCuentas',()=>{
        con.query(
            'SELECT * FROM cuentas',
            function(err, cuentas) {
                if (err) throw err;
                io.emit('getCuentas',cuentas)
                console.log(cuentas)
            }
        );
    })

    socket.on('addAccount', (datosCuenta) => {
      const { apenom, cbu, alias, cuit, monto, pin ,banco} = datosCuenta;
    
      con.query(
        'INSERT INTO cuentas (apenom, cbu, alias, cuit, monto, pin,banco) VALUES (?, ?, ?, ?, ?,?,?)',
        [apenom, cbu, alias, cuit, monto, pin,banco],
        function(err, result) {
          if (err) throw err;
          io.emit('update')
          console.log('Cuenta insertada con éxito');
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });
    
    socket.on('editAccount', (datosCuenta) => {
      const { idcuenta, apenom, cbu, alias, cuit, monto, pin,banco } = datosCuenta;
    
      con.query(
        `UPDATE cuentas SET apenom = ?, cbu = ?, alias = ?, cuit = ?, monto = ?, pin = ?,banco = ? WHERE idcuenta = ${idcuenta}`,
        [apenom, cbu, alias, cuit, monto, pin,banco],
        function(err, result) {
          if (err) throw err;
          io.emit('update');
          console.log('Cuenta actualizada con éxito');
          io.emit('update')
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });

    socket.on('deleteAccount', (idcuenta) => {
      con.query(
        'DELETE FROM cuentas WHERE idcuenta = ?',
        [idcuenta],
        function(err, result) {
          if (err) throw err;
          io.emit('update');
          console.log('Cuenta eliminada con éxito');
          // Aquí puedes emitir un evento o realizar cualquier otra acción necesaria
        }
      );
    });

})

server.listen(5000,()=>{
    console.log('listen port 5000')
})