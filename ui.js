const botonComienzo = document.getElementById("boton-comienzo");
const portada = document.getElementById("portada");
const simulador = document.getElementById("simulador");
const lienzo = document.getElementById("lienzo");
const botonesTipoCarga = document.querySelectorAll(".boton-tipo-carga");
const botonesTipoParticula = document.querySelectorAll(
  ".boton-tipo-particula"
);
const botonesModo = document.querySelectorAll(".boton-modo");
const botonesEscenario = document.querySelectorAll(
  ".boton-escenario:not(:disabled)"
);
const controlMagnitud = document.getElementById("control-magnitud");
const valorMagnitud = document.getElementById("valor-magnitud");
const botonCampoVectorial = document.getElementById(
  "boton-campo-vectorial"
);
const botonEquipotenciales = document.getElementById(
  "boton-equipotenciales"
);
const botonLimpiar = document.getElementById("boton-limpiar");
const valorPosicion = document.getElementById("valor-posicion");
const valorEx = document.getElementById("valor-ex");
const valorEy = document.getElementById("valor-ey");
const valorCampo = document.getElementById("valor-campo");
const valorPotencial = document.getElementById("valor-potencial");
const resultadoComparacion = document.getElementById(
  "resultado-comparacion"
);
const aceleracionElectron = document.getElementById(
  "aceleracion-electron"
);
const aceleracionProton = document.getElementById(
  "aceleracion-proton"
);
const razonAceleracion = document.getElementById(
  "razon-aceleracion"
);

const cargas = [];
const particulas = [];
const PASO_FISICA = 1 / 120;
const FACTOR_VISUAL_PROTON = 40;

let signoCargaSeleccionada = 1;
let magnitudCargaSeleccionada = 1;
let tipoParticulaSeleccionada = "electron";
let modoLienzo = "agregar";
let mostrarCampoVectorial = false;
let mostrarEquipotenciales = false;
let posicionCursorPendiente = null;
let cuadroLecturaCursor = null;
let cuadroRedimension = null;
let idAnimacionParticulas = null;
let tiempoAnterior = null;
let acumuladorTiempo = 0;

function iniciarSimulador() {
  portada.hidden = true;
  simulador.hidden = false;
  iniciarRender();
}

function seleccionarTipoCarga(evento) {
  const botonSeleccionado = evento.currentTarget;
  signoCargaSeleccionada = Number(
    botonSeleccionado.dataset.valorCarga
  );

  botonesTipoCarga.forEach(function (boton) {
    const estaSeleccionado = boton === botonSeleccionado;
    boton.classList.toggle("seleccionada", estaSeleccionado);
    boton.setAttribute("aria-pressed", estaSeleccionado);
  });
}

function cambiarMagnitud() {
  magnitudCargaSeleccionada = Number(controlMagnitud.value);
  valorMagnitud.textContent = magnitudCargaSeleccionada;
}

