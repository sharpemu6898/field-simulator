const botonComienzo = document.getElementById("boton-comienzo");
const portada = document.getElementById("portada");
const simulador = document.getElementById("simulador");

function iniciarSimulador() {
  portada.hidden = true;
  simulador.hidden = false;
}

botonComienzo.addEventListener("click", iniciarSimulador);
