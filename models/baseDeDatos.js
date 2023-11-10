const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Crear la base de datos
const dbname = path.join(__dirname,'../db','base.db');
const db = new sqlite3.Database(dbname,err=>{
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
    cantidad TEXT NOT NULL,
    categoria_id INTEGER,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
  )
`);
//-----------------------------------------------------------------
db.run(`
  CREATE TABLE IF NOT EXISTS imagenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    destacado TEXT
  )
`);

});

function aggDato(req,res){
const {nombre,codigo,precio,descripcion,calidad,cantidad} = req.body;
    
const sql = `INSERT INTO productos(nombre, codigo, precio, descripcion, calidad, cantidad) 
    VALUES (?, ?, ?, ?, ?, ?)`;

db.run(sql, [nombre, codigo, precio, descripcion, calidad, cantidad], err => {
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

  const {nombre,codigo,precio,descripcion,calidad,cantidad} = req.body;
  
  const sql = `UPDATE productos SET nombre = ?, codigo = ?, precio = ?, descripcion = ?, calidad = ?, cantidad = ? WHERE producto_id = ?`;

  db.run(sql, [nombre,codigo, precio,descripcion,calidad, cantidad,id], err => {
  if (err) return console.error(err.message);
  console.log(`producto actualizado = Producto : ${id}`);
  res.redirect('/productos');
  });

}

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
  console.log(req.file);
let ruta = req.file.path.split('\\');
const file = `/${ruta[1]}/${ruta[2]}`;
const {destacado} = req.body;
const sql = `INSERT INTO imagenes(url,destacado) 
    VALUES (?,?)`;
db.run(sql, [file,destacado], err => {
    if (err) return console.error(err.message);
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
 updateCateg
 
}