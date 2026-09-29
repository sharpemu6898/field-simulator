const botonComienzo = document.getElementById("boton-comienzo");
const portada = document.getElementById("portada");
const simulador = document.getElementById("simulador");
const lienzo = document.getElementById("lienzo");
const botonesTipoCarga = document.querySelectorAll(".boton-tipo-carga");
const botonesModo = document.querySelectorAll(".boton-modo");

const cargas = [];
let valorCargaSeleccionada = 1;
let modoLienzo = "agregar";

function iniciarSimulador() {
  portada.hidden = true;
  simulador.hidden = false;

  iniciarRender();
}

function seleccionarTipoCarga(evento) {
  const botonSeleccionado = evento.currentTarget;

  valorCargaSeleccionada = Number(
    botonSeleccionado.dataset.valorCarga
  );

  botonesTipoCarga.forEach(function (boton) {
    const estaSeleccionado = boton === botonSeleccionado;

    boton.classList.toggle("seleccionada", estaSeleccionado);
    boton.setAttribute("aria-pressed", estaSeleccionado);
  });
}

function seleccionarModo(evento) {
  const botonSeleccionado = evento.currentTarget;

  modoLienzo = botonSeleccionado.dataset.modo;

  botonesModo.forEach(function (boton) {
    const estaSeleccionado = boton === botonSeleccionado;

    boton.classList.toggle("seleccionada", estaSeleccionado);
    boton.setAttribute("aria-pressed", estaSeleccionado);
  });
}

function actualizarEscena() {
  const lineas = calcularLineasDeCampo(cargas, {
    ancho: lienzo.clientWidth,
    alto: lienzo.clientHeight,
    paso: 4,
    maxPasos: 1200,
    lineasPorCarga: 12
  });

  dibujarEscena(cargas, lineas);
}

function agregarCarga(x, y) {
  const carga = crearCarga(x, y, valorCargaSeleccionada);

  cargas.push(carga);
  actualizarEscena();
}

function eliminarCarga(x, y) {
  for (let i = cargas.length - 1; i >= 0; i--) {
    const carga = cargas[i];
    const distancia = Math.hypot(x - carga.x, y - carga.y);

    if (distancia <= radioCarga(carga)) {
      cargas.splice(i, 1);
      actualizarEscena();
      return;
    }
  }
}

function manejarClickLienzo(evento) {
  const posicionLienzo = lienzo.getBoundingClientRect();
  const x = evento.clientX - posicionLienzo.left;
  const y = evento.clientY - posicionLienzo.top;

  if (modoLienzo === "eliminar") {
    eliminarCarga(x, y);
    return;
  }

  agregarCarga(x, y);
}

botonComienzo.addEventListener("click", iniciarSimulador);
lienzo.addEventListener("click", manejarClickLienzo);

botonesTipoCarga.forEach(function (boton) {
  boton.addEventListener("click", seleccionarTipoCarga);
});

botonesModo.forEach(function (boton) {
  boton.addEventListener("click", seleccionarModo);
});
