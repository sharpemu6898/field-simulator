const botonComienzo = document.getElementById("boton-comienzo");
const portada = document.getElementById("portada");
const simulador = document.getElementById("simulador");
const lienzo = document.getElementById("lienzo");
const botonesTipoCarga = document.querySelectorAll(".boton-tipo-carga");

const cargas = [];
let valorCargaSeleccionada = 1;

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

function agregarCarga(evento) {
  const posicionLienzo = lienzo.getBoundingClientRect();

  const carga = {
    x: evento.clientX - posicionLienzo.left,
    y: evento.clientY - posicionLienzo.top,
    valor: valorCargaSeleccionada
  };

  cargas.push(carga);
  dibujarEscena(cargas);
}

botonComienzo.addEventListener("click", iniciarSimulador);
lienzo.addEventListener("click", agregarCarga);

botonesTipoCarga.forEach(function (boton) {
  boton.addEventListener("click", seleccionarTipoCarga);
});
