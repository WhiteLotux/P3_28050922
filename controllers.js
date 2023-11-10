//Librerias y dependencias
require('dotenv').config();
const multer = require('multer');
const http = require('http');
const express = require('express');
const app = express();
const path = require('path');
const bodyParser= require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
const baseDatosModels = require('./models/baseDeDatos.js');
const {PASSWORD,ADMIN} = process.env;
let login= false;
let ext;
//++++++++++++++++++++++++++++++++++++++
function getContentType(extname) {
  switch (extname) {
    case '.html':
      return 'text/html';
    case '.css':
      return 'text/css';
    case '.js':
      return 'text/javascript';
    case '.json':
      return 'application/json';
    case '.png':
      return 'image/png';
    case '.jpg':
      return 'image/jpg';
    case 'jpeg':
      return 'image/jpeg';
    default:
      return 'text/plain';
  }
}
function getContentTypee(extname) {
  switch (extname) {
    case '.html':
      return '.html';
    case '.css':
      return '.css';
    case '.js':
      return '.js';
    case '.json':
      return '.json';
    case '.png':
      return '.png';
    case '.jpg':
      return '.jpg';
    case 'jpeg':
      return '.jpeg';
    default:
      return null;
  }
}
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './static/uploads')
  },
  filename: function (req, file, cb) {
    ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + getContentTypee(ext))
  }
})

let upload = multer({ storage: storage });

//recursos que se van a cargar en el server 
app.use(express.static(__dirname+'/static'));

//-----------------------------------------------------------------
//Configuración del Servidor
app.set('view engine','ejs');//definimos el motor de plantilla con archivos ejs
app.set('views',path.join(__dirname,"./views"));//definimos la ruta del motor de plantilla
app.use(express.urlencoded({extended:false}));//permite recuperar los valores publicados en un request
port = app.listen(5000);
console.log('Servidor corriendo exitosamente en el puerto 5000');



//-----------------------------------------------------------
//enruptamiento
app.get('/',(req,res)=>{
  res.render('index.ejs')
});

app.get('/login',(req,res)=>{
res.render('iniciarSesion.ejs');
});


app.post('/login',(req,res)=>{

 const {admin,password} = req.body;

   if(admin === ADMIN && password === PASSWORD){
    login=true;
    res.redirect('/productos');
   }else{
    login=false;
    res.redirect('/iniciarSesion');
   }

});
  

app.get('/add',(req,res)=>{
res.render('add.ejs');
});

//---------------------------------------------------------
app.get('/addImagen',(req,res)=>{
res.render('addImagen.ejs');
});


app.post('/addImagen',upload.single('img'),(req,res)=>{
baseDatosModels.aggIMG(req,res);
});


app.post('/addPost',(req,res)=>{   
baseDatosModels.aggDato(req,res);
});


app.get('/productos',(req,res)=>{
  baseDatosModels.mostrarProductos(req,res);
});
//-------------------------------------------------------
// GET /editar/:id
app.get('/update/:id',(req, res) => {
baseDatosModels.mostrarUpdate(req,res);

});
//-------------------------------------------------------
// POST /editar/:id
app.post('/update/:id', (req, res) => {
 baseDatosModels.update(req,res);
});
//-------------------------------------------------------
// GET /eliminar/:id
app.get('/delete/:id', (req, res) => {
 baseDatosModels.mostrarDelete(req,res);
});
//-------------------------------------------------------
// POST /eliminar/:id
app.post('/delete/:id', (req, res) => {
 baseDatosModels.deletee(req,res);
});
//------------------------------------------------------
app.get('/categorias', (req, res) => {
 baseDatosModels.getCategorias(req,res);
});
//-------------------------------------------------------
app.get('/addCategorias', (req, res) => {
 res.render('addcategoria.ejs');
});
//-------------------------------------------------------
app.post('/addcategorias', (req, res) => {
 baseDatosModels.postCategorias(req,res);
});
//-------------------------------------------------------
app.get('/updateCategoria/:id',(req,res)=>{
 baseDatosModels.mostrarUpdateC(req,res);
});
//-------------------------------------------------------
app.post('/updateCategoria/:id',(req,res)=>{
baseDatosModels.updateCateg(req,res);
});
//-------------------------------------------------------
//Metodo para manejar rutas no encontradas
app.get('/*',(req,res)=>{
res.render('notfound.ejs')
});
//-------------------------------------------------------
