const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();
var handlebars = require('express-handlebars')
const Recaptcha = require('express-recaptcha').RecaptchaV2;
const recaptcha = new Recaptcha('6LfOBUYpAAAAAN8w1Meatl-oxfr8w4EBhh2Cvsj1', '6LfOBUYpAAAAAO5ERFJseNoPrvc9X0ckgVGdPOkD');
const multer = require('multer');
const http = require('http');
const express = require('express');

const app = express();

const server = http.createServer(app);

const {Server} = require('socket.io');

const io = new Server(server);

io.on('connection',(socket)=>{

console.log('Un usuario se a conectado');

socket.emit('mensajeServer', '¡Hola, cliente!');

socket.on('disconnect',()=>{

console.log('un usuario se a desconectado');

});

});

//recursos que se van a cargar en el server 
app.use(express.static(__dirname+'/static'));

//Configuración del Servidor
app.set('view engine','ejs');//definimos el motor de plantilla con archivos ejs
app.set('views',path.join(__dirname,"./views"));//definimos la ruta del motor de plantilla
app.use(express.urlencoded({extended:false}));//permite recuperar los valores publicados en un request

app.use(cookieParser());
app.use(express.json());
const jwt = require('jsonwebtoken');
const bodyParser= require('body-parser');
//app.use(bodyParser.urlencoded({extended: true}));

const baseDatosModels = require('./models/baseDeDatos.js');
const utils = require('./utils/uploadImg.js');
//middleware para verificar cliente
const {verifyToken} = require('./utils/JWT.js');
//middleware para verificar admin
const {verifyToken2} = require('./utils/JWT2.js');
//Variables de entorno
const {PASSWORD,ADMIN,port,secretKey2} = process.env;
let ext;
//--------------------------------------------------------------
let storage = multer.diskStorage({
  destination: function (req, file, cb){
    cb(null, './static/uploads')
  },
  filename: function (req, file, cb) {
    ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + utils.getContentType(ext))
  }
})

let upload = multer({ storage: storage });

//-----------------------------------------------------------
//enruptamiento
app.get('/',(req,res)=>{
  res.render('index.ejs')
});

app.get('/login',(req,res)=>{
res.render('login.ejs');
});


app.post('/login',(req,res)=>{
 const {admin,password} = req.body;
 const dato= {
  admin,
  password
 }
   if(admin === ADMIN && password === PASSWORD){
    const token = jwt.sign(dato,secretKey2,{expiresIn:60 * 60 * 24});
   // Guardar token en cookies
    res.cookie('token2', token, { httpOnly: true, secure: true });
    res.redirect('/productos');
   }else{
    res.json({ERROR:'Contraseña o usuario incorrecto vuelve a intentarlo'});
   }
});
  

app.get('/add',verifyToken2,(req,res)=>{
res.render('add.ejs');
});

//---------------------------------------------------------
app.get('/addImagen/:id',verifyToken2,(req,res)=>{
baseDatosModels.getImagen(req,res);
});


app.post('/addImagen/:id',upload.single('img'),(req,res)=>{ 
baseDatosModels.aggIMG(req,res);
});


app.post('/addPost',(req,res)=>{   
baseDatosModels.aggDato(req,res);
});


