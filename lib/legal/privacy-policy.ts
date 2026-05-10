// Política de Privacidad y Términos del Prode 26
// Conforme Ley 25.326 (Protección de Datos Personales) — República Argentina.
// Los campos entre [CORCHETES] deben ser completados por el operador antes
// de salir a producción. Revisar con abogado matriculado.

export const LEGAL_VERSION = "1.0";
export const LEGAL_LAST_UPDATED = "2026-05-10";

export interface LegalParagraph {
  type: "p" | "li";
  text: string;
}

export interface LegalSection {
  title: string;
  body: LegalParagraph[];
}

export const LEGAL_TITLE = "Términos y Condiciones y Política de Privacidad";
export const LEGAL_SUBTITLE = "Prode Mundial 2026";

export const LEGAL_INTRO: LegalParagraph[] = [
  {
    type: "p",
    text:
      "Bienvenido/a a Prode Mundial 2026 (en adelante, “la Plataforma”). El " +
      "presente documento regula los Términos y Condiciones de uso de la " +
      "Plataforma y, de forma integrada, la Política de Privacidad aplicable " +
      "al tratamiento de tus datos personales conforme a la Ley N° 25.326 de " +
      "Protección de Datos Personales (LPDP), su Decreto Reglamentario " +
      "1558/2001 y las disposiciones de la Agencia de Acceso a la Información " +
      "Pública (AAIP).",
  },
  {
    type: "p",
    text:
      "Al registrarte, aceptás expresamente este documento. Si no estás de " +
      "acuerdo con alguno de sus términos, no debés utilizar la Plataforma.",
  },
];