function seleccionarTipoParticula(evento) {
  const botonSeleccionado = evento.currentTarget;
  tipoParticulaSeleccionada =
    botonSeleccionado.dataset.tipoParticula;

  if (tipoParticulaSeleccionada !== "comparacion") {
    resultadoComparacion.hidden = true;
  }

  botonesTipoParticula.forEach(function (boton) {
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

function alternarCampoVectorial() {
  mostrarCampoVectorial = !mostrarCampoVectorial;
  botonCampoVectorial.classList.toggle(
    "seleccionada",
    mostrarCampoVectorial
  );
  botonCampoVectorial.setAttribute(
    "aria-pressed",
    mostrarCampoVectorial
  );
  actualizarEscena();
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

function calcularMallaVectorial(ancho, alto, separacion = 45) {
  const vectores = [];
  const margen = separacion / 2;

  for (let y = margen; y < alto; y += separacion) {
    for (let x = margen; x < ancho; x += separacion) {
      if (estaDentroDeAlgunaCarga(cargas, x, y)) continue;

      const campo = calcularCampo(cargas, x, y);
      if (campo.magnitud < 1e-9) continue;

      vectores.push({
        x: x,
        y: y,
        ex: campo.ex,
        ey: campo.ey,
        magnitud: campo.magnitud
      });
    }
  }

  return vectores;
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
  const vectores = mostrarCampoVectorial
    ? calcularMallaVectorial(ancho, alto)
    : [];

  dibujarEscena(
    cargas,
    lineas,
    equipotenciales,
    vectores,
    particulas
  );

  botonLimpiar.disabled =
    cargas.length === 0 && particulas.length === 0;
}

function seleccionarBotonEscenario(escenario) {
  botonesEscenario.forEach(function (boton) {
    const estaSeleccionado =
      boton.dataset.escenario === escenario;

    boton.classList.toggle("seleccionada", estaSeleccionado);
    boton.setAttribute("aria-pressed", estaSeleccionado);
  });
}

function agregarCarga(x, y) {
  const valorCarga =
    signoCargaSeleccionada * magnitudCargaSeleccionada;
  const carga = crearCarga(x, y, valorCarga);

  cargas.push(carga);
  seleccionarBotonEscenario("libre");
  actualizarEscena();
}

function eliminarCarga(x, y) {
  for (let i = cargas.length - 1; i >= 0; i--) {
    const carga = cargas[i];
    const distancia = Math.hypot(x - carga.x, y - carga.y);

    if (distancia <= radioCarga(carga)) {
      cargas.splice(i, 1);
      seleccionarBotonEscenario("libre");
      actualizarEscena();
      return;
    }
  }
}

function mostrarResultadoComparacion(resultado) {
  aceleracionElectron.textContent = formatearValor(
    resultado.aceleracionElectron
  );
  aceleracionProton.textContent = formatearValor(
    resultado.aceleracionProton
  );
  razonAceleracion.textContent = Number.isFinite(
    resultado.razonAceleracion
  )
    ? `${resultado.razonAceleracion.toFixed(0)} veces`
    : "—";
  resultadoComparacion.hidden = false;
}

function prepararParticulaParaAnimacion(particula) {
  if (particula.tipo === "proton") {
    particula.masaFisica = particula.masa;
    particula.masa /= FACTOR_VISUAL_PROTON;
  }

  const aceleracionInicial = calcularAceleracion(
    particula,
    cargas
  );

  particula.ax = aceleracionInicial.ax;
  particula.ay = aceleracionInicial.ay;
}

function colocarParticula(x, y) {
  particulas.length = 0;
  tiempoAnterior = null;
  acumuladorTiempo = 0;

  if (tipoParticulaSeleccionada === "comparacion") {
    const resultado = compararElectronProton(cargas, x, y);

    prepararParticulaParaAnimacion(resultado.electron);
    prepararParticulaParaAnimacion(resultado.proton);
    particulas.push(resultado.electron, resultado.proton);
    mostrarResultadoComparacion(resultado);
  } else {
    const particula = crearParticula(
      tipoParticulaSeleccionada,
      x,
      y
    );

    prepararParticulaParaAnimacion(particula);
    particulas.push(particula);
    resultadoComparacion.hidden = true;
  }

  actualizarEscena();
  iniciarAnimacionParticulas();
}

function iniciarAnimacionParticulas() {
  if (idAnimacionParticulas !== null) return;

  tiempoAnterior = null;
  acumuladorTiempo = 0;
  idAnimacionParticulas = requestAnimationFrame(animarParticulas);
}

function animarParticulas(tiempoActual) {
  if (tiempoAnterior === null) {
    tiempoAnterior = tiempoActual;
  }

  const tiempoReal = Math.min(
    (tiempoActual - tiempoAnterior) / 1000,
    0.05
  );

  tiempoAnterior = tiempoActual;
  acumuladorTiempo += tiempoReal;

  while (acumuladorTiempo >= PASO_FISICA) {
    particulas.forEach(function (particula) {
      avanzarParticula(
        particula,
        cargas,
        PASO_FISICA,
        lienzo.clientWidth,
        lienzo.clientHeight
      );
    });
    acumuladorTiempo -= PASO_FISICA;
  }

  redibujarParticulas(particulas);

  const hayParticulasActivas = particulas.some(function (particula) {
    return particula.activa;
  });

  if (hayParticulasActivas) {
    idAnimacionParticulas = requestAnimationFrame(animarParticulas);
  } else {
    idAnimacionParticulas = null;
    tiempoAnterior = null;
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

  if (modoLienzo === "particula") {
    colocarParticula(x, y);
    return;
  }

  agregarCarga(x, y);
}

function limpiarEscenario() {
  cargas.length = 0;
  particulas.length = 0;
  resultadoComparacion.hidden = true;

  if (idAnimacionParticulas !== null) {
    cancelAnimationFrame(idAnimacionParticulas);
    idAnimacionParticulas = null;
  }

  tiempoAnterior = null;
  acumuladorTiempo = 0;
  seleccionarBotonEscenario("libre");
  actualizarEscena();
  limpiarLecturaCursor();
}

function cargarDipolo() {
  limpiarEscenario();

  const ancho = lienzo.clientWidth;
  const alto = lienzo.clientHeight;
  const magnitud = 2;

  cargas.push(
    crearCarga(ancho * 0.4, alto * 0.5, magnitud),
    crearCarga(ancho * 0.6, alto * 0.5, -magnitud)
  );

  seleccionarBotonEscenario("dipolo");
  actualizarEscena();
}

function cargarPlacasParalelas() {
  limpiarEscenario();

  const ancho = lienzo.clientWidth;
  const alto = lienzo.clientHeight;
  const xPositiva = ancho * 0.3;
  const xNegativa = ancho * 0.7;
  const margenVertical = alto * 0.15;
  const cantidadPorPlaca = 9;
  const magnitud = 1;
  const alturaUtil = alto - margenVertical * 2;

  for (let i = 0; i < cantidadPorPlaca; i++) {
    const progreso = i / (cantidadPorPlaca - 1);
    const y = margenVertical + alturaUtil * progreso;

    cargas.push(
      crearCarga(xPositiva, y, magnitud),
      crearCarga(xNegativa, y, -magnitud)
    );
  }

  seleccionarBotonEscenario("placas");
  actualizarEscena();
}

function cargarEscenario(evento) {
  const escenario = evento.currentTarget.dataset.escenario;

  if (escenario === "dipolo") {
    cargarDipolo();
    return;
  }

  if (escenario === "placas") {
    cargarPlacasParalelas();
    return;
  }

  limpiarEscenario();
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

function programarActualizacionPorRedimension() {
  if (simulador.hidden || cuadroRedimension !== null) return;

  cuadroRedimension = requestAnimationFrame(function () {
    cuadroRedimension = null;
    actualizarEscena();
  });
}

botonComienzo.addEventListener("click", iniciarSimulador);
controlMagnitud.addEventListener("input", cambiarMagnitud);
botonLimpiar.addEventListener("click", limpiarEscenario);
lienzo.addEventListener("click", manejarClickLienzo);
lienzo.addEventListener("mousemove", registrarMovimientoCursor);
lienzo.addEventListener("mouseleave", limpiarLecturaCursor);
botonCampoVectorial.addEventListener("click", alternarCampoVectorial);
botonEquipotenciales.addEventListener("click", alternarEquipotenciales);
window.addEventListener("resize", programarActualizacionPorRedimension);

botonesTipoCarga.forEach(function (boton) {
  boton.addEventListener("click", seleccionarTipoCarga);
});

botonesTipoParticula.forEach(function (boton) {
  boton.addEventListener("click", seleccionarTipoParticula);
});

botonesModo.forEach(function (boton) {
  boton.addEventListener("click", seleccionarModo);
});

botonesEscenario.forEach(function (boton) {
  boton.addEventListener("click", cargarEscenario);
});

