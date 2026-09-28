
const CONSTANTE_K = 2000000;      // fuerza de la interacción (como k de Coulomb)
const EPSILON_SUAVIZADO = 12;     // "suavizado": evita infinitos cerca de una carga
const CARGA_ELEMENTAL = 1;        // el protón tiene +1, el electrón -1
const MASA_ELECTRON = 1;
const MASA_PROTON = 1836;         // el protón pesa ~1836 veces más que el electrón
const RADIO_PARTICULA = 5;
const MAX_PUNTOS_TRAYECTORIA = 300;
let siguienteIdCarga = 1;
let siguienteIdParticula = 1;
function crearCarga(x, y, valor) {
  return {
    id: siguienteIdCarga++,
    x: x,
    y: y,
    valor: Number(valor)
  };
}
function radioCarga(carga) {
  return 18 + Math.min(Math.abs(carga.valor), 5) * 2;
}
function estaDentroDeAlgunaCarga(cargas, x, y) {
  return cargas.some(function (carga) {
    return Math.hypot(x - carga.x, y - carga.y) < radioCarga(carga);
  });
}
function campoDeUnaCarga(carga, x, y) {
  const dx = x - carga.x;
  const dy = y - carga.y;
  const r2 = dx * dx + dy * dy + EPSILON_SUAVIZADO * EPSILON_SUAVIZADO;
  const r3 = r2 * Math.sqrt(r2);
  const factor = (CONSTANTE_K * carga.valor) / r3;

  return { ex: factor * dx, ey: factor * dy };
}
function potencialDeUnaCarga(carga, x, y) {
  const dx = x - carga.x;
  const dy = y - carga.y;
  const r2 = dx * dx + dy * dy + EPSILON_SUAVIZADO * EPSILON_SUAVIZADO;

  return (CONSTANTE_K * carga.valor) / Math.sqrt(r2);
}
function calcularCampo(cargas, x, y) {
  let ex = 0;
  let ey = 0;

  for (const carga of cargas) {
    const campo = campoDeUnaCarga(carga, x, y);
    ex += campo.ex;
    ey += campo.ey;
  }

  return { ex: ex, ey: ey, magnitud: Math.hypot(ex, ey) };
}

function calcularPotencial(cargas, x, y) {
  let total = 0;

  for (const carga of cargas) {
    total += potencialDeUnaCarga(carga, x, y);
  }

  return total;
}
function direccionUnitariaDelCampo(cargas, x, y) {
  const campo = calcularCampo(cargas, x, y);

  if (campo.magnitud < 1e-9) {
    return null; // campo casi nulo: no hay dirección clara
  }

  return { ux: campo.ex / campo.magnitud, uy: campo.ey / campo.magnitud };
}

function calcularLineaDeCampo(cargas, x0, y0, direccion = 1, opciones = {}) {
  const ancho = opciones.ancho || 1000;
  const alto = opciones.alto || 1000;
  const paso = opciones.paso || 4;
  const maxPasos = opciones.maxPasos || 1500;

  const puntos = [{ x: x0, y: y0 }];
  let x = x0;
  let y = y0;

  for (let i = 0; i < maxPasos; i++) {
    const d1 = direccionUnitariaDelCampo(cargas, x, y);
    if (!d1) break;

    const xm = x + direccion * d1.ux * (paso / 2);
    const ym = y + direccion * d1.uy * (paso / 2);

    const d2 = direccionUnitariaDelCampo(cargas, xm, ym);
    if (!d2) break;

    x += direccion * d2.ux * paso;
    y += direccion * d2.uy * paso;
    puntos.push({ x: x, y: y });

    if (x < 0 || x > ancho || y < 0 || y > alto) break;
    if (estaDentroDeAlgunaCarga(cargas, x, y)) break;
  }

  return puntos;
}

