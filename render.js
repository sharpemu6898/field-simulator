const lienzoRender = document.getElementById("lienzo");
const contextoRender = lienzoRender.getContext("2d");

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

  contextoRender.setTransform(
    proporcionPixeles,
    0,
    0,
    proporcionPixeles,
    0,
    0
  );

  dibujarEscena(cargasVisibles);
}

function limpiarLienzo() {
  contextoRender.clearRect(0, 0, anchoLienzo, altoLienzo);
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

  contextoRender.save();
  contextoRender.beginPath();
  contextoRender.arc(carga.x, carga.y, radio, 0, Math.PI * 2);
  contextoRender.fillStyle = colorCarga;
  contextoRender.shadowColor = colorCarga;
  contextoRender.shadowBlur = 18;
  contextoRender.fill();

  contextoRender.lineWidth = 2;
  contextoRender.strokeStyle = "rgba(255, 255, 255, 0.85)";
  contextoRender.stroke();

  contextoRender.shadowBlur = 0;
  contextoRender.fillStyle = "#ffffff";
  contextoRender.font = "bold 18px Trebuchet MS";
  contextoRender.textAlign = "center";
  contextoRender.textBaseline = "middle";

  const etiqueta = valor > 0 ? `+${valor}` : `${valor}`;
  contextoRender.fillText(etiqueta, carga.x, carga.y);
  contextoRender.restore();
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
