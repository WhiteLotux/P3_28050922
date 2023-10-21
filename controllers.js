//Librerias y dependencias
const http = require('http');
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

//-----------------------------------------------------------------

//recursos que se van a cargar 
app.use(express.static(__dirname+'/static'));

//-----------------------------------------------------------------
//Configuración del Servidor
app.set('view engine','ejs');//definimos el motor de plantilla con archivos ejs
app.set('views',path.join(__dirname,"./views"));//definimos la ruta del motor de plantilla
app.use(express.urlencoded({extended:false}));//permite recuperar los valores publicados en un request
app.listen(3000);
console.log('Servidor corriendo exitosamente en el puerto 3000');
//------------------------------------------------------------------
//------------------------------------------------------------------
//--------------------------------------------------
//--------------------------------------------------
//--------------------------------------------------
//--------------------------------------------------
//enruptamiento
app.get('/',(req,res)=>{
res.render('index.ejs');
});

//-------------------------------------------------------
//Metodo para manejar rutas no encontradas
app.get('/*',(req,res)=>{
res.render('notfound.ejs')
});
//-------------------------------------------------------
