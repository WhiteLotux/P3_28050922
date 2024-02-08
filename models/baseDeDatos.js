const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const ip = require('ip');
const axios = require('axios');
const { secretKey,apiKeyy} = process.env;
const jwt = require('jsonwebtoken');
// Crear la base de datos
const dbname = path.join(__dirname,'../db','base.db');
const db = new sqlite3.Database(dbname,{verbose:true,charset:'utf8'},(err)=>{
  if(err) return console.error(err.message);
  console.log('Conexion Exitosa con la Base de Datos')
});

db.serialize(() => {
// Crear la tabla "categorias" si no existe
  db.run(`
    CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
    )
    `);
//------------------------------------------------------------------
// Crear la tabla "Productos" si no existe
  db.run(`
    CREATE TABLE IF NOT EXISTS productos (
    producto_id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    codigo INTEGER NOT NULL,
    precio INTEGER NOT NULL,
    descripcion TEXT NOT NULL,
    calidad TEXT NOT NULL,
    cantidad INTEGER NOT NULL,
    categoria_id INTEGER,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    )
    `);
//-----------------------------------------------------------------
  db.run(`
    CREATE TABLE IF NOT EXISTS imagenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    destacado INTEGER DEFAULT 0,
    productoID INTEGER,
    FOREIGN KEY (productoID) REFERENCES productos(producto_id)
    )
    `);

  db.run(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    cedula INTEGER NOT NULL,
    correo VARCHAR NOT NULL,
    password VARCHAR NOT NULL 
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS compras (
    compras_id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_de_usuario TEXT,
    apellido TEXT,
    cedula INTEGER,
    marca_dispositivo TEXT,
    cliente_id INTEGER,
    producto_id INTEGER,
    cantidad INTEGER,
    total_pagado REAL,
    fecha TIMESTAMP NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
    ip_cliente TEXT,
    codigo INTEGER,
    numeroT INTEGER,
    cvv INTEGER,
    mesV TEXT,
    year INTEGER,
    currency TEXT,
    descripcion TEXT
);
CREATE TRIGGER set_fecha AFTER INSERT ON compras
BEGIN
  UPDATE compras
  SET fecha = strftime('%Y-%m-%d %H:%M:%S', 'now')
  WHERE cliente_id = new.cliente_id
    AND producto_id = new.producto_id
    AND cantidad = new.cantidad
    AND total_pagado = new.total_pagado
    AND ip_cliente = new.ip_cliente;
END;
`);

});

function aggDato(req,res){
  const {nombre,codigo,precio,descripcion,calidad,cantidad,categoria} = req.body;

  const sql = `INSERT INTO productos(nombre, codigo, precio, descripcion, calidad, cantidad , categoria_id) 
  VALUES (?, ?, ?, ?, ?, ? , ?)`;

  db.run(sql, [nombre, codigo, precio, descripcion, calidad, cantidad , categoria], err => {
    if (err) return console.error(err.message);
    console.log('Registros Ingresados Correctamente a la base de datos ');
    res.redirect('/productos');
  });
}

function mostrarProductos(req,res){
 const sql = `SELECT * FROM productos`;
 db.all(sql,[],(err,rows)=>{
  console.log(rows,);
  if(err) return console.error(err.message);
  console.log('Leyendo Tabla productos...')
  res.render('productos.ejs',{modelo:rows});
})
}

function mostrarUpdate(req,res){

  const id = req.params.id;
  const sql = `SELECT * FROM productos WHERE producto_id = ?`;
  db.get(sql, [id], (err, row) => {
    if (err) return console.error(err.message);
    res.render('update.ejs', {modelo:row});
  })

}

function update(req,res){
  const id = req.params.id;

  const {nombre,codigo,precio,descripcion,calidad,cantidad,categoria} = req.body;
  
  const sql = `UPDATE productos SET nombre = ?, codigo = ?, precio = ?, descripcion = ?, calidad = ?, cantidad = ?, categoria_id = ? WHERE producto_id = ?`;

  db.run(sql, [nombre,codigo, precio,descripcion,calidad, cantidad , categoria , id], err => {
    if (err) return console.error(err.message);
    console.log(`producto actualizado = Producto : ${id}`);
    res.redirect('/productos');
  });

}
//-----------------------------------------------
function getImagen(req,res){
  const id = req.params.id; 
  const sql = `SELECT * FROM productos WHERE producto_id = ?`
  db.get(sql, [id], (err, row) => {
    console.log(row,'+++++++++++++++');
    if (err){
      res.status(500).send({ error: err.message });
      return console.error(err.message);
    }
    res.render('addImagen.ejs', { modelo:row});
  });
 //const sql = `SELECT * FROM productos WHERE producto_id = ?`; 
}
//---------------------------------------------------------
function mostrarDelete(req,res){
  const id = req.params.id;
  const sql = `SELECT * FROM productos WHERE producto_id = ?`;

  db.get(sql, [id], (err, row) => {
    if (err){
      res.status(500).send({ error: err.message });
      return console.error(err.message);
    }
    res.render('delete.ejs', { modelo:row});
  });
}

function deletee(req,res){
 const id = req.params.id;
 console.log('Consulta Eliminar');
 const sql = `
 DELETE FROM productos WHERE producto_id = ?
 `;
 db.run(sql, [id], err => {
  if (err) {
    res.status(500).send({ error: err.message });
    return console.error(err.message);
  }
  console.log('Producto eliminado');
  res.redirect('/productos');
});
}

//_-------------------------------------------------
function aggIMG(req,res){
  const id = req.params.id;
  console.log(req.file);
  const file = `/uploads/${req.file.filename}`;
  const rutaAbsoluta = `${req.protocol}://${req.get('host')}${file}`;
  console.log(file);
  const {destacado} = req.body;
  const sql = `INSERT INTO imagenes(url,destacado,productoID) 
  VALUES (?,?,?)`;
  db.run(sql, [rutaAbsoluta,destacado,id], err => {
    if (err) return console.error(err.message);
    console.log('URL de imagen Insertada Correctamente');
    res.redirect('/productos');
  });

}
//----------------------------------------------------

function getCategorias(req,res){
 const sql = `SELECT * FROM categorias`;
 db.all(sql,[],(err,rows)=>{
   console.log(rows,);
   if(err) return console.error(err.message);
   console.log('Leyendo Tabla categorias...')
   res.render('categorias.ejs',{modelo:rows});
 })
}

function postCategorias(req,res){
  const {nombre} = req.body
  const sql = `INSERT INTO categorias(nombre) 
  VALUES (?)`;

  db.run(sql, [nombre], err => {
    if (err) return console.error(err.message);
    console.log('categoria ingresada correctamente');
    res.redirect('/categorias');
  });

}

function mostrarUpdateC(req,res){
  //Este metodo es el GET
  const id = req.params.id;
  const sql = `SELECT * FROM categorias WHERE id = ?`;
  db.get(sql, [id], (err, row) => {
    console.log(row);
    if (err) return console.error(err.message);
    res.render('updateCategorias.ejs', {modelo:row});
  })
}

function updateCateg(req,res){
//Este metodo es el POST
   const id = req.params.id;

  const {nombre} = req.body;
  
  const sql = `UPDATE categorias SET nombre = ? WHERE id = ?`;

  db.run(sql, [nombre,id], err => {
  if (err) return console.error(err.message);
  console.log(`Categoria actualizada = Categoria : ${id}`);
  res.redirect('/categorias');
  });

}
//------------------------------------------------------------
function filtrar(req,res){

const busqueda = req.body.busqueda;
console.log(busqueda,"dato filtrar----");

const sql = `SELECT productos.*, imagenes.url
FROM productos
LEFT JOIN imagenes ON productos.producto_id = imagenes.productoID WHERE nombre = ? OR descripcion = ? OR categoria_id = ? OR calidad = ? OR cantidad = ?`;

db.all(sql,[busqueda,busqueda,busqueda,busqueda,busqueda],(err,rows)=>{
  console.log(rows,'base de datos desde la peticion del cliente');

  if(err){
     console.error(err.message);
      res.status(500).send('Error en el servidor');
      return;
  }

 res.json({producto:rows});
})  
  
}
//-------------------------------------------------------
function filtrar2(req,res){

const busqueda = req.query.busqueda;

const sql = `SELECT productos.*, imagenes.url
FROM productos
LEFT JOIN imagenes ON productos.producto_id = imagenes.productoID WHERE nombre = ? OR descripcion = ? OR categoria_id = ? OR calidad = ? OR cantidad = ?`;

db.all(sql,[busqueda,busqueda,busqueda,busqueda,busqueda],(err,rows)=>{
  console.log(rows,'base de datos');

  if(err){
     console.error(err.message);
      res.status(500).send('Error en el servidor');
      return;
  }

 res.json({producto:rows})

})  
  
}
//-------------------------------------------------------
  function ClientesGET(req,res){
  
  const sql =`SELECT p.*, i.url AS imagen_url
             FROM productos p
             LEFT JOIN imagenes i ON p.producto_id = i.productoID
             WHERE i.destacado = 1
             GROUP BY p.producto_id`;

  db.all(sql,[],(err, rowsProduct) => {
    console.log(rowsProduct,'....+..+....');
  
//-------------------------------------------
       if (err){
      console.error(err.message);
      res.status(500).send('Error en el servidor');
      return;
    } 
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
      // Envío de la respuesta con los resultados
      res.render('clientes.ejs',{
        producto:rowsProduct
      });
      


    });

}
//--------------------------------------------------
function detalles(req,res){
  const id = req.params.id;
  const sql = `SELECT imagenes.url, productos.*
               FROM imagenes
               INNER JOIN productos ON imagenes.productoID = productos.producto_id
               WHERE imagenes.productoID = ?`;
  db.all(sql,[id],(err,rowsImagenes)=>{
    console.log(rowsImagenes,'plantilla detalles');
     if (err){
      console.error(err.message);
      res.status(500).send('Error en el servidor');
      return;
    } 
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
      // Envío de la respuesta con los resultados
      res.render('detalles.ejs',{
        imagenes:rowsImagenes
      });

  });
}
function deleteCategoriaGET(req,res){

const id = req.params.id;
const sql = `DELETE FROM productos WHERE categoria_id IN (SELECT id FROM categorias WHERE id = ?);`;
 db.run(sql, [id], err => {
    if (err) {
      res.status(500).send({ error: err.message });
      return console.error(err.message);
    }

    const sql2=`DELETE FROM categorias WHERE id = ?`;

    db.run(sql2,[id],er=>{
    
    if(er){
       res.status(500).send({ error: err.message });
       return console.error(err.message);
    }
    console.log('Categoria eliminada');
    res.redirect('/categorias');
    })

  });
}
//--------------------------------------------------
function loginUsers(req,res){
  res.render('loginUsers.ejs');
}
//_-------------------------------------------------
function registroUsers(req,res){
  res.render('registroUsers.ejs');
}
//--------------------------------------------------
function registroUsuariosPost(req,res){
  const {nombre,apellido,cedula,email,contrasena} = req.body;
  const sql=`INSERT INTO usuarios(nombre,apellido,cedula,correo,password)
  VALUES(?,?,?,?,?)`;
  
  db.run(sql,[nombre,apellido,cedula,email,contrasena],e=>{

 if(e) return console.error(e.message);

 res.cookie('registro','exito',{httpOnly:true,secure:true});
 res.redirect('/loginUsers');
 });

}

function postLoginCliente(req,res){

  const {email,password} = req.body;

  const dato = {
    email:email,
    password:password,
    cedula:''
  }

  const sql = 'SELECT * FROM usuarios WHERE correo = ? AND password = ?';

  db.get(sql,[dato.email,dato.password],(err,datos)=>{
  
 if(err) return console.error(err.message);

if(datos){

 if(datos.correo == dato.email && datos.password == dato.password){
  dato.cedula=datos.cedula;
  const token = jwt.sign({user:dato},secretKey,{expiresIn:60 * 60 * 24});

   // Guardar token en cookies
  res.cookie('token', token, { httpOnly: true, secure: true });

  res.redirect('/clientes');
 } 

}else{
  res.json({Error:'Contraseña O Usuario Incorrecto , vuelve a intentarlo'});
}


  })
  
}
//--------------------------------------------------
function comprar(req,res){
  //Datos del usuario provenientes del Token
  const userEmail = req.user.email;
  const cedula = req.user.cedula;
  console.log(cedula,'cedula');

  console.log(`Datos del usuario proveniente del token : ${userEmail}`);
  //id del producto en cuestión
  const id = req.params.id;
  //Direccion IP
  //const ipAddress = req.ip;
  const ipAddress = ip.address();
  console.log(`Direccion IP---${ipAddress}`);

  console.log(typeof ipAddress);

  const sql=`SELECT usuarios.id, usuarios.nombre AS nombre_usuario, usuarios.apellido, usuarios.cedula, productos.*
FROM usuarios, productos
WHERE usuarios.correo = ? AND productos.producto_id = ?;`

db.all(sql,[userEmail,id],(error,data)=>{
if(error) return console.log(`ERROR[-::-]${error}`);

console.log(data[0]); 

 res.render('comprar.ejs',{
        resultado:data[0],
        ip:{ipAddress,cedula}
      });

});
  
}
//--------------------------------------------------
async function comprarPOST(req,res){

let data;

const {nombre_de_usuario,apellido,cedula,telefono,cliente_id,producto_id,cantidad,total_pagado,codigo,ip_cliente,numeroT,cvv,mesV,year,currency,descripcion} = req.body;

    const paymentData = {
    "amount": total_pagado,
    "card-number":numeroT,
    "cvv":cvv,
    "expiration-month":mesV,
    "expiration-year":year,
    "full-name": "APROVED",
    "currency":currency,
    "description":descripcion,
    "reference":codigo
};
    await axios.post('https://fakepayment.onrender.com/payments', paymentData, {
      headers:{
        Authorization: `Bearer ${apiKeyy}`
      },
    })
    .then(response=>{
    data = response.data;
    console.log(response,'datos de la transaction');
    if(data){
       res.cookie('transaccion', data, { httpOnly: true, secure: true });
       console.log(data,'transaction');
    }else{
      console.log('error al comprobar tarjeta de credito');
    }
   
    
    })
    .catch(err=>{
    console.error(err.message);
    });

const sql = `INSERT INTO compras(nombre_de_usuario,apellido,cedula,marca_dispositivo,cliente_id,producto_id,cantidad,total_pagado,ip_cliente,codigo,numeroT,cvv,mesV,year,currency,descripcion) 
VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

db.run(sql,[nombre_de_usuario,apellido,cedula,telefono,cliente_id,producto_id,cantidad,total_pagado,ip_cliente,codigo,numeroT,cvv,mesV,year,currency,descripcion],(err)=>{
  if(err) return console.error(err.message);

    res.redirect('/clientes');
   
});

}

function mostrarUsers(req,res){

const SQL = `SELECT * FROM usuarios`;

db.all(SQL,[],(err,rows)=>{
if(err) return console.error(err.message);
res.render('userList.ejs',{modelo:rows})
})

}

function MostrarCompras(req,res){

const SQL = `SELECT * FROM compras`;

db.all(SQL,[],(err,rows)=>{
if(err) return console.error(err.message);
res.render('mostrarCompras.ejs',{modelo:rows});
})

}

function addUsers(req,res){
res.render('addUsers.ejs');
}

function addUsersPost(req,res){

const {nombre,apellido,cedula,correo,password} = req.body;

const sql = `INSERT INTO usuarios(nombre,apellido,cedula,correo,password) VALUES(?,?,?,?,?)`;

db.run(sql,[nombre,apellido,cedula,correo,password],(err)=>{

if(err) return console.error(err.message);

res.redirect('/usuarios');

})

}

function updateUser(req,res){

  const id = req.params.id;

  const sql = `SELECT * FROM usuarios WHERE id = ?`; 

  db.get(sql,[id],(err,datos)=>{
  if(err) return console.error(err.message);
  res.render('updateUser.ejs',{modelo:datos});
  })

}

function updateUserPost(req,res){
  const {nombre,apellido,cedula,correo,password} = req.body;
  const id = req.params.id;
  const sql = `UPDATE usuarios SET nombre = ?, apellido = ? , cedula = ? , correo = ? , password = ? WHERE id = ?`;
  db.run(sql,[nombre,apellido,cedula,correo,password,id],(err)=>{
  if(err) return console.error(err.message);
  res.redirect('/usuarios');
  })
}

function deleteUser(req,res){
  const id = req.params.id;
  const sql = `DELETE FROM usuarios WHERE id = ?`;
  db.run(sql,[id],(e)=>{
  if(e) return console.error(e.message);
  res.redirect('/usuarios');
  })
}

function deleteCompra(req,res){
  const id = req.params.id;
  const sql = `DELETE FROM compras WHERE compras_id = ?`;
  db.run(sql,[id],(e)=>{
    if(e) return console.error(e.message);
    res.redirect('/compras');
  })
}
//_-------------------------------------------------
module.exports={
 aggDato,
 mostrarProductos,
 mostrarUpdate,
 update,
 mostrarDelete,
 deletee,
 aggIMG,
 getCategorias,
 postCategorias,
 mostrarUpdateC,
 updateCateg,
 filtrar,
 filtrar2,
 ClientesGET,
 getImagen,
 detalles,
 deleteCategoriaGET,
 loginUsers,
 registroUsers,
 registroUsuariosPost,
 postLoginCliente,
 comprar,
 comprarPOST,
 mostrarUsers,
 MostrarCompras,
 addUsers,
 addUsersPost,
 updateUser,
 updateUserPost,
 deleteUser,
 deleteCompra
}
