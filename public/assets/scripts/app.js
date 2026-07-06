

const API_URL = "http://localhost:3000";
const COLECAO = "pessoasHistoricas";

let todasAsPessoas = [];
let termoPesquisa = "";
let filtroAtivo = false;
let favoritos = [];
let usuarioLogado = null;

async function fetchItems() {
  const response = await fetch(`${API_URL}/${COLECAO}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function carregarUsuario() {
  usuarioLogado = JSON.parse(sessionStorage.getItem("usuarioLogado") || "null");
}

async function carregarFavoritos() {
  await carregarUsuario();
  if (!usuarioLogado) {
    favoritos = [];
    return;
  }

  try {
    const response = await fetch(`${API_URL}/favoritos`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const dados = await response.json();
    favoritos = dados.filter((item) => item.usuarioId === usuarioLogado.id || item.userId === usuarioLogado.id);
  } catch (err) {
    favoritos = [];
  }
}

function isFavorito(pessoaId) {
  return favoritos.some((item) => item.pessoaId === pessoaId);
}

function createCard(p) {
  const col = document.createElement("div");
  col.className = "col";
  const favoritoAtivo = isFavorito(p.id);

  col.innerHTML = `
    <div class="card-historico">
      <div class="card-img-wrapper">
        <a href="detalhes.html?id=${p.id}" class="card-historico-link">
          <img
            src="${p.imagem}"
            alt="${p.nome}"
            onerror="this.src='https://via.placeholder.com/400x300/8d6e63/ffffff?text=${encodeURIComponent(p.nome)}'"
          >
          <div class="card-overlay">
            <span><i class="bi bi-eye-fill me-1"></i>Ver detalhes</span>
          </div>
        </a>
        <button class="btn-favorito ${usuarioLogado ? "ativo" : ""}" type="button" data-id="${p.id}" onclick="toggleFavorito(${p.id})">
          <i class="bi ${favoritoAtivo ? "bi-heart-fill" : "bi-heart"}"></i>
        </button>
      </div>
      <div class="card-body-historico">
        <span class="card-subtitulo">${p.subtitulo}</span>
        <h5 class="card-nome">${p.nome}</h5>
        <p class="card-desc">${p.descricao.substring(0, 100)}...</p>
        <div class="card-meta">
          <span><i class="bi bi-geo-alt-fill me-1"></i>${p.nacionalidade}</span>
        </div>
      </div>
    </div>`;
  return col;
}

function renderCards(lista) {
  const grid = document.getElementById("grid-pessoas");
  if (!grid) return;
  grid.innerHTML = "";

  if (lista.length === 0) {
    grid.innerHTML = `
      <div class="col-12 text-center py-5">
        <p class="sem-resultados">
          <i class="bi bi-search me-2"></i>Nenhuma pessoa encontrada.
        </p>
      </div>`;
  } else {
    lista.forEach((p) => grid.appendChild(createCard(p)));
  }
}

function atualizarHeaderUsuario() {
  const linkFavoritos = document.getElementById("linkFavoritos");
  const btnLogin = document.getElementById("btnLoginHeader");
  const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado") || "null");

  if (usuario) {
    if (linkFavoritos) linkFavoritos.classList.remove("d-none");
    if (btnLogin) {
      btnLogin.innerHTML = '<i class="bi bi-box-arrow-left me-1"></i>Sair';
      btnLogin.onclick = () => {
        sessionStorage.removeItem("usuarioLogado");
        location.reload();
      };
    }
  } else {
    if (linkFavoritos) linkFavoritos.classList.add("d-none");
    if (btnLogin) {
      btnLogin.innerHTML = '<i class="bi bi-box-arrow-in-right me-1"></i>Login';
      btnLogin.onclick = () => window.location.href = "login.html";
    }
  }
}

async function toggleFavorito(pessoaId) {
  if (!usuarioLogado) {
    window.location.href = "login.html";
    return;
  }

  const favoritoAtual = favoritos.find((item) => item.pessoaId === pessoaId);

  try {
    if (favoritoAtual) {
      await fetch(`${API_URL}/favoritos/${favoritoAtual.id}`, { method: "DELETE" });
      favoritos = favoritos.filter((item) => item.id !== favoritoAtual.id);
    } else {
      const response = await fetch(`${API_URL}/favoritos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pessoaId, usuarioId: usuarioLogado.id })
      });
      if (response.ok) {
        const itemCriado = await response.json();
        favoritos.push(itemCriado);
      }
    }

    renderCards(getPessoasFiltradas());
  } catch (err) {
    console.error("Erro ao alterar favorito:", err);
  }
}

