    import express from 'express';
    import { Server } from 'socket.io';
    import http, { validateHeaderValue } from 'http';
    import mysql from 'mysql';
    import cors from 'cors';

    var agricoinID = []
    var converciones = []
    var inventario = []
    const PORT = process.env.PORT || 3306

    var con = mysql.createConnection({
    host: 'b693cggu5p6zctakxeh7-mysql.services.clever-cloud.com',
    user: 'ursmb3tdazhghxxv',
    password: '8h1IaeK9gGIS8Phkghne',
    database: 'b693cggu5p6zctakxeh7',
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

    function getAgricoin(){
        con.query(
            'SELECT * FROM agricoins',
            function(err, agricoins) {
                if (err) throw err;
                agricoinID = agricoins
                io.emit('putAgricoins',agricoins)
                console.log(agricoins)
            }
        );
    }

    io.on('connection',(socket)=>{
        // console.log('CONNECTED::' + socket.id)
        socket.on('getUsuarios',()=>{
            con.query(
                'SELECT * FROM usuarios',
                function(err, usuarios) {
                    if (err) throw err;
                    io.emit('putUsuarios',usuarios)
                    // console.log(usuarios)
                }
            );
        })

        socket.on('getAgricoins',()=>{
            getAgricoin()
        })

        socket.on('getSectores',()=>{
            con.query(
                'SELECT * FROM sectores',
                function(err, sectores) {
                    if (err) throw err;
                    io.emit('putSectores',sectores)
                    // console.log(sectores)
                }
            );
        })

        socket.on('getProductos',()=>{
            con.query(
                'SELECT * FROM productos',
                function(err, productos) {
                    if (err) throw err;
                    io.emit('putProductos',productos)
                    // console.log(productos)
                }
            );
        })

        socket.on('getTransacciones',()=>{
            con.query(
                'SELECT * FROM transacciones',
                function(err, Transacciones) {
                    if (err) throw err;
                    io.emit('putTransacciones',Transacciones)
                    // console.log(Transacciones)
                }
            );
        })

        socket.on('getTransaccionesPen',()=>{
            con.query(
                'SELECT * FROM transacciones_pen',
                function(err, Transacciones_pen) {
                    if (err) throw err;
                    io.emit('putTransaccionesPen',Transacciones_pen)
                    // console.log(Transacciones_pen)
                }
            );
        })

        socket.on('getCargos',()=>{
            con.query(
                'SELECT * FROM cargos',
                function(err, cargos) {
                    if (err) throw err;
                    io.emit('putCargos',cargos)
                    console.log(cargos)
                }
            );
        })

        socket.on('getConversiones',()=>{
            con.query(
                'SELECT * FROM conversiones',
                function(err, conversionesDB) {
                    if (err) throw err;
                    converciones = conversionesDB
                    io.emit('putConversiones',conversionesDB)
                    console.log(conversionesDB)
                }
            );
        })

        socket.on('deleteConversion',(id)=>{
            con.query(
                `DELETE FROM \`conversiones\` WHERE \`idconversion\` = '${id}'`,
                function(err, result) {
                if (err) throw err;
                io.emit('cambiosConversiones')
                console.log("conversion eliminada:", result);
                }
            );
        })

        socket.on('updateConversion',(data)=>{
            const { id, idproducto,agricoin} = data;
        
            con.query(
            `UPDATE conversiones SET idproducto = ? , agricoin = ? WHERE idconversion = ${id}`,
            [idproducto,agricoin],
            function(err, result) {
                if (err) throw err;
                io.emit('cambiosConversiones');
            }
            );
        })

        socket.on('crearConversion',(data)=>{
            const {idproducto,agricoin} = data
            con.query(
                `INSERT INTO \`conversiones\` (\`idproducto\`, \`agricoin\`) VALUES ('${idproducto}','${agricoin}')`,
                function(err, conversiones) {
                    if (err) throw err;
                    io.emit('cambiosConversiones')
                }
            ); 
        })

        socket.on('sendTransaccion',(data)=>{
            console.log(data)
            const {idusuario,idsectorO,idsectorD,idproducto,cantidad,fecha} = data
            con.query(
                `INSERT INTO \`transacciones_pen\` (\`idusuario\`, \`idsector_o\`, \`idsector_d\`, \`idproducto\`, \`cantidad\`, \`fecha\`) VALUES ('${idusuario}','${idsectorO}','${idsectorD}','${idproducto}','${cantidad}','${fecha}')`,
                function(err, Transacciones) {
                    if (err) throw err;
                    console.log(Transacciones)
                    io.emit('cambiosTransacciones')
                }
            );        
        })

        socket.on('createAccount',(data)=>{
            console.log(data,'data cuebta')
            const {apenom,password,dni,cargo,admin} = data
            console.log(admin)
            var validacion ;
            if(admin){
                validacion = 1
            }else{
                validacion = 0
            }
            con.query(
                `INSERT INTO \`usuarios\` (\`apenom\`, \`dni\`, \`password\`, \`idcargo\`, \`admin\`) VALUES ('${apenom}','${dni}','${password}','${cargo}','${validacion}')`,
                function(err, account) {
                    if (err) throw err;
                    console.log(account)
                    io.emit('cambiosUser')
                }
            );        
        })

        socket.on('updateAccount',(data)=>{
            const { idusuario, apenom,password,dni,cargo,admin} = data;
        
            con.query(
            `UPDATE usuarios SET apenom = ? , password = ? , dni=? , idcargo=?,admin = ? WHERE idusuario = ${idusuario}`,
            [apenom,password,dni,cargo,admin],
            function(err, result) {
                if (err) throw err;
                io.emit('cambiosUser');
            }
            );
        })

        socket.on('deleteAccount',(id)=>{
            con.query(
                `DELETE FROM \`usuarios\` WHERE \`idusuario\` = '${id}'`,
                function(err, result) {
                if (err) throw err;
                io.emit('cambiosUser')
                }
            );
        })

        socket.on('createSector',(data)=>{
            console.log(data,'data sector')
            const {nombre} = data
            con.query(
                `INSERT INTO \`sectores\` (\`nombre\`) VALUES ('${nombre}')`,
                function(err, sector) {
                    if (err) throw err;
                    console.log(sector)
                    con.query(
                        `INSERT INTO \`productos\` (\`nombre\`, \`idsector\`) VALUES ('${'Agricoin'}','${sector.insertId}}')`,
                        function(err, producto) {
                            if (err) throw err;
                            console.log(producto)
                            con.query(
                                `INSERT INTO \`inventario\` (\`idsector\`, \`idproducto\`, \`cantidad\`) VALUES ('${sector.insertId}','${producto.insertId}','${0}')`,
                                function(err, inventario) {
                                    if (err) throw err;
                                    con.query(
                                        `INSERT INTO \`agricoins\` (\`idproducto\`,\`idinventario\`) VALUES ('${producto.insertId}','${inventario.insertId}')`,
                                        function(err, agricoins) {
                                            if (err) throw err;
                                            console.log(agricoins)
                                            getAgricoin()
                                        }
                                    );  
                                    console.log(inventario)
                                    io.emit('cambiosInventario')
                                }
                            );  
                            io.emit('cambiosProductos')
                        }
                    ); 
                    io.emit('cambiosSectores')
                }
            );   
        })

        socket.on('updateSector',(data)=>{
            const { idsector,nombre} = data;
        
            con.query(
            `UPDATE sectores SET nombre = ?  WHERE idsector = ${idsector}`,
            [nombre],
            function(err, result) {
                if (err) throw err;
                io.emit('cambiosSectores')
            }
            );
        })

        socket.on('deleteSector',(id)=>{
            con.query(
                `DELETE FROM \`sectores\` WHERE \`idsector\` = '${id}'`,
                function(err, result) {
                if (err) throw err;
                io.emit('cambiosSectores')
                }
            );
        })

        socket.on('createCargo',(data)=>{
            console.log(data,'data sector')
            const {cargo} = data
            con.query(
                `INSERT INTO \`cargos\` (\`cargo\`) VALUES ('${cargo}')`,
                function(err, cargo) {
                    if (err) throw err;
                    console.log(cargo)
                    io.emit('cambiosCargos')
                }
            );   
        })

        socket.on('updateCargo',(data)=>{
            const { idcargo,nombre} = data;
        
            con.query(
            `UPDATE cargos SET cargo = ?  WHERE idcargo = ${idcargo}`,
            [nombre],
            function(err, result) {
                if (err) throw err;
                io.emit('cambiosCargos')
            }
            );
        })

        socket.on('deleteCargo',(id)=>{
            con.query(
                `DELETE FROM \`cargos\` WHERE \`idcargo\` = '${id}'`,
                function(err, result) {
                if (err) throw err;
                io.emit('cambiosCargos')
                }
            );
        })

        socket.on('createProd',(data)=>{
            console.log(data,'data sector')
            const {nombre,idsector} = data
            con.query(
                `INSERT INTO \`productos\` (\`nombre\`, \`idsector\`) VALUES ('${nombre}','${idsector}}')`,
                function(err, producto) {
                    if (err) throw err;
                    console.log(producto)
                    
                    con.query(
                        `INSERT INTO \`inventario\` (\`idsector\`, \`idproducto\`, \`cantidad\`) VALUES ('${idsector}','${producto.insertId}','${0}')`,
                        function(err, producto) {
                            if (err) throw err;
                            console.log(producto)
                            io.emit('cambiosInventario')
                        }
                    );  

                    con.query(
                        `INSERT INTO \`conversiones\` (\`idproducto\`, \`agricoin\`) VALUES ('${producto.insertId}','${1}')`,
                        function(err, conversiones) {
                            if (err) throw err;
                            io.emit('cambiosConversiones')
                        }
                    ); 
                    io.emit('cambiosProductos')
                }
            );   
        })

        socket.on('updateProducto',(data)=>{
            const { idproducto,nombre,idsector} = data;
        
            con.query(
            `UPDATE productos SET nombre = ?,idsector = ?  WHERE idproducto = ${idproducto}`,
            [nombre,idsector],
            function(err, result) {
                if (err) throw err;
                io.emit('cambiosProductos')
            }
            );
        })

        socket.on('deleteProducto',(id)=>{
            const agricoin = agricoinID.find(agricoin => agricoin.idproducto == id)
            // console.log(id,agricoin,agricoinID)
            if(agricoin == undefined){
                con.query(
                    `DELETE FROM \`productos\` WHERE \`idproducto\` = '${id}'`,
                    function(err, result) {
                    if (err) throw err;
                    io.emit('cambiosProductos')
                    }
                );
            }else{
                io.emit('eliminarAgricoin')
            }
        })

        socket.on('getInventario',()=>{
            con.query(
                'SELECT * FROM inventario',
                function(err, inventarioDb) {
                    if (err) throw err;
                    inventario = inventarioDb
                    io.emit('putinventario',inventarioDb)
                    // console.log(inventario)
                }
            );
        })

        socket.on('createInventario',(data)=>{
            console.log(data,'data sector')
            const {idsector,idproducto , cantidad} = data
            con.query(
                `INSERT INTO \`inventario\` (\`idsector\`, \`idproducto\`, \`cantidad\`) VALUES ('${idsector}','${idproducto}','${cantidad}')`,
                function(err, producto) {
                    if (err) throw err;
                    console.log(producto)
                    io.emit('cambiosInventario')
                }
            );   
        })

        socket.on('updateInventario',(data)=>{
            const { id,idsector,idproducto,cantidad} = data;
        
            con.query(
            `UPDATE inventario SET idsector = ?,idproducto = ? , cantidad=? WHERE idinventario = ${id}`,
            [idsector,idproducto,cantidad],
            function(err, result) {
                if (err) throw err;
                io.emit('cambiosInventario')
            }
            );
        })

        socket.on('deleteInventario',(id)=>{
            const inventarioA = agricoinID.find(inventarioA => inventarioA.idinventario == id)
            if(inventarioA == undefined){
                con.query(
                    `DELETE FROM \`inventario\` WHERE \`idinventario\` = '${id}'`,
                    function(err, result) {
                    if (err) throw err;
                    io.emit('cambiosInventario')
                    }
                );
            }else{
                io.emit('inventarioAdeleted')
            }
        })

        socket.on('autorizarPen',(transaccion)=>{
            const invO = inventario.find(inv => inv.idproducto == transaccion.idproducto && inv.idsector == transaccion.idsector_o) 
            const invD = agricoinID.find(invD => invD.idsector == transaccion.idsector_d) 
            const conv = converciones.find(conv => conv.idproducto == transaccion.idproducto)
            console.log(transaccion.idtransaccion_pen,'XDD')
            var cantidadOfinal = parseInt(invO.cantidad) - parseInt(transaccion.cantidad)
            var converFinal = parseInt(conv.agricoin) * parseInt(transaccion.cantidad)
            var cantidadDfinal = parseInt(converFinal)
            con.query(
                `INSERT INTO \`transacciones\` (\`idusuario\`, \`idsector_o\`, \`idsector_d\`, \`idproducto\`, \`cantidad\`, \`fecha\`) VALUES ('${transaccion.idusuario}','${transaccion.idsector_o}','${transaccion.idsector_d}','${transaccion.idproducto}','${transaccion.cantidad}','${transaccion.fecha}')`,
                function(err, trans) {
                    if (err) throw err;
                    con.query(
                        `DELETE FROM \`transacciones_pen\` WHERE \`idtransaccion_pen\` = '${transaccion.idtransaccion_pen}'`,
                        function(err, result) {
                        if (err) throw err;
                        con.query(
                            `UPDATE inventario SET cantidad=? WHERE idinventario = ${invO.idinventario}`,
                            [cantidadOfinal],
                            function(err, result) {
                            if (err) throw err;
                            io.emit('cambiosInventario')
                            }
                        );
                        con.query(
                            `UPDATE inventario SET cantidad=? WHERE idinventario = ${invD.idinventario}`,
                            [cantidadDfinal],
                            function(err, result) {
                            if (err) throw err;
                            io.emit('cambiosInventario')
                            io.emit('cambiosTransacciones')
                            }
                        );
                        console.log("Transacción eliminada:", result);
                        }
                    );
                    console.log(transaccion)
                }
            );   
            io.emit('cambiosTransacciones')
        })

        socket.on('denegarPen',(id)=>{
            con.query(
                `DELETE FROM \`transacciones_pen\` WHERE \`idtransaccion_pen\` = '${id}'`,
                function(err, result) {
                if (err) throw err;
                console.log("Transacción eliminada:", result);
                io.emit('cambiosTransacciones')
                }
            );
        })
    })

    server.listen(PORT,()=>{
        console.log('listen port 5000')
    })
