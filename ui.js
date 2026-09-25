const botonComienzo = document.getElementById("boton-comienzo");
const portada = document.getElementById("portada");
const simulador = document.getElementById("simulador");
const lienzo = document.getElementById("lienzo");

const cargas = [];

function iniciarSimulador() {
  portada.hidden = true;
  simulador.hidden = false;

  iniciarRender();
}

function agregarCarga(evento) {
  const posicionLienzo = lienzo.getBoundingClientRect();

  const carga = {
    x: evento.clientX - posicionLienzo.left,
    y: evento.clientY - posicionLienzo.top,
    valor: 1
  };

  cargas.push(carga);
  dibujarEscena(cargas);
}

botonComienzo.addEventListener("click", iniciarSimulador);
lienzo.addEventListener("click", agregarCarga);
