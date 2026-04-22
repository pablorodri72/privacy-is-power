// ==============================
// CONFIGURACIÓN BASE
// ==============================
const BASE_SIZE      = 24;
const SELECTED_SIZE  = 31;
const CONNECTED_SIZE = 24;
const DIMMED_OPACITY = 0.24;

let isOpening          = false;
let networkInitialized = false;
let networkInstance    = null;
let networkNodes       = null;
let networkEdges       = null;
let selectedAuthorId   = null;

// ==============================
// APERTURA DEL ÁLBUM
// ==============================
function openGatefold() {
    if (isOpening) return;

    const cover = document.getElementById("front-cover");
    if (!cover) return;

    isOpening = true;
    cover.classList.add("cutting");

    setTimeout(() => {
        cover.classList.add("open");
    }, 620);
}

// ==============================
// CAMBIO DE PANEL
// ==============================
function showPanel(id, el) {
    const panels   = document.querySelectorAll(".content-section");
    const navItems = document.querySelectorAll(".nav-item");

    panels.forEach((panel) => panel.classList.remove("active"));
    navItems.forEach((item) => {
        item.classList.remove("active");
        item.removeAttribute("aria-current");
    });

    const selectedPanel = document.getElementById(`panel-${id}`);
    if (selectedPanel) selectedPanel.classList.add("active");

    if (el) {
        el.classList.add("active");
        el.setAttribute("aria-current", "page");
    }

    const rightPanel = document.querySelector(".panel-right");
    if (rightPanel) {
        rightPanel.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (id === "mapa") {
        if (!networkInitialized) {
            // Intentamos inicializar; si falla, networkInitialized queda false
            // para que el usuario pueda reintentar navegando a otra sección y volviendo
            const ok = initNetwork();
            if (ok) networkInitialized = true;
        } else if (networkInstance) {
            setTimeout(() => {
                networkInstance.fit({
                    animation: { duration: 350, easingFunction: "easeInOutQuad" }
                });
            }, 120);
        }
    }
}

// ==============================
// TRADUCCIÓN INDIVIDUAL DE CITAS
// ==============================
function toggleSingleTranslation(btn) {
    const container = btn.closest(".quote-container");
    if (!container) return;

    const textEn = container.querySelector(".lang-en");
    const textEs = container.querySelector(".lang-es");
    if (!textEn || !textEs) return;

    const spanishVisible = textEs.style.display !== "none";

    if (!spanishVisible) {
        textEn.style.display = "none";
        textEs.style.display = "inline";
        btn.innerHTML = '<img src="./fotos_utilizadas/UK.png" alt="UK" class="btn-flag"> Original';
        btn.setAttribute("aria-label", "Mostrar cita original en inglés");
        btn.setAttribute("title",      "Mostrar cita original en inglés");
    } else {
        textEn.style.display = "inline";
        textEs.style.display = "none";
        btn.innerHTML = '<img src="./fotos_utilizadas/espana.png" alt="ES" class="btn-flag"> Traducir';
        btn.setAttribute("aria-label", "Mostrar traducción al español");
        btn.setAttribute("title",      "Mostrar traducción al español");
    }
}

// ==============================
// TARJETA POR DEFECTO
// ==============================
function getDefaultAuthorCard() {
    return `
        <div class="author-card placeholder-card">
            <div class="author-photo-wrap">
                <div class="author-placeholder">?</div>
            </div>
            <div class="author-meta">
                <h3>Selecciona un autor</h3>
                <div class="author-role">Marco de lectura</div>
                <div class="author-text">
                    Haz clic sobre uno de los círculos para abrir su ficha y ver
                    por qué los diferentes autores están conectados entre sí
                    dentro de este mapa mental.
                </div>
            </div>
        </div>
    `;
}

// ==============================
// DATOS DE AUTORES
// ==============================
const authorDetails = {
    1: {
        name:       "Michel Foucault",
        role:       "Perfil: Filosofía postestructuralista · Francia",
        image:      "./fotos_utilizadas/MichelFoucault.jpg",
        imageClass: "author-foucault",
        text: "Foucault sigue siendo muy útil para leer este debate. Lo que más me interesa de él no es que diga que nos vigilan, sino que explica cómo la posibilidad de ser observado acaba cambiando la conducta aunque nadie esté mirando de verdad. Eso conecta directamente con lo que pasa hoy: no necesitas que alguien lea tus mensajes para que te autocensures, basta con saber que podría hacerlo. Sus libros son anteriores a internet, pero el mecanismo que describe está en todas partes.",
        links: [
            {
                name: "Carissa Véliz",
                text: "Los dos coinciden en que la vigilancia nunca es inocente: siempre reorganiza quién tiene más margen de maniobra sobre quién."
            },
            {
                name: "Shoshana Zuboff",
                text: "Zuboff toma esa misma lógica y la aterrriza en las plataformas digitales, mostrando cómo la observación se convierte también en motor económico."
            }
        ]
    },
    2: {
        name:       "Shoshana Zuboff",
        role:       "Perfil: Sociología económica · EE.UU.",
        image:      "./fotos_utilizadas/ShoshanaZuboff.jpg",
        imageClass: "author-zuboff",
        text: "Lo que distingue a Zuboff del resto es que no se queda en denunciar la vigilancia, sino que explica exactamente cómo se monetiza. Su aportación más potente, en mi opinión, es dejar claro que los datos no se recogen por descuido ni por curiosidad: se recogen porque generan predicción, y la predicción genera ventaja competitiva. Eso convierte algo que parecía un debate de privacidad en un debate sobre estructura económica, y eso cambia bastante la manera de pensar las soluciones.",
        links: [
            {
                name: "Michel Foucault",
                text: "Parte de una lógica de vigilancia similar a la de Foucault, pero la sitúa dentro de infraestructuras privadas que convierten la observación en negocio."
            },
            {
                name: "Carissa Véliz",
                text: "Ambas critican la acumulación masiva de datos, aunque Zuboff lo hace más desde la estructura económica y Véliz desde el daño ético y político directo."
            },
            {
                name: "Edward Snowden",
                text: "Las filtraciones de Snowden (especialmente el programa PRISM, que mostraba acceso directo del gobierno a servidores de Google y Facebook) demostraron que esa lógica no estaba solo en las empresas."
            },
            {
                name: "Marta Peirano",
                text: "Peirano traduce a un lenguaje más cotidiano muchas de las dinámicas que Zuboff analiza a escala sistémica."
            }
        ]
    },
    3: {
        name:       "Carissa Véliz",
        role:       "Perfil: Ética y Filosofía digital · México / Oxford",
        image:      "./fotos_utilizadas/CarissaVeliz.jpg",
        imageClass: "author-veliz",
        text: "Véliz es el centro del trabajo porque logra algo que otros no siempre consiguen: convertir la privacidad en una cuestión política real, no en un capricho individual. El argumento que más me ha convencido es que el problema no está solo en que sepan cosas de ti, sino en lo que esa información le permite hacer a quien la acumula. Cuando alguien sabe mucho más de ti que tú de él, la relación ya no es entre iguales. A partir de ahí todo el libro tiene mucho más sentido.",
        links: [
            {
                name: "Michel Foucault",
                text: "Comparten la idea de que la vigilancia altera siempre una relación de fuerzas, aunque Véliz lo aplica directamente al contexto digital y de datos."
            },
            {
                name: "Shoshana Zuboff",
                text: "Las dos ayudan a ver que el problema del dato no es puntual ni accidental, sino estructural y sostenido en el tiempo."
            },
            {
                name: "Bruce Schneier",
                text: "Schneier aporta la dimensión técnica y de diseño que complementa la crítica ética de Véliz: no basta con identificar el problema, hay que construir sistemas que lo eviten."
            },
            {
                name: "Marta Peirano",
                text: "Las dos insisten en que esto no es algo que solo pase en contextos extremos, sino que ya condiciona decisiones cotidianas muy concretas."
            }
        ]
    },
    4: {
        name:       "Bruce Schneier",
        role:       "Perfil: Criptografía y Ciberseguridad · EE.UU.",
        image:      "./fotos_utilizadas/BruceSchneier.jpg",
        imageClass: "author-bruce",
        text: "Schneier es el que más me ayuda a pensar en soluciones concretas. Mientras los otros autores explican bien el problema en términos políticos o sociales, él obliga a bajar al nivel técnico: diseño seguro, minimización de datos, cifrado, arquitecturas que no dependan de recolectar más información de la necesaria. Sin esa dimensión, todo el debate se queda en crítica sin consecuencias prácticas. Y en ciberseguridad eso es exactamente el problema que queremos evitar.",
        links: [
            {
                name: "Carissa Véliz",
                text: "Ofrece los criterios técnicos y de diseño para responder en la práctica a los riesgos que ella identifica y denuncia."
            },
            {
                name: "Edward Snowden",
                text: "Las revelaciones de Snowden reforzaron muchas de las alertas que Schneier llevaba tiempo haciendo sobre vigilancia masiva e infraestructuras inseguras por diseño."
            },
            {
                name: "Marta Peirano",
                text: "Ambos recuerdan que el problema no está solo en el uso final del dato, sino en cómo está construida la infraestructura desde el principio."
            }
        ]
    },
    5: {
        name:       "Edward Snowden",
        role:       "Perfil: Exanalista NSA / Inteligencia de señales · EE.UU.",
        image:      "./fotos_utilizadas/EdwardSnowden.jpg",
        imageClass: "author-snowden",
        text: "Snowden está aquí porque convirtió en evidencia algo que durante años se trataba como hipótesis exagerada. Lo que me parece más importante de su caso no es el escándalo en sí, sino lo que demostró técnicamente: que la vigilancia masiva no era una posibilidad futura sino una realidad operativa ya construida. Y que esa realidad no distinguía entre ciudadanos sospechosos y ciudadanos corrientes. Eso cambió bastante la forma de leer todo lo demás.",
        links: [
            {
                name: "Shoshana Zuboff",
                text: "Sus filtraciones dejaron claro que la lógica de acumulación de datos no se limitaba al mercado privado, sino que estaba igual de presente en estructuras estatales."
            },
            {
                name: "Bruce Schneier",
                text: "Schneier fue una de las pocas voces técnicas que supo explicar con precisión el alcance real de lo que Snowden reveló."
            },
            {
                name: "Marta Peirano",
                text: "Buena parte de la divulgación crítica sobre vigilancia digital cobró otra dimensión después de sus filtraciones, y Peirano es uno de los ejemplos más claros."
            }
        ]
    },
    6: {
        name:       "Marta Peirano",
        role:       "Perfil: Periodismo tecnopolítico · España",
        image:      "./fotos_utilizadas/MartaPeirano.jpg",
        imageClass: "author-peirano",
        text: "Peirano es la que más me ha ayudado a conectar la teoría con lo que veo a diario. Explica muy bien cómo las plataformas no solo recogen datos, sino que están diseñadas para captar atención, generar dependencia y hacer que cedas información sin darte cuenta de que lo estás haciendo. Eso es algo que Zuboff también analiza, pero en Peirano se nota más directamente en ejemplos reconocibles. Para alguien que viene del ámbito técnico, ese puente entre estructura y experiencia cotidiana es muy útil.",
        links: [
            {
                name: "Shoshana Zuboff",
                text: "Acerca al día a día los mecanismos de vigilancia que Zuboff explica a nivel macroeconómico y estructural."
            },
            {
                name: "Carissa Véliz",
                text: "Las dos coinciden en que perder privacidad no es solo un inconveniente técnico: afecta a la libertad real de las personas."
            },
            {
                name: "Bruce Schneier",
                text: "Ambos insisten en que no se puede dejar toda la defensa en manos del usuario individual dentro de un sistema diseñado en su contra."
            },
            {
                name: "Edward Snowden",
                text: "Muchas advertencias actuales sobre vigilancia digital se entienden mejor si se parte del punto de inflexión que supusieron sus filtraciones."
            }
        ]
    }
};

// ==============================
// UTILIDADES DEL MAPA
// ==============================
function getNodeBorderColor(nodeId) {
    switch (nodeId) {
        case 1:
        case 3:
        case 6: return "#4d86d9";
        case 4: return "#8fa56f";
        case 2:
        case 5: return "#b05543";
        default: return "#c97c3c";
    }
}

function getBaseNodesConfig() {
    const imgPath = "./fotos_utilizadas/";

    return [
        { id: 1, label: "Foucault\nFrancia",  shape: "circularImage", image: `${imgPath}francia.png`, borderColor: "#4d86d9" },
        { id: 2, label: "Zuboff\nEE.UU.",     shape: "circularImage", image: `${imgPath}usa.png`,     borderColor: "#b05543" },
        { id: 3, label: "Véliz\nMéxico",       shape: "circularImage", image: `${imgPath}mexico.png`,  borderColor: "#4d86d9" },
        { id: 4, label: "Schneier\nEE.UU.",   shape: "circularImage", image: `${imgPath}usa.png`,     borderColor: "#8fa56f" },
        { id: 5, label: "Snowden\nEE.UU.",    shape: "circularImage", image: `${imgPath}usa.png`,     borderColor: "#b05543" },
        { id: 6, label: "Peirano\nEspaña",    shape: "circularImage", image: `${imgPath}espana.png`,  borderColor: "#4d86d9" }
    ];
}

function getBaseEdgesConfig() {
    return [
        { id: "1-2", from: 1, to: 2 },
        { id: "1-3", from: 1, to: 3 },
        { id: "2-3", from: 2, to: 3 },
        { id: "2-5", from: 2, to: 5 },
        { id: "2-6", from: 2, to: 6 },
        { id: "3-4", from: 3, to: 4 },
        { id: "3-6", from: 3, to: 6 },
        { id: "4-5", from: 4, to: 5 },
        { id: "4-6", from: 4, to: 6 },
        { id: "5-6", from: 5, to: 6 }
    ];
}

// ==============================
// RENDER DE CONEXIONES
// ==============================
function renderAuthorLinks(links) {
    if (!links || !links.length) return "";

    return `
        <div class="author-links-title">POR QUÉ CONECTA CON OTROS</div>
        <div class="author-links-list">
            ${links.map((link) => `
                <div class="author-link-item">
                    <strong>${link.name}:</strong> ${link.text}
                </div>
            `).join("")}
        </div>
    `;
}

// ==============================
// RENDER DE FICHA DE AUTOR
// ==============================
function renderAuthorCard(author) {
    if (!author) return getDefaultAuthorCard();

    return `
        <div class="author-card">
            <div class="author-photo-wrap">
                <img
                    src="${author.image}"
                    class="author-photo ${author.imageClass || ""}"
                    alt="Foto de ${author.name}"
                >
            </div>
            <div class="author-meta">
                <h3>${author.name}</h3>
                <div class="author-role">${author.role}</div>
                <div class="author-text">${author.text}</div>
                ${renderAuthorLinks(author.links)}
            </div>
        </div>
    `;
}

// ==============================
// ACTUALIZAR TARJETA DE AUTOR
// ==============================
function updateAuthorInfo(author) {
    const authorInfo = document.getElementById("author-info");
    if (!authorInfo) return;

    authorInfo.style.opacity   = "0.45";
    authorInfo.style.transform = "translateY(5px)";

    setTimeout(() => {
        authorInfo.innerHTML       = author ? renderAuthorCard(author) : getDefaultAuthorCard();
        authorInfo.style.opacity   = "1";
        authorInfo.style.transform = "translateY(0)";
    }, 140);
}

// ==============================
// INICIALIZACIÓN DEL MAPA
// Devuelve true si todo va bien,
// false si algo falla (para no bloquear reintentos)
// ==============================
function initNetwork() {
    if (typeof vis === "undefined") {
        console.warn("Vis.js no está disponible. El mapa no se puede cargar.");
        const container = document.getElementById("mynetwork");
        if (container) {
            container.innerHTML = `
                <div style="
                    display:flex; align-items:center; justify-content:center;
                    height:100%; color:#c9b497; font-family:'Space Mono',monospace;
                    font-size:0.78rem; letter-spacing:0.08em; text-align:center;
                    padding: 1rem;
                ">
                    El mapa no ha podido cargarse.<br>Comprueba la conexión e intenta recargar la página.
                </div>
            `;
        }
        return false;
    }

    const container = document.getElementById("mynetwork");
    if (!container) return false;

    try {
        const baseNodes = getBaseNodesConfig();
        const baseEdges = getBaseEdgesConfig();

        networkNodes = new vis.DataSet(
            baseNodes.map((node) => ({
                ...node,
                size: BASE_SIZE,
                borderWidth: 5,
                borderWidthSelected: 7,
                opacity: 1,
                color: {
                    border: node.borderColor,
                    highlight: { border: node.borderColor, background: "#ffffff" },
                    hover:     { border: node.borderColor, background: "#ffffff" }
                },
                font: {
                    color: "#f7ecd9",
                    size: 14,
                    face: "Arial",
                    strokeWidth: 4,
                    strokeColor: "#0f0b09",
                    multi: true
                }
            }))
        );

        networkEdges = new vis.DataSet(
            baseEdges.map((edge) => ({
                ...edge,
                width: 2.6,
                color: {
                    color:     "rgba(235, 220, 195, 0.35)",
                    highlight: "#d9873d",
                    hover:     "#f0c48b",
                    opacity:   1
                }
            }))
        );

        const options = {
            autoResize: true,
            nodes: {
                shape: "circularImage",
                size: BASE_SIZE,
                font: {
                    size: 14,
                    color: "#f7ecd9",
                    face: "Arial",
                    strokeWidth: 4,
                    strokeColor: "#0f0b09",
                    multi: true
                },
                shadow: {
                    enabled: true,
                    color: "rgba(0,0,0,0.5)",
                    size: 10,
                    x: 0,
                    y: 4
                }
            },
            edges: {
                width: 2.6,
                color: {
                    color:     "rgba(235, 220, 195, 0.35)",
                    highlight: "#d9873d",
                    hover:     "#f0c48b"
                },
                smooth: { type: "continuous" }
            },
            physics: {
                enabled: true,
                solver: "forceAtlas2Based",
                forceAtlas2Based: {
                    gravitationalConstant: -80,
                    centralGravity:        0.05,
                    springLength:          220,
                    springConstant:        0.08,
                    damping:               0.4,
                    avoidOverlap:          1
                },
                stabilization: {
                    enabled:        true,
                    iterations:     300,
                    updateInterval: 25
                }
            },
            interaction: {
                dragView: false,
                zoomView: true,   // zoom habilitado (útil en móvil)
                hover:    true
            }
        };

        networkInstance = new vis.Network(
            container,
            { nodes: networkNodes, edges: networkEdges },
            options
        );

        networkInstance.once("stabilizationIterationsDone", () => {
            networkInstance.fit({
                animation: { duration: 450, easingFunction: "easeInOutQuad" }
            });
        });

        networkInstance.on("click", (params) => {
            if (!params.nodes.length) {
                resetNodeFocus();
                return;
            }

            const clickedId = params.nodes[0];

            // Clic en el mismo nodo → deseleccionar
            if (selectedAuthorId === clickedId) {
                resetNodeFocus();
                return;
            }

            selectedAuthorId = clickedId;
            highlightSelectedNode(clickedId);
            updateAuthorInfo(authorDetails[clickedId]);
        });

        networkInstance.on("hoverNode", () => {
            const el = document.getElementById("mynetwork");
            if (el) el.style.cursor = "pointer";
        });

        networkInstance.on("blurNode", () => {
            const el = document.getElementById("mynetwork");
            if (el) el.style.cursor = "default";
        });

        return true;

    } catch (err) {
        console.error("Error al inicializar el mapa de autores:", err);
        return false;
    }
}

// ==============================
// RESALTAR NODO SELECCIONADO
// ==============================
function highlightSelectedNode(selectedId) {
    if (!networkInstance || !networkNodes || !networkEdges) return;

    const connectedNodes = networkInstance.getConnectedNodes(selectedId);
    const connectedEdges = networkInstance.getConnectedEdges(selectedId);

    networkNodes.forEach((node) => {
        const isSelected  = node.id === selectedId;
        const isConnected = connectedNodes.includes(node.id);

        networkNodes.update({
            id:   node.id,
            size: isSelected ? SELECTED_SIZE : isConnected ? CONNECTED_SIZE : BASE_SIZE,
            opacity: isSelected || isConnected ? 1 : DIMMED_OPACITY,
            font: {
                color: isSelected
                    ? "#fff6e6"
                    : isConnected
                        ? "#f7ecd9"
                        : "rgba(247,236,217,0.34)",
                size:        isSelected ? 16 : 14,
                face:        "Arial",
                strokeWidth: 4,
                strokeColor: "#0f0b09",
                multi:       true
            },
            color: {
                border:    getNodeBorderColor(node.id),
                highlight: { border: getNodeBorderColor(node.id), background: "#ffffff" },
                hover:     { border: getNodeBorderColor(node.id), background: "#ffffff" }
            }
        });
    });

    networkEdges.forEach((edge) => {
        const isConnected = connectedEdges.includes(edge.id);

        networkEdges.update({
            id:    edge.id,
            width: isConnected ? 3.6 : 1.8,
            color: {
                color:     isConnected
                    ? "rgba(217, 135, 61, 0.95)"
                    : "rgba(235, 220, 195, 0.12)",
                highlight: "#d9873d",
                hover:     "#f0c48b",
                opacity:   1
            }
        });
    });
}

// ==============================
// RESTAURAR ESTADO INICIAL
// ==============================
function resetNodeFocus() {
    if (!networkNodes || !networkEdges) return;

    selectedAuthorId = null;

    networkNodes.forEach((node) => {
        networkNodes.update({
            id:      node.id,
            size:    BASE_SIZE,
            opacity: 1,
            font: {
                color:       "#f7ecd9",
                size:        14,
                face:        "Arial",
                strokeWidth: 4,
                strokeColor: "#0f0b09",
                multi:       true
            },
            color: {
                border:    getNodeBorderColor(node.id),
                highlight: { border: getNodeBorderColor(node.id), background: "#ffffff" },
                hover:     { border: getNodeBorderColor(node.id), background: "#ffffff" }
            }
        });
    });

    networkEdges.forEach((edge) => {
        networkEdges.update({
            id:    edge.id,
            width: 2.6,
            color: {
                color:     "rgba(235, 220, 195, 0.35)",
                highlight: "#d9873d",
                hover:     "#f0c48b",
                opacity:   1
            }
        });
    });

    updateAuthorInfo(null);
}

// ==============================
// INICIALIZACIÓN DE UI
// ==============================
function initQuoteButtons() {
    document.querySelectorAll(".mini-translate-btn").forEach((btn) => {
        if (!btn.hasAttribute("aria-label")) {
            btn.setAttribute("aria-label", "Mostrar traducción al español");
        }
        if (!btn.hasAttribute("title")) {
            btn.setAttribute("title", "Mostrar traducción al español");
        }
    });
}

function initNavState() {
    const activeNav = document.querySelector(".nav-item.active");
    if (activeNav) activeNav.setAttribute("aria-current", "page");
}

// ==============================
// ARRANQUE
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    updateAuthorInfo(null);
    initQuoteButtons();
    initNavState();
});
