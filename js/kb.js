// Base de conocimiento de The Clover.
// La usan el servidor (como contexto del modelo) y el navegador (modo básico sin IA).
// Todo lo marcado "por confirmar" debe completarlo el equipo antes de publicar.

export const PROJECT = {
  name: "The Clover",
  symbol: "por confirmar",
  network: "por confirmar",
  supply: "por confirmar",
  contract: "aún no publicado",
  pillars: ["Descentralizada", "Rápida", "Segura", "Global"],
};

export const KB = [
  {
    id: "que-es",
    q: "¿Qué es The Clover?",
    keys: ["que es", "qué es", "the clover", "proyecto", "moneda", "token", "explica"],
    a: "The Clover es un proyecto de criptomoneda cuya identidad es un trébol de cuatro hojas: cada hoja representa un pilar — descentralizada, rápida, segura y global. Esta web presenta la moneda, explica cómo funciona una blockchain y responde dudas. Los datos técnicos del token (red, símbolo, suministro y contrato) todavía están por confirmar por el equipo.",
  },
  {
    id: "pilares",
    q: "¿Qué significan las cuatro hojas?",
    keys: ["hojas", "pilares", "trebol", "trébol", "logo", "significa", "simbolo", "símbolo"],
    a: "Cada hoja del trébol es un pilar: 1) Descentralizada — ninguna entidad única controla la red. 2) Rápida — transacciones pensadas para confirmarse en poco tiempo. 3) Segura — registros verificables y criptografía. 4) Global — se puede usar desde cualquier país con conexión a internet. Son los mismos cuatro conceptos grabados en el canto de la moneda.",
  },
  {
    id: "blockchain",
    q: "¿Qué es una blockchain?",
    keys: ["blockchain", "cadena de bloques", "bloque", "bloques", "red", "como funciona", "cómo funciona"],
    a: "Una blockchain es un registro compartido: las transacciones se agrupan en bloques y cada bloque guarda una huella (hash) del anterior, formando una cadena. Muchos nodos guardan copias, así que alterar un bloque antiguo exigiría rehacer todos los siguientes y convencer a la mayoría de la red. Por eso el historial es muy difícil de falsificar.",
  },
  {
    id: "comprar",
    q: "¿Cómo puedo comprar The Clover?",
    keys: ["comprar", "compra", "adquirir", "donde", "dónde", "exchange", "precio", "cuesta", "vale", "listado"],
    a: "Todavía no hay un contrato ni un mercado oficial publicado en esta web, así que no compres nada que diga ser The Clover hasta que el equipo lo anuncie aquí y en sus canales oficiales. Cuando exista, el proceso típico será: 1) crear una billetera propia, 2) conseguir la moneda de la red correspondiente para pagar comisiones, 3) verificar la dirección del contrato oficial y 4) operar en la plataforma indicada. Nunca compartas tu frase semilla.",
  },
  {
    id: "billetera",
    q: "¿Qué billetera necesito?",
    keys: ["billetera", "wallet", "cartera", "metamask", "phantom", "trust", "ledger", "guardar"],
    a: "Necesitarás una billetera compatible con la red donde se lance The Clover (aún por confirmar). Las billeteras de autocustodia te dan una frase semilla de 12 o 24 palabras: escríbela en papel, guárdala offline y no se la des a nadie — ni siquiera a soporte. Quien tenga esa frase controla tus fondos.",
  },
  {
    id: "seguridad",
    q: "¿Cómo evito estafas?",
    keys: ["estafa", "scam", "seguro", "seguridad", "fraude", "hack", "robo", "falso", "phishing"],
    a: "Reglas básicas: verifica siempre la dirección del contrato en la web oficial; desconfía de mensajes privados que te ofrezcan ayuda o ganancias garantizadas; no conectes tu billetera a sitios que no conoces; revisa qué permisos firmas; y nunca compartas tu frase semilla. Ningún miembro del equipo te la pedirá.",
  },
  {
    id: "datos",
    q: "¿Cuál es el suministro, la red y el contrato?",
    keys: ["suministro", "supply", "red", "chain", "contrato", "contract", "direccion", "dirección", "simbolo", "ticker", "tokenomics", "tokenomía"],
    a: "Esos datos aún no han sido publicados: símbolo, red, suministro total y dirección del contrato están por confirmar. En cuanto el equipo los anuncie aparecerán en la sección «Datos del token» de esta web. Si alguien te comparte un contrato antes, trátalo como no oficial.",
  },
  {
    id: "inversion",
    q: "¿Es buena inversión? ¿Cuánto voy a ganar?",
    keys: ["invertir", "inversion", "inversión", "ganar", "ganancia", "rentable", "subir", "x100", "moon", "recomiendas", "conviene"],
    a: "No puedo darte asesoría financiera ni prometer ganancias. Las criptomonedas son muy volátiles y puedes perder todo lo que inviertas. Si lo consideras, infórmate, invierte solo lo que puedas permitirte perder y, si lo necesitas, consulta a un asesor financiero autorizado.",
  },
  {
    id: "ruta",
    q: "¿Cuál es la hoja de ruta?",
    keys: ["roadmap", "hoja de ruta", "ruta", "futuro", "planes", "fases", "lanzamiento", "cuando", "cuándo"],
    a: "La hoja de ruta que verás en la web es una propuesta en cuatro fases — Semilla (comunidad e identidad), Brote (lanzamiento del token y contrato verificado), Hojas (utilidad y alianzas) y Trébol completo (expansión global). Las fechas concretas las publicará el equipo.",
  },
  {
    id: "comunidad",
    q: "¿Cómo me uno a la comunidad?",
    keys: ["comunidad", "telegram", "discord", "twitter", "x.com", "redes", "unirme", "contacto", "contactar"],
    a: "Los canales oficiales de la comunidad se publicarán en el pie de esta web. Usa solo los enlaces que aparezcan aquí: los grupos falsos son una de las estafas más comunes.",
  },
];

