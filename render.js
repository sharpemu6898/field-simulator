const lienzoRender = document.getElementById("lienzo");
const ctx = lienzoRender.getContext("2d");

let anchoLienzo = lienzoRender.width;
let altoLienzo = lienzoRender.height;
let cargasVisibles = [];

function ajustarLienzo() {
  const areaSimulacion = document.getElementById("area-simulacion");
  const proporcionPixeles = Math.min(window.devicePixelRatio || 1, 2);

  anchoLienzo = Math.max(areaSimulacion.clientWidth, 300);
  altoLienzo = Math.max(areaSimulacion.clientHeight, 300);

  lienzoRender.width = anchoLienzo * proporcionPixeles;
  lienzoRender.height = altoLienzo * proporcionPixeles;
  lienzoRender.style.width = `${anchoLienzo}px`;
  lienzoRender.style.height = `${altoLienzo}px`;

  ctx.setTransform(proporcionPixeles, 0, 0, proporcionPixeles, 0, 0);

  dibujarEscena(cargasVisibles);
}

function limpiarLienzo() {
  ctx.clearRect(0, 0, anchoLienzo, altoLienzo);
}

function dibujarCarga(carga) {
  const valor = Number(carga.valor);
  const esPositiva = valor > 0;
  const esNegativa = valor < 0;
  const colorCarga = esPositiva
    ? "#ff304f"
    : esNegativa
      ? "#00a8ff"
      : "#7d8799";
  const radio = 18 + Math.min(Math.abs(valor), 5) * 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(carga.x, carga.y, radio, 0, Math.PI * 2);
  ctx.fillStyle = colorCarga;
  ctx.shadowColor = colorCarga;
  ctx.shadowBlur = 18;
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const etiqueta = valor > 0 ? `+${valor}` : `${valor}`;
  ctx.fillText(etiqueta, carga.x, carga.y);
  ctx.restore();
}

function dibujarEscena(cargas = []) {
  cargasVisibles = cargas;
  limpiarLienzo();
  cargasVisibles.forEach(dibujarCarga);
}

function iniciarRender() {
  ajustarLienzo();
}

window.addEventListener("resize", function () {
  if (!lienzoRender.closest("[hidden]")) {
    ajustarLienzo();
  }
});

