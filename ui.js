const botonComienzo = document.getElementById("boton-comienzo");
const portada = document.getElementById("portada");
const simulador = document.getElementById("simulador");
const lienzo = document.getElementById("lienzo");
const botonesTipoCarga = document.querySelectorAll(".boton-tipo-carga");
const botonesModo = document.querySelectorAll(".boton-modo");
const botonEquipotenciales = document.getElementById(
  "boton-equipotenciales"
);
const valorPosicion = document.getElementById("valor-posicion");
const valorEx = document.getElementById("valor-ex");
const valorEy = document.getElementById("valor-ey");
const valorCampo = document.getElementById("valor-campo");
const valorPotencial = document.getElementById("valor-potencial");

const cargas = [];
let valorCargaSeleccionada = 1;
let modoLienzo = "agregar";
let mostrarEquipotenciales = false;
let posicionCursorPendiente = null;
let cuadroLecturaCursor = null;

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

function alternarEquipotenciales() {
  mostrarEquipotenciales = !mostrarEquipotenciales;

  botonEquipotenciales.classList.toggle(
    "seleccionada",
    mostrarEquipotenciales
  );

  botonEquipotenciales.setAttribute(
    "aria-pressed",
    mostrarEquipotenciales
  );

  actualizarEscena();
}

function actualizarEscena() {
  const ancho = lienzo.clientWidth;
  const alto = lienzo.clientHeight;

  const lineas = calcularLineasDeCampo(cargas, {
    ancho: ancho,
    alto: alto,
    paso: 4,
    maxPasos: 1200,
    lineasPorCarga: 12
  });

  const equipotenciales = mostrarEquipotenciales
    ? calcularEquipotenciales(cargas, null, {
        ancho: ancho,
        alto: alto,
        celda: 12
      })
    : [];

  dibujarEscena(cargas, lineas, equipotenciales);
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

function formatearValor(valor) {
  if (!Number.isFinite(valor)) return "—";

  const valorNormalizado = Math.abs(valor) < 1e-12 ? 0 : valor;
  const magnitud = Math.abs(valorNormalizado);

  if (magnitud !== 0 && (magnitud >= 10000 || magnitud < 0.01)) {
    return valorNormalizado.toExponential(2);
  }

  return valorNormalizado.toFixed(2);
}

function mostrarLecturaCursor(x, y) {
  const campo = calcularCampo(cargas, x, y);
  const potencial = calcularPotencial(cargas, x, y);

  valorPosicion.textContent = `(${x.toFixed(0)}, ${y.toFixed(0)})`;
  valorEx.textContent = formatearValor(campo.ex);
  valorEy.textContent = formatearValor(campo.ey);
  valorCampo.textContent = formatearValor(campo.magnitud);
  valorPotencial.textContent = formatearValor(potencial);
}

function actualizarLecturaCursor() {
  cuadroLecturaCursor = null;

  if (!posicionCursorPendiente) return;

  mostrarLecturaCursor(
    posicionCursorPendiente.x,
    posicionCursorPendiente.y
  );
}

function registrarMovimientoCursor(evento) {
  const posicionLienzo = lienzo.getBoundingClientRect();

  posicionCursorPendiente = {
    x: evento.clientX - posicionLienzo.left,
    y: evento.clientY - posicionLienzo.top
  };

  if (cuadroLecturaCursor === null) {
    cuadroLecturaCursor = requestAnimationFrame(actualizarLecturaCursor);
  }
}

function limpiarLecturaCursor() {
  posicionCursorPendiente = null;

  if (cuadroLecturaCursor !== null) {
    cancelAnimationFrame(cuadroLecturaCursor);
    cuadroLecturaCursor = null;
  }

  valorPosicion.textContent = "—";
  valorEx.textContent = "—";
  valorEy.textContent = "—";
  valorCampo.textContent = "—";
  valorPotencial.textContent = "—";
}

botonComienzo.addEventListener("click", iniciarSimulador);
lienzo.addEventListener("click", manejarClickLienzo);
lienzo.addEventListener("mousemove", registrarMovimientoCursor);
lienzo.addEventListener("mouseleave", limpiarLecturaCursor);
botonEquipotenciales.addEventListener("click", alternarEquipotenciales);

botonesTipoCarga.forEach(function (boton) {
  boton.addEventListener("click", seleccionarTipoCarga);
});

botonesModo.forEach(function (boton) {
  boton.addEventListener("click", seleccionarModo);
});