export const SYSTEM_PROMPT = `Eres Clover AI, el asistente de la web de The Clover, un proyecto de criptomoneda cuyo símbolo es un trébol de cuatro hojas de neón verde.

Responde en el idioma del usuario (por defecto español), con tono cercano y claro, en 2 a 6 frases. Usa listas cortas solo si ayudan.

Lo que sabes del proyecto está en la base de conocimiento de abajo. Reglas:
- No inventes datos del token: símbolo, red, suministro, precio, contrato, fechas, alianzas, listados o miembros del equipo. Si no están en la base, di que el equipo aún no los ha publicado.
- No des asesoría financiera personalizada ni prometas rentabilidad. Recuerda la volatilidad cuando pregunten por invertir.
- Puedes explicar conceptos generales de criptomonedas (blockchain, billeteras, comisiones, seguridad) con precisión.
- Nunca pidas ni aceptes frases semilla, claves privadas o contraseñas; si alguien las comparte, avísale de que no lo haga.
- Si preguntan algo ajeno a The Clover o a las criptomonedas, redirige con amabilidad.

BASE DE CONOCIMIENTO
${KB.map((k) => `- ${k.q} ${k.a}`).join("\n")}`;

const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// Respuesta sin IA: elige la entrada con más coincidencias de palabras clave.
export function localAnswer(text) {
  const t = norm(text);
  let best = null;
  let score = 0;
  for (const item of KB) {
    const s = item.keys.reduce((n, k) => n + (t.includes(norm(k)) ? k.length : 0), 0);
    if (s > score) { score = s; best = item; }
  }
  if (best) return best.a;
  return "Puedo contarte qué es The Clover, qué significan sus cuatro hojas, cómo funciona una blockchain, cómo protegerte de estafas y qué datos del token siguen por confirmar. ¿Por dónde empezamos?";
}