app.get('/productos',verifyToken2,(req,res)=>{
  baseDatosModels.mostrarProductos(req,res);
});
//-------------------------------------------------------
// GET /editar/:id
app.get('/update/:id',verifyToken2,(req, res) => {
baseDatosModels.mostrarUpdate(req,res);

});
//-------------------------------------------------------
// POST /editar/:id
app.post('/update/:id', (req, res) => {
 baseDatosModels.update(req,res);
});
//-------------------------------------------------------
// GET /eliminar/:id
app.get('/delete/:id',verifyToken2,(req, res) => {
 baseDatosModels.mostrarDelete(req,res);
});
//-------------------------------------------------------
// POST /eliminar/:id
app.post('/delete/:id', (req, res) => {
 baseDatosModels.deletee(req,res);
});
//------------------------------------------------------
app.get('/categorias',verifyToken2,(req, res) => {
 baseDatosModels.getCategorias(req,res);
});
//-------------------------------------------------------
app.get('/addCategorias',verifyToken2,(req, res) => {
 res.render('addcategoria.ejs');
});
//-------------------------------------------------------
app.post('/addcategorias', (req, res) => {
 baseDatosModels.postCategorias(req,res);
});
//-------------------------------------------------------
app.get('/updateCategoria/:id',verifyToken2,(req,res)=>{
 baseDatosModels.mostrarUpdateC(req,res);
});
//-------------------------------------------------------
app.post('/updateCategoria/:id',(req,res)=>{
baseDatosModels.updateCateg(req,res);
});
//-------------------------------------------------------
app.get('/eliminarCategoria/:id',(req,res)=>{
baseDatosModels.deleteCategoriaGET(req,res);
})
//-------------------------------------------------------
app.get('/clientes',verifyToken,(req,res)=>{
  console.log('mostrando pagina la cliente!');
baseDatosModels.ClientesGET(req,res);
})
//-------------------------------------------------------
app.post('/cliente',(req, res) => {
 baseDatosModels.filtrar(req,res);
});
//-------------------------------------------------------
app.get('/clientico',(req, res) => {
 baseDatosModels.filtrar2(req,res);
});
//-------------------------------------------------------
//-------------------------------------------------------
app.get('/ruta', (req, res) => {
  const {nombre,codigo,precio,descripcion,calidad,cantidad,url} = req.query;

  let datos = {
    nombre:nombre,
    codigo:codigo,
    precio:precio,
    descripcion:descripcion,
    calidad:calidad,
    cantidad:cantidad,
    url:url
  }

  console.log(datos,'Valor de Busqueda--por fin');
  res.render('buscar.ejs',{result:datos});

});
//-------------------------------------------------------
app.get('/detalles/:id',verifyToken,(req,res)=>{
baseDatosModels.detalles(req,res);
});
//-------------------------------------------------------
//-------------------------------------------------------
app.get('/loginUsers',(req,res)=>{
baseDatosModels.loginUsers(req,res);
});
//------------------------------------------------------
app.post('/loginUsers',(req,res)=> {
  baseDatosModels.postLoginCliente(req,res);
})
//------------------------------------------------------
app.get('/registroUsers',(req,res)=>{
  baseDatosModels.registroUsers(req,res);
});
//------------------------------------------------------
app.post('/registroUsuariosPost',recaptcha.middleware.verify,(req,res)=>{


   if(!req.recaptcha.error){
    // El reCAPTCHA se ha verificado correctamente
     baseDatosModels.registroUsuariosPost(req,res); 
  } else{
    // El reCAPTCHA no se ha verificado correctamente
    res.send('Debes validar el Recaptcha');
  } 
})
//------------------------------------------------------
app.get('/mensageDeRegistro',(req,res)=>{
const registro = req.cookies.registro;
if(typeof registro !== 'undefined'){
  res.json({mensaje:registro});
}else{
  res.json({mensaje:false});
}
})
//------------------------------------------------------
app.get('/eliminarMensajeRegistro',(req,res)=>{

if(typeof req.cookies.registro !== 'undefined'){
 res.clearCookie('registro'); 
 res.json({mensaje:'Mensaje_Eliminadooo'});
}else{
  res.json({mensaje:false});
}

})
//------------------------------------------------------
app.get('/comprar/:id',verifyToken,(req,res)=>{
  res.clearCookie('transaccion');
  baseDatosModels.comprar(req,res);
});
//------------------------------------------------------
app.post('/comprarPost',async (req,res)=>{
baseDatosModels.comprarPOST(req,res);
})
//------------------------------------------------------
app.get('/transaction',(req,res)=>{

const transaction = req.cookies.transaccion;

if(typeof transaction !== 'undefined'){
 console.log('transaction desde controllers',transaction);
 res.json({transaction}); 
}else{
res.json({message:false});
}

});
//------------------------------------------------------
app.get('/eliminarTransaction',(req,res)=>{
 res.clearCookie('transaccion');
 res.json({message:'transaccion eliminada'});
})
//------------------------------------------------------
app.get('/usuarios',verifyToken2,(req,res)=>{
baseDatosModels.mostrarUsers(req,res);
})
//------------------------------------------------------
//------------------------------------------------------
app.get('/compras',verifyToken2,(req,res)=>{
baseDatosModels.MostrarCompras(req,res);
})
//------------------------------------------------------
app.get('/addUser',verifyToken2,(req,res)=>{
baseDatosModels.addUsers(req,res);
})
//------------------------------------------------------
app.post('/addUser',(req,res)=>{
  baseDatosModels.addUsersPost(req,res);
})
//------------------------------------------------------
app.get('/updateUser/:id',verifyToken2,(req,res)=>{
baseDatosModels.updateUser(req,res);
})
//------------------------------------------------------
app.post('/updateUser/:id',(req,res)=>{
baseDatosModels.updateUserPost(req,res);
})
//------------------------------------------------------
app.get('/deleteUser/:id',(req,res)=>{
baseDatosModels.deleteUser(req,res);
});
//------------------------------------------------------
app.get('/deleteCompra/:id',(req,res)=>{
baseDatosModels.deleteCompra(req,res);
})
//------------------------------------------------------
//logout cliente
app.get('/logout',(req, res) => {
  //metodo para borrar la cookie
  res.clearCookie('token');
  res.redirect('/');
});
//------------------------------------------------------
//logout administrador
app.get('/logout2',(req, res) => {
  res.clearCookie('token2');
  res.redirect('/');
});
//-------------------------------------------------------
//Metodo para manejar rutas no encontradas
app.get('/*',(req,res)=>{
res.render('notfound.ejs');
});
//-------------------------------------------------------
server.listen(port,()=>{
  console.log(`Servidor corriendo exitosamente en el puerto ${port}`);
});