function calcularLineasDeCampo(cargas, opciones = {}) {
  const lineasPorCarga = opciones.lineasPorCarga || 12;
  const lineas = [];

  const positivas = cargas.filter(function (c) { return c.valor > 0; });
  const fuentes = positivas.length > 0
    ? positivas
    : cargas.filter(function (c) { return c.valor < 0; });
  const direccion = positivas.length > 0 ? 1 : -1;

  for (const fuente of fuentes) {

    const cantidad = Math.max(
      6,
      Math.min(48, Math.round(lineasPorCarga * Math.abs(fuente.valor)))
    );
    const radioInicio = radioCarga(fuente) + 2;

    for (let i = 0; i < cantidad; i++) {
      const angulo = (2 * Math.PI * i) / cantidad;
      const x0 = fuente.x + Math.cos(angulo) * radioInicio;
      const y0 = fuente.y + Math.sin(angulo) * radioInicio;

      lineas.push(calcularLineaDeCampo(cargas, x0, y0, direccion, opciones));
    }
  }

  return lineas;
}

function nivelesEquipotencialesPorDefecto() {
  return [-16000, -8000, -4000, -2000, -1000, 0, 1000, 2000, 4000, 8000, 16000];
}

function calcularEquipotenciales(cargas, niveles, opciones = {}) {
  const ancho = opciones.ancho || 1000;
  const alto = opciones.alto || 1000;
  const celda = opciones.celda || 8;
  const listaNiveles = niveles || nivelesEquipotencialesPorDefecto();

  const columnas = Math.ceil(ancho / celda);
  const filas = Math.ceil(alto / celda);

  const valores = [];
  for (let j = 0; j <= filas; j++) {
    const fila = [];
    for (let i = 0; i <= columnas; i++) {
      fila.push(calcularPotencial(cargas, i * celda, j * celda));
    }
    valores.push(fila);
  }

  return listaNiveles.map(function (nivel) {
    const segmentos = [];

    for (let j = 0; j < filas; j++) {
      for (let i = 0; i < columnas; i++) {
        const x0 = i * celda;
        const y0 = j * celda;

        const a = valores[j][i];
        const b = valores[j][i + 1];
        const c = valores[j + 1][i + 1];
        const d = valores[j + 1][i];

        const caso =
          (a >= nivel ? 8 : 0) |
          (b >= nivel ? 4 : 0) |
          (c >= nivel ? 2 : 0) |
          (d >= nivel ? 1 : 0);

        if (caso === 0 || caso === 15) continue;

        const t = function (v0, v1) { return (nivel - v0) / (v1 - v0); };
        const arriba = [x0 + t(a, b) * celda, y0];
        const derecha = [x0 + celda, y0 + t(b, c) * celda];
        const abajo = [x0 + t(d, c) * celda, y0 + celda];
        const izquierda = [x0, y0 + t(a, d) * celda];

        const unir = function (p, q) {
          segmentos.push([p[0], p[1], q[0], q[1]]);
        };

        switch (caso) {
          case 1: case 14: unir(izquierda, abajo); break;
          case 2: case 13: unir(abajo, derecha); break;
          case 3: case 12: unir(izquierda, derecha); break;
          case 4: case 11: unir(arriba, derecha); break;
          case 6: case 9: unir(arriba, abajo); break;
          case 7: case 8: unir(arriba, izquierda); break;
          case 5: unir(arriba, izquierda); unir(abajo, derecha); break;
          case 10: unir(arriba, derecha); unir(izquierda, abajo); break;
        }
      }
    }

    return { nivel: nivel, segmentos: segmentos };
  });
}

function crearParticula(tipo, x, y, vx = 0, vy = 0) {
  const esElectron = tipo === "electron";

  return {
    id: siguienteIdParticula++,
    tipo: esElectron ? "electron" : "proton",
    x: x,
    y: y,
    vx: vx,
    vy: vy,
    ax: 0,
    ay: 0,
    carga: esElectron ? -CARGA_ELEMENTAL : CARGA_ELEMENTAL,
    masa: esElectron ? MASA_ELECTRON : MASA_PROTON,
    radio: RADIO_PARTICULA,
    activa: true,
    trayectoria: [{ x: x, y: y }]
  };
}

function calcularAceleracion(particula, cargas) {
  const campo = calcularCampo(cargas, particula.x, particula.y);

  return {
    ax: (particula.carga * campo.ex) / particula.masa,
    ay: (particula.carga * campo.ey) / particula.masa
  };
}

function pasoVelocityVerlet(particula, cargas, dt) {
  particula.x += particula.vx * dt + 0.5 * particula.ax * dt * dt;
  particula.y += particula.vy * dt + 0.5 * particula.ay * dt * dt;

  const nueva = calcularAceleracion(particula, cargas);

  particula.vx += 0.5 * (particula.ax + nueva.ax) * dt;
  particula.vy += 0.5 * (particula.ay + nueva.ay) * dt;

  particula.ax = nueva.ax;
  particula.ay = nueva.ay;
}

function energiaTotal(particula, cargas) {
  const v2 = particula.vx * particula.vx + particula.vy * particula.vy;
  const cinetica = 0.5 * particula.masa * v2;
  const potencial = particula.carga * calcularPotencial(cargas, particula.x, particula.y);

  return cinetica + potencial;
}

function compararElectronProton(cargas, x, y) {
  const electron = crearParticula("electron", x, y);
  const proton = crearParticula("proton", x, y);

  const aElectron = calcularAceleracion(electron, cargas);
  const aProton = calcularAceleracion(proton, cargas);
  electron.ax = aElectron.ax;
  electron.ay = aElectron.ay;
  proton.ax = aProton.ax;
  proton.ay = aProton.ay;

  const magElectron = Math.hypot(aElectron.ax, aElectron.ay);
  const magProton = Math.hypot(aProton.ax, aProton.ay);

  return {
    electron: electron,
    proton: proton,
    aceleracionElectron: magElectron,
    aceleracionProton: magProton,
    razonAceleracion: magProton > 0 ? magElectron / magProton : Infinity
  };
}

function aplicarLimites(particula, ancho, alto, restitucion = 0.8) {
  const r = particula.radio;

  if (particula.x < r) {
    particula.x = r;
    particula.vx = Math.abs(particula.vx) * restitucion;
  } else if (particula.x > ancho - r) {
    particula.x = ancho - r;
    particula.vx = -Math.abs(particula.vx) * restitucion;
  }

  if (particula.y < r) {
    particula.y = r;
    particula.vy = Math.abs(particula.vy) * restitucion;
  } else if (particula.y > alto - r) {
    particula.y = alto - r;
    particula.vy = -Math.abs(particula.vy) * restitucion;
  }
}

function detectarColisionConCarga(particula, cargas) {
  for (const carga of cargas) {
    const distancia = Math.hypot(particula.x - carga.x, particula.y - carga.y);

    if (distancia < radioCarga(carga) + particula.radio) {
      return carga;
    }
  }

  return null;
}

function resolverColision(particula, carga) {
  if (particula.carga * carga.valor < 0) {
    particula.activa = false;
    return;
  }

  const dx = particula.x - carga.x;
  const dy = particula.y - carga.y;
  const distancia = Math.hypot(dx, dy) || 1;
  const nx = dx / distancia;
  const ny = dy / distancia;

  const velocidadNormal = particula.vx * nx + particula.vy * ny;
  if (velocidadNormal < 0) {
    particula.vx -= 2 * velocidadNormal * nx;
    particula.vy -= 2 * velocidadNormal * ny;
  }

  const distanciaMinima = radioCarga(carga) + particula.radio;
  particula.x = carga.x + nx * distanciaMinima;
  particula.y = carga.y + ny * distanciaMinima;
}

function avanzarParticula(particula, cargas, dt, ancho, alto, subpasos = 4) {
  if (!particula.activa) return;

  const h = dt / subpasos;

  for (let i = 0; i < subpasos; i++) {
    pasoVelocityVerlet(particula, cargas, h);
    aplicarLimites(particula, ancho, alto);

    const chocada = detectarColisionConCarga(particula, cargas);
    if (chocada) {
      resolverColision(particula, chocada);
      if (!particula.activa) break;
    }
  }

  particula.trayectoria.push({ x: particula.x, y: particula.y });
  if (particula.trayectoria.length > MAX_PUNTOS_TRAYECTORIA) {
    particula.trayectoria.shift();
  }
}