export const LEGAL_SECTIONS: LegalSection[] = [
  {
    title: "1. Identificación del Responsable del Tratamiento",
    body: [
      {
        type: "p",
        text:
          "El responsable del tratamiento de tus datos personales es " +
          "[RAZÓN SOCIAL DEL OPERADOR], CUIT [CUIT], con domicilio legal en " +
          "[DOMICILIO LEGAL], Provincia de Entre Ríos, República Argentina " +
          "(en adelante, “el Responsable”).",
      },
      {
        type: "p",
        text:
          "Contacto del responsable: [EMAIL DE CONTACTO]. Si en el futuro se " +
          "designa Delegado de Protección de Datos (DPO), se actualizará este " +
          "documento con sus datos de contacto.",
      },
      {
        type: "p",
        text:
          "Inscripción en el Registro Nacional de Bases de Datos de la AAIP: " +
          "número de inscripción [NÚMERO DE INSCRIPCIÓN AAIP] (trámite " +
          "obligatorio según art. 21 LPDP).",
      },
    ],
  },
  {
    title: "2. Datos personales que recolectamos y finalidad del tratamiento",
    body: [
      {
        type: "p",
        text: "La Plataforma trata las siguientes categorías de datos:",
      },
      {
        type: "li",
        text:
          "Datos de identificación: email, nombre y apellido, fecha de " +
          "nacimiento. Finalidad: identificarte unívocamente, verificar que " +
          "tengas 18 años cumplidos y mostrarte en el ranking. Carácter: " +
          "obligatorio.",
      },
      {
        type: "li",
        text:
          "DNI: solicitado únicamente cuando un premio supera el umbral " +
          "establecido por AFIP para retención de impuestos. Finalidad: " +
          "cumplimiento de obligaciones fiscales. Carácter: obligatorio si " +
          "corresponde acreditar premios; facultativo en caso contrario.",
      },
      {
        type: "li",
        text:
          "Credenciales: contraseña hasheada (no almacenamos contraseñas en " +
          "texto plano) o, alternativamente, autenticación por enlace mágico " +
          "(magic link). Finalidad: autenticación segura. Carácter: " +
          "obligatorio.",
      },
      {
        type: "li",
        text:
          "Datos de pago: cuando aplique, son tokenizados y procesados por " +
          "una pasarela de pagos externa. La Plataforma no almacena números " +
          "de tarjeta ni datos financieros completos en sus servidores.",
      },
      {
        type: "li",
        text:
          "Datos de conducta: pronósticos cargados, grupos a los que " +
          "pertenecés, historial de partidas, ranking, dirección IP de " +
          "acceso, timestamp de inicios de sesión y metadatos de sesión. " +
          "Finalidad: operar el juego, prevenir fraudes y multicuentas, " +
          "auditar resultados. Carácter: obligatorio para usar la Plataforma.",
      },
      {
        type: "li",
        text:
          "Datos de comunicación: emails enviados/recibidos relacionados con " +
          "la cuenta y preferencias de notificación. Finalidad: enviar " +
          "comunicaciones transaccionales (acceso, recordatorios, premios) " +
          "y, si lo autorizás, marketing. Carácter: las transaccionales son " +
          "obligatorias; las comerciales son facultativas y revocables.",
      },
      {
        type: "p",
        text:
          "Consecuencias de no proporcionar los datos obligatorios: no " +
          "podrás registrarte ni utilizar la Plataforma, ni podremos " +
          "acreditar eventuales premios.",
      },
      {
        type: "p",
        text:
          "Datos sensibles (art. 2 LPDP): la Plataforma NO recolecta datos " +
          "sensibles (origen racial o étnico, opiniones políticas, " +
          "convicciones religiosas, afiliación sindical, datos de salud o de " +
          "vida sexual).",
      },
    ],
  },
  {
    title: "3. Cesionarios y procesadores de los datos",
    body: [
      {
        type: "p",
        text:
          "Para operar la Plataforma, los datos son procesados por los " +
          "siguientes proveedores en carácter de encargados del tratamiento:",
      },
      {
        type: "li",
        text:
          "Supabase Inc. (Estado de Delaware, EE.UU., con infraestructura en " +
          "Singapur): base de datos, autenticación y almacenamiento. Procesa " +
          "email, contraseña hasheada, pronósticos, ranking, IP y metadatos " +
          "de sesión.",
      },
      {
        type: "li",
        text:
          "Resend (EE.UU.): envío de emails transaccionales (magic link, " +
          "notificaciones). Procesa email y contenido del mensaje.",
      },
      {
        type: "li",
        text:
          "Vercel Inc. (EE.UU.): hosting de la aplicación. Procesa de forma " +
          "incidental IP y metadatos de las solicitudes HTTP.",
      },
      {
        type: "li",
        text:
          "[Analytics, si aplica: Posthog / Plausible / Google Analytics]: " +
          "análisis de uso agregado y, cuando corresponda, identificadores " +
          "pseudonimizados.",
      },
    ],
  },
  {
    title: "4. Transferencias internacionales de datos",
    body: [
      {
        type: "p",
        text:
          "Algunos de los proveedores enumerados (Supabase, Resend y Vercel) " +
          "operan desde Estados Unidos de América. Te informamos " +
          "expresamente que, conforme la Disposición 60-E/2016 de la AAIP, " +
          "EE.UU. NO es considerado un país con nivel adecuado de " +
          "protección de datos personales.",
      },
      {
        type: "p",
        text:
          "Para legitimar estas transferencias internacionales, el " +
          "Responsable ha celebrado con dichos proveedores los Acuerdos de " +
          "Procesamiento de Datos (DPA) y cláusulas contractuales " +
          "correspondientes, en línea con los modelos aprobados por la AAIP " +
          "y los Standard Contractual Clauses internacionales.",
      },
      {
        type: "p",
        text:
          "Al aceptar este documento, prestás tu consentimiento expreso " +
          "para esa transferencia internacional, conforme art. 12 LPDP.",
      },
    ],
  },
  {
    title: "5. Derechos del titular (Acceso, Rectificación, Cancelación, Oposición)",
    body: [
      {
        type: "p",
        text:
          "Como titular de los datos, tenés derecho a ejercer las " +
          "facultades reconocidas por los arts. 14, 15 y 16 LPDP:",
      },
      {
        type: "li",
        text:
          "Acceso: solicitar información sobre los datos personales que " +
          "tenemos sobre vos. Plazo de respuesta: 10 días corridos.",
      },
      {
        type: "li",
        text:
          "Rectificación: corregir datos inexactos o incompletos. Plazo: " +
          "5 días hábiles.",
      },
      {
        type: "li",
        text:
          "Cancelación / Supresión: solicitar la eliminación de tus datos " +
          "cuando sean innecesarios, hayan sido tratados en infracción a la " +
          "ley o vencido el plazo de conservación. Plazo: 5 días hábiles.",
      },
      {
        type: "li",
        text:
          "Oposición: oponerte al tratamiento por motivos legítimos, " +
          "especialmente al uso para marketing.",
      },
      {
        type: "p",
        text:
          "Procedimiento: enviá tu solicitud a [EMAIL ARCO] indicando tu " +
          "nombre completo, copia de tu DNI (para validar identidad) y el " +
          "derecho que querés ejercer. La gratuidad del primer pedido por " +
          "semestre está garantizada conforme la ley.",
      },
      {
        type: "p",
        text:
          "Si considerás que tu solicitud no fue atendida correctamente, " +
          "podés presentar una denuncia ante la Agencia de Acceso a la " +
          "Información Pública (AAIP), Av. Pte. Julio A. Roca 710, piso 2°, " +
          "CABA, www.argentina.gob.ar/aaip.",
      },
    ],
  },
  {
    title: "6. Plazo de conservación de los datos",
    body: [
      {
        type: "p",
        text:
          "Conservamos tus datos mientras tu cuenta esté activa. Una vez " +
          "que la cuenta sea cerrada (por vos o por inactividad), los datos " +
          "necesarios para acreditar operaciones, premios o cumplir con " +
          "obligaciones impositivas y contables se conservarán por el plazo " +
          "legal aplicable (10 años, conforme art. 67 del Código de " +
          "Comercio y normativa AFIP). Vencido ese plazo, los datos serán " +
          "eliminados o anonimizados.",
      },
    ],
  },
  {
    title: "7. Medidas de seguridad",
    body: [
      {
        type: "p",
        text:
          "Implementamos medidas técnicas y organizativas razonables para " +
          "proteger tus datos:",
      },
      { type: "li", text: "Cifrado en tránsito mediante TLS 1.2 o superior." },
      { type: "li", text: "Cifrado en reposo en la base de datos." },
      {
        type: "li",
        text:
          "Hash de contraseñas con algoritmos adecuados; no se almacenan en " +
          "texto plano.",
      },
      {
        type: "li",
        text:
          "Control de acceso basado en roles y políticas Row Level Security " +
          "a nivel de base de datos.",
      },
      { type: "li", text: "Backups periódicos y retención limitada." },
      {
        type: "li",
        text:
          "Registros de auditoría para detectar accesos anómalos o " +
          "incidentes de seguridad.",
      },
      {
        type: "p",
        text:
          "Ningún sistema es absolutamente seguro. En caso de detectar un " +
          "incidente que afecte tus datos personales, te lo notificaremos " +
          "conforme las recomendaciones de la AAIP.",
      },
    ],
  },
  {
    title: "8. Política de cookies",
    body: [
      {
        type: "p",
        text: "La Plataforma utiliza las siguientes categorías de cookies:",
      },
      {
        type: "li",
        text:
          "Estrictamente necesarias: imprescindibles para autenticarte y " +
          "sostener tu sesión. No requieren consentimiento.",
      },
      {
        type: "li",
        text:
          "Funcionales: recuerdan preferencias (idioma, tema, etc.). " +
          "Activadas por defecto, podés desactivarlas en tu navegador.",
      },
      {
        type: "li",
        text:
          "Analítica: nos ayudan a entender cómo se usa la Plataforma de " +
          "forma agregada. Solo se activan con tu consentimiento.",
      },
      {
        type: "li",
        text:
          "Publicidad: la Plataforma NO utiliza cookies de terceros con " +
          "fines publicitarios al momento de la presente versión.",
      },
    ],
  },
  {
    title: "9. Tratamiento de menores",
    body: [
      {
        type: "p",
        text:
          "La Plataforma está prohibida para menores de 18 años por " +
          "tratarse de un servicio que involucra premios. Al registrarte, " +
          "declarás bajo juramento que sos mayor de edad.",
      },
      {
        type: "p",
        text:
          "Si detectamos que una cuenta corresponde a una persona menor de " +
          "edad, procederemos a su baja inmediata, suspensión de premios y " +
          "eliminación de los datos asociados, salvo que la conservación " +
          "venga exigida por una norma de orden público.",
      },
    ],
  },
  {
    title: "10. Decisiones automatizadas",
    body: [
      {
        type: "p",
        text:
          "El cálculo de puntos y la confección del ranking se realizan de " +
          "forma automatizada, conforme las reglas publicadas en la " +
          "Plataforma. Conforme art. 20 LPDP, tenés derecho a impugnar " +
          "decisiones automatizadas que te afecten significativamente. " +
          "Podés ejercer ese derecho a través de [EMAIL ARCO], y revisaremos " +
          "manualmente la situación.",
      },
    ],
  },
  {
    title: "11. Prevención de lavado de activos (Ley 25.246)",
    body: [
      {
        type: "p",
        text:
          "Cuando los premios o los volúmenes operados superen los " +
          "umbrales fijados por la Unidad de Información Financiera (UIF), " +
          "el Responsable cumplirá con las obligaciones de identificación " +
          "reforzada del cliente, conservación de documentación y reporte " +
          "de operaciones sospechosas que correspondan.",
      },
    ],
  },
  {
    title: "12. Modificaciones",
    body: [
      {
        type: "p",
        text:
          "Podemos modificar este documento cuando sea necesario por " +
          "razones legales, técnicas o comerciales. Si los cambios son " +
          "sustanciales, te notificaremos por email y/o mediante un aviso " +
          "destacado dentro de la Plataforma con una antelación razonable. " +
          "El uso continuado después de la entrada en vigencia implica " +
          "aceptación de los nuevos términos.",
      },
    ],
  },
  {
    title: "13. Jurisdicción y ley aplicable",
    body: [
      {
        type: "p",
        text:
          "Este documento se rige por las leyes de la República Argentina. " +
          "Para cualquier controversia, las partes se someten a la " +
          "jurisdicción de los Tribunales Ordinarios de la Provincia de " +
          "Entre Ríos, con renuncia expresa a cualquier otro fuero.",
      },
    ],
  },
  {
    title: "14. Contacto",
    body: [
      {
        type: "p",
        text:
          "Para cualquier consulta, reclamo o ejercicio de derechos ARCO, " +
          "podés escribirnos a [EMAIL DE CONTACTO]. Responderemos en los " +
          "plazos legales mencionados en la sección 5.",
      },
    ],
  },
];

export const LEGAL_PENDING: LegalSection = {
  title: "Obligaciones pendientes para el operador",
  body: [
    {
      type: "p",
      text:
        "Las siguientes tareas deben completarse antes de salir a " +
        "producción y revisarse periódicamente:",
    },
    {
      type: "li",
      text:
        "Inscribir las bases de datos en el Registro Nacional de Bases de " +
        "Datos de la AAIP (art. 21 LPDP).",
    },
    {
      type: "li",
      text:
        "Evaluar la designación de un Delegado de Protección de Datos si " +
        "el volumen de tratamiento o la naturaleza de los datos lo " +
        "justifica.",
    },
    {
      type: "li",
      text:
        "Auditorías periódicas de seguridad de la información (mínimo " +
        "anuales) sobre los sistemas que tratan datos personales.",
    },
    {
      type: "li",
      text:
        "Revisión integral de este documento por abogado/a matriculado/a, " +
        "especialmente las cláusulas relacionadas con UIF, fiscalidad de " +
        "premios y consumidor.",
    },
    {
      type: "li",
      text:
        "Implementar y documentar el procedimiento interno para responder " +
        "solicitudes ARCO en los plazos legales.",
    },
  ],
};
