let array = [];
const contenedor = document.getElementById('co');
const myform = document.querySelector('.myform');
const puntuacionUsuario = document.querySelector('.filtroCalificaciones');
const productos = document.querySelectorAll('.productooo');

myform.addEventListener('submit', (e) => {
  e.preventDefault();

  const calificacionUsuario = parseFloat(puntuacionUsuario.value);

  const productosConCalificacion = Array.from(productos).map(producto => {
    const puntuacionTotal = producto.querySelectorAll('.puntuacion');
    const puntuaciones = Array.from(puntuacionTotal).map(puntuacion => parseFloat(puntuacion.getAttribute('data-puntuacion')));
    const calificacionPromedio = puntuaciones.reduce((total, puntuacion) => total + puntuacion, 0) / puntuaciones.length;

    return { producto, calificacion: calificacionPromedio };
  });

  productosConCalificacion.sort((a, b) => b.calificacion - a.calificacion);

  array = [];

  for (let i = 0; i < productosConCalificacion.length; i++) {
    const producto = productosConCalificacion[i];

    if (producto.calificacion >= calificacionUsuario) {
      array.push(producto.producto);
    }
  }

  contenedor.innerHTML = ''; // Limpiar el contenedor antes de agregar los productos filtrados

  for (let g = 0; g < array.length; g++) {
    array[g].style.margin = '2rem';
    contenedor.appendChild(array[g]);
    productos[g].style.display = 'none';
  }

  myform.reset();
});