const renderGrid = renderCards;

function renderCarousel(pessoas) {
  const destaques = pessoas.filter((p) => p.destaque);
  const indicators = document.getElementById("carousel-indicators");
  const inner = document.getElementById("carousel-inner");

  if (!indicators || !inner) return;

  indicators.innerHTML = "";
  inner.innerHTML = "";

  destaques.forEach((p, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("data-bs-target", "#carousel-destaques");
    btn.setAttribute("data-bs-slide-to", i);
    if (i === 0) btn.classList.add("active");
    indicators.appendChild(btn);

    const item = document.createElement("div");
    item.className = "carousel-item" + (i === 0 ? " active" : "");
    item.innerHTML = `
      <div class="carousel-slide-custom">
        <div class="carousel-img-wrapper">
          <img
            src="${p.imagem}"
            alt="${p.nome}"
            onerror="this.src='https://via.placeholder.com/500x400/8d6e63/ffffff?text=${encodeURIComponent(p.nome)}'"
          >
        </div>
        <div class="carousel-caption-custom">
          <span class="carousel-badge">${p.subtitulo}</span>
          <h3>${p.nome}</h3>
          <p>${p.descricao}</p>
          <a href="detalhes.html?id=${p.id}" class="btn-ver-mais">
            Ver mais <i class="bi bi-arrow-right-circle-fill ms-1"></i>
          </a>
        </div>
      </div>`;
    inner.appendChild(item);
  });
}

function getPessoasFiltradas() {
  let lista = todasAsPessoas;
  if (termoPesquisa.trim()) {
    const termo = termoPesquisa.trim().toLowerCase();
    lista = lista.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        p.descricao.toLowerCase().includes(termo) ||
        (p.subtitulo && p.subtitulo.toLowerCase().includes(termo))
    );
  }
  return lista;
}

function filtrarPessoas() {
  termoPesquisa = document.getElementById("campoPesquisa").value;
  renderGrid(getPessoasFiltradas());
}

function mostrarTodos() {
  filtroAtivo = false;
  termoPesquisa = "";
  document.getElementById("campoPesquisa").value = "";
  document.getElementById("btnTodos").classList.add("ativo");
  document.getElementById("btnFiltro").classList.remove("ativo");
  renderGrid(todasAsPessoas);
}

function alternarFiltro() {
  filtroAtivo = true;
  document.getElementById("btnFiltro").classList.add("ativo");
  document.getElementById("btnTodos").classList.remove("ativo");
  renderGrid(getPessoasFiltradas());
}

async function init() {
  try {
    await carregarFavoritos();
    atualizarHeaderUsuario();
    const pessoas = await fetchItems();
    todasAsPessoas = pessoas;

    renderCarousel(pessoas);
    document.getElementById("loadingCarousel").classList.add("d-none");
    document.getElementById("carousel-destaques").classList.remove("d-none");

    renderCards(getPessoasFiltradas());
    document.getElementById("loadingGrid").classList.add("d-none");
    document.getElementById("grid-pessoas").classList.remove("d-none");
  } catch (err) {
    console.error("Erro ao inicializar:", err);
    document.getElementById("loadingCarousel").classList.add("d-none");
    document.getElementById("loadingGrid").classList.add("d-none");
    document.getElementById("erroConexao").classList.remove("d-none");
  }
}

function iniciarIndex() {
  const campoPesquisa = document.getElementById("campoPesquisa");
  if (campoPesquisa) {
    campoPesquisa.addEventListener("input", filtrarPessoas);
    campoPesquisa.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        filtrarPessoas();
      }
    });
  }
  init();
}
