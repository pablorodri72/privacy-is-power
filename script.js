// ==============================
// CONFIGURACIÓN BASE
// ==============================
const BASE_SIZE = 24;
const SELECTED_SIZE = 31;
const CONNECTED_SIZE = 24;
const DIMMED_OPACITY = 0.24;

let isOpening = false;
let networkInitialized = false;
let networkInstance = null;
let networkNodes = null;
let networkEdges = null;
let selectedAuthorId = null; // Vuelve a null por defecto

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
    const panels = document.querySelectorAll(".content-section");
    const navItems = document.querySelectorAll(".nav-item");

    panels.forEach((panel) => {
        panel.classList.remove("active");
    });

    navItems.forEach((item) => {
        item.classList.remove("active");
        item.removeAttribute("aria-current");
    });

    const selectedPanel = document.getElementById(`panel-${id}`);
    if (selectedPanel) {
        selectedPanel.classList.add("active");
    }

    if (el) {
        el.classList.add("active");
        el.setAttribute("aria-current", "page");
    }

    const rightPanel = document.querySelector(".panel-right");
    if (rightPanel) {
        rightPanel.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    if (id === "mapa" && !networkInitialized) {
        setTimeout(initNetwork, 100);
        networkInitialized = true;
    }

    if (id === "mapa" && networkInstance) {
        setTimeout(() => {
            networkInstance.fit({
                animation: {
                    duration: 350,
                    easingFunction: "easeInOutQuad"
                }
            });
        }, 120);
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
        btn.innerHTML = '<img src="/privacy-is-power/fotos_utilizadas/UK.png" alt="UK" class="btn-flag"> Original';
        btn.setAttribute("aria-label", "Mostrar cita original en inglés");
        btn.setAttribute("title", "Mostrar cita original en inglés");
    } else {
        textEn.style.display = "inline";
        textEs.style.display = "none";
        btn.innerHTML = '<img src="/privacy-is-power/fotos_utilizadas/espana.png" alt="ES" class="btn-flag"> Traducir';
        btn.setAttribute("aria-label", "Mostrar traducción al español");
        btn.setAttribute("title", "Mostrar traducción al español");
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
                    Haz clic sobre uno de los circulos para abrir su ficha y ver por qué los diferentes autores están conectados entre sí dentro de este mapa mental
                </div>
            </div>
        </div>
    `;
}

// ==============================
// DATOS DE AUTORES ACTUALIZADOS
// ==============================
const authorDetails = {
    1: {
        name: "Michel Foucault",
        role: "Perfil: Filosofía postestructuralista",
        image: "/privacy-is-power/fotos_utilizadas/MichelFoucault.jpg",
        imageClass: "author-foucault",
        text: "He decidido incluir a Foucault porque sigue siendo muy útil. Da a entender la vigilancia como algo más profundo que una simple observación externa, para el lo importante no es solo que alguien mire, sino que esa posibilidad de ser observado termine influyendo en la conducta. Aunque sus libros fueran mas antiguos su marco ayuda bastante a entender por qué la vigilancia nunca es neutral: siempre reorganiza una relación de poder.",
        links: [
            {
                name: "Carissa Véliz",
                text: "Conecta con Véliz porque las dos miradas permiten entender que quien sabe más y observa más no solo acumula información, sino capacidad de influencia."
            },
            {
                name: "Shoshana Zuboff",
                text: "Conecta con Zuboff porque ella traslada esa lógica de observación y control al terreno de las plataformas y de la economía digital."
            }
        ]
    },
    2: {
        name: "Shoshana Zuboff",
        role: "Perfil: Sociología económica",
        image: "/privacy-is-power/fotos_utilizadas/ShoshanaZuboff.jpg",
        imageClass: "author-zuboff",
        text: "Zuboff me parece clave porque explica muy bien la parte económica del problema. A diferencia de Véliz que insiste mucho en la autonomía, en la libertad y en el desequilibrio político, Zuboff enseña cómo esa extracción de datos se convierte además en un modelo de negocio. Su aportación mas destacada (para mí) es dejar claro que no se recopilan datos por accidente: se recopilan porque generan predicción, ventaja competitiva y rentabilidad.",
        links: [
            {
                name: "Michel Foucault",
                text: "Conecta con Foucault porque toma una lógica de vigilancia y la sitúa dentro de infraestructuras privadas que convierten la observación en negocio."
            },
            {
                name: "Carissa Véliz",
                text: "Dicho en la descripcion, conecta con Véliz porque ambas critican la acumulación masiva de datos, aunque una lo haga más desde la estructura económica y la otra desde el daño ético y político."
            },
            {
                name: "Edward Snowden",
                text: "Conecta con Snowden porque sus filtraciones (como por ejemplo el programa PRISM, donde demostró que el gobierno se metía directamente en los datos de Google y Facebook) dejaron claro que esto no es solo cosa de empresas que quieren venderte sus movidas."
            },
            {
                name: "Marta Peirano",
                text: "Conecta con Peirano porque ella consigue traducir a un lenguaje más cotidiano muchas dinámicas que Zuboff analiza a escala sistémica."
            }
        ]
    },
    3: {
        name: "Carissa Véliz",
        role: "Perfil: Ética y Filosofía digital",
        image: "/privacy-is-power/fotos_utilizadas/CarissaVeliz.jpg",
        imageClass: "author-veliz",
        text: "Véliz es el centro del trabajo porque consigue algo muy importante: entedio que la privacidad es mucho más que esconder cosas y la convertio en una cuestión política. En su planteamiento, el problema no es solo que sepan cosas de nosotros, sino que esa acumulación de datos acaba dando demasiado poder a quien los controla. Esa idea es la base de casi todo este proyecto y, en mi opinión, es la razón por la que el libro sigue siendo tan útil.",
        links: [
            {
                name: "Michel Foucault",
                text: "Conecta con Foucault porque en ambos aparece la idea de que la vigilancia nunca es inocente y siempre altera una relación de fuerzas."
            },
            {
                name: "Shoshana Zuboff",
                text: "Conecta con Zuboff porque las dos ayudan a ver que el problema del dato no es puntual, sino estructural."
            },
            {
                name: "Bruce Schneier",
                text: "Conecta con Schneier porque él aporta la parte técnica y de diseño que complementa bien la crítica ética de Véliz."
            },
            {
                name: "Marta Peirano",
                text: "Conecta con Peirano porque ambas insisten en que te quiten la privacidad no es algo que solo pase en las películas, sino algo que ya condiciona la vida diaria."
            }
        ]
    },
    4: {
        name: "Bruce Schneier",
        role: "Perfil: Criptografía y Ciberseguridad",
        image: "/privacy-is-power/fotos_utilizadas/BruceSchneier.jpg",
        imageClass: "author-bruce",
        text: "Schneier me parece importante porque lleva esta discusión al terreno técnico, mientras otros autores ayudan a entender el problema en términos políticos o sociales, él obliga a pensar en diseño seguro, minimización de datos, cifrado y sistemas que no dependan de recolectar más información de la necesaria. Evita que todo se quede en una crítica general sin consecuencias prácticas.",
        links: [
            {
                name: "Carissa Véliz",
                text: "Conecta con Véliz porque ofrece criterios técnicos y de diseño para responder a muchos de los riesgos que ella denuncia."
            },
            {
                name: "Edward Snowden",
                text: "Conecta con Snowden porque sus revelaciones reforzaron muchas de las alertas que Schneier llevaba tiempo haciendo sobre vigilancia e infraestructuras inseguras."
            },
            {
                name: "Marta Peirano",
                text: "Conecta con Peirano porque ambos recuerdan que el problema no está solo en el uso final del dato, sino también en cómo está construida la infraestructura."
            }
        ]
    },
    5: {
        name: "Edward Snowden",
        role: "Perfil: Inteligencia de señales (Ex-NSA)",
        image: "/privacy-is-power/fotos_utilizadas/EdwardSnowden.jpg",
        imageClass: "author-snowden",
        text: "Snowden aparece aquí porque convirtió en prueba algo que durante años parecía exagerado. Sus filtraciones demostraron que la vigilancia masiva no era una hipótesis, sino una realidad técnica y política. Por eso me parece importante en este mapa: sirve para recordar que el problema de la privacidad no se agota en las plataformas ni en la publicidad, sino que también afecta al Estado, a la inteligencia y al equilibrio entre libertad y seguridad.",
        links: [
            {
                name: "Shoshana Zuboff",
                text: "Conecta con Zuboff porque ayuda a ver que la lógica de acumulación de datos no estaba limitada al mercado, sino presente también en estructuras institucionales."
            },
            {
                name: "Bruce Schneier",
                text: "Conecta con Schneier porque él fue una de las voces que mejor explicó el alcance técnico y político de las revelaciones de Snowden."
            },
            {
                name: "Marta Peirano",
                text: "Conecta con Peirano porque buena parte de la divulgación crítica sobre vigilancia ganó otra dimensión después de su caso."
            }
        ]
    },
    6: {
        name: "Marta Peirano",
        role: "Perfil: Periodismo tecnopolítico",
        image: "/privacy-is-power/fotos_utilizadas/MartaPeirano.jpg",
        imageClass: "author-peirano",
        text: "Peirano me parece importante porque consigue traducir todo este debate a un lenguaje más cercano y reconocible. Explica muy bien cómo plataformas, aplicaciones y redes están diseñadas para captar atención, generar dependencia y extraer datos de manera constante. Gracias a ella se pudieron unir teoría y experiencia cotidiana.",
        links: [
            {
                name: "Shoshana Zuboff",
                text: "Conecta con Zuboff porque acerca al día a día mecanismos de vigilancia que Zuboff explica a nivel estructural."
            },
            {
                name: "Carissa Véliz",
                text: "Conecta con Véliz porque ambas coinciden en que perder privacidad afecta a la libertad real, no solo a la comodidad del usuario."
            },
            {
                name: "Bruce Schneier",
                text: "Conecta con Schneier porque ambos insisten en que no se puede dejar toda la defensa en manos del usuario."
            },
            {
                name: "Edward Snowden",
                text: "Conecta con Snowden porque muchas advertencias actuales sobre vigilancia se entienden mejor desde el punto de inflexión que supusieron sus filtraciones."
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
        case 6:
            return "#4d86d9";
        case 4:
            return "#8fa56f";
        case 2:
        case 5:
            return "#b05543";
        default:
            return "#c97c3c";
    }
}

function getBaseNodesConfig() {
    const imgPath = "/privacy-is-power/fotos_utilizadas/";

    return [
        { id: 1, label: "Foucault\nFrancia", shape: "circularImage", image: `${imgPath}francia.png`, borderColor: "#4d86d9" },
        { id: 2, label: "Zuboff\nEE.UU.", shape: "circularImage", image: `${imgPath}usa.png`, borderColor: "#b05543" },
        { id: 3, label: "Véliz\nEspaña", shape: "circularImage", image: `${imgPath}espana.png`, borderColor: "#4d86d9" },
        { id: 4, label: "Schneier\nEE.UU.", shape: "circularImage", image: `${imgPath}usa.png`, borderColor: "#8fa56f" },
        { id: 5, label: "Snowden\nEE.UU.", shape: "circularImage", image: `${imgPath}usa.png`, borderColor: "#b05543" },
        { id: 6, label: "Peirano\nEspaña", shape: "circularImage", image: `${imgPath}espana.png`, borderColor: "#4d86d9" }
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
        <div class="author-links-title">
            POR QUÉ CONECTA CON OTROS
        </div>
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
                <img src="${author.image}" class="author-photo ${author.imageClass || ""}" alt="${author.name}">
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

    authorInfo.style.opacity = "0.45";
    authorInfo.style.transform = "translateY(5px)";

    setTimeout(() => {
        authorInfo.innerHTML = author ? renderAuthorCard(author) : getDefaultAuthorCard();
        authorInfo.style.opacity = "1";
        authorInfo.style.transform = "translateY(0)";
    }, 140);
}

// ==============================
// INICIALIZACIÓN DEL MAPA
// ==============================
function initNetwork() {
    if (typeof vis === "undefined") return;

    const container = document.getElementById("mynetwork");
    if (!container) return;

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
                highlight: {
                    border: node.borderColor,
                    background: "#ffffff"
                },
                hover: {
                    border: node.borderColor,
                    background: "#ffffff"
                }
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
                color: "rgba(235, 220, 195, 0.35)",
                highlight: "#d9873d",
                hover: "#f0c48b",
                opacity: 1
            }
        }))
    );

    const data = {
        nodes: networkNodes,
        edges: networkEdges
    };

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
                color: "rgba(235, 220, 195, 0.35)",
                highlight: "#d9873d",
                hover: "#f0c48b"
            },
            smooth: {
                type: "continuous"
            }
        },
        physics: {
            enabled: true,
            solver: "forceAtlas2Based",
            forceAtlas2Based: {
                gravitationalConstant: -80,
                centralGravity: 0.05,
                springLength: 220,
                springConstant: 0.08,
                damping: 0.4,
                avoidOverlap: 1
            },
            stabilization: {
                enabled: true,
                iterations: 300,
                updateInterval: 25
            }
        },
        interaction: {
            dragView: false,
            zoomView: false,
            hover: true
        }
    };

    networkInstance = new vis.Network(container, data, options);

    networkInstance.once("stabilizationIterationsDone", () => {
        networkInstance.fit({
            animation: {
                duration: 450,
                easingFunction: "easeInOutQuad"
            }
        });
    });

    networkInstance.on("click", (params) => {
        if (!params.nodes.length) {
            resetNodeFocus();
            return;
        }

        const clickedId = params.nodes[0];

        if (selectedAuthorId === clickedId) {
            resetNodeFocus();
            return;
        }

        selectedAuthorId = clickedId;
        highlightSelectedNode(clickedId);
        updateAuthorInfo(authorDetails[clickedId]);
    });

    networkInstance.on("hoverNode", () => {
        const containerEl = document.getElementById("mynetwork");
        if (containerEl) {
            containerEl.style.cursor = "pointer";
        }
    });

    networkInstance.on("blurNode", () => {
        const containerEl = document.getElementById("mynetwork");
        if (containerEl) {
            containerEl.style.cursor = "default";
        }
    });
}

// ==============================
// RESALTAR NODO SELECCIONADO
// ==============================
function highlightSelectedNode(selectedId) {
    if (!networkInstance || !networkNodes || !networkEdges) return;

    const connectedNodes = networkInstance.getConnectedNodes(selectedId);
    const connectedEdges = networkInstance.getConnectedEdges(selectedId);

    networkNodes.forEach((node) => {
        const isSelected = node.id === selectedId;
        const isConnected = connectedNodes.includes(node.id);

        networkNodes.update({
            id: node.id,
            size: isSelected ? SELECTED_SIZE : isConnected ? CONNECTED_SIZE : BASE_SIZE,
            opacity: isSelected || isConnected ? 1 : DIMMED_OPACITY,
            font: {
                color: isSelected ? "#fff6e6" : isConnected ? "#f7ecd9" : "rgba(247,236,217,0.34)",
                size: isSelected ? 16 : 14,
                face: "Arial",
                strokeWidth: 4,
                strokeColor: "#0f0b09",
                multi: true
            },
            color: {
                border: getNodeBorderColor(node.id),
                highlight: {
                    border: getNodeBorderColor(node.id),
                    background: "#ffffff"
                },
                hover: {
                    border: getNodeBorderColor(node.id),
                    background: "#ffffff"
                }
            }
        });
    });

    networkEdges.forEach((edge) => {
        const isConnected = connectedEdges.includes(edge.id);

        networkEdges.update({
            id: edge.id,
            width: isConnected ? 3.6 : 1.8,
            color: {
                color: isConnected ? "rgba(217, 135, 61, 0.95)" : "rgba(235, 220, 195, 0.12)",
                highlight: "#d9873d",
                hover: "#f0c48b",
                opacity: 1
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
            id: node.id,
            size: BASE_SIZE,
            opacity: 1,
            font: {
                color: "#f7ecd9",
                size: 14,
                face: "Arial",
                strokeWidth: 4,
                strokeColor: "#0f0b09",
                multi: true
            },
            color: {
                border: getNodeBorderColor(node.id),
                highlight: {
                    border: getNodeBorderColor(node.id),
                    background: "#ffffff"
                },
                hover: {
                    border: getNodeBorderColor(node.id),
                    background: "#ffffff"
                }
            }
        });
    });

    networkEdges.forEach((edge) => {
        networkEdges.update({
            id: edge.id,
            width: 2.6,
            color: {
                color: "rgba(235, 220, 195, 0.35)",
                highlight: "#d9873d",
                hover: "#f0c48b",
                opacity: 1
            }
        });
    });

    updateAuthorInfo(null);
}

// ==============================
// INICIALIZACIÓN DE UI
// ==============================
function initQuoteButtons() {
    const buttons = document.querySelectorAll(".mini-translate-btn");

    buttons.forEach((btn) => {
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
    if (activeNav) {
        activeNav.setAttribute("aria-current", "page");
    }
}

// ==============================
// ESTADO INICIAL
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    // Al arrancar, no hay ningún autor seleccionado
    updateAuthorInfo(null);
    initQuoteButtons();
    initNavState();
});
