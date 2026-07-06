const API_URL = "http://localhost:3000";
const COLECAO = "pessoasHistoricas";

let pessoaIdAtual = null;

function mostrarFeedback(tipo, mensagem) {
  const feedback = document.getElementById("feedbackMsg");
  if (!feedback) return;

  feedback.className = `feedback ${tipo === "erro" ? "erro" : "sucesso"}`;
  feedback.textContent = mensagem;
  feedback.classList.remove("d-none");
  feedback.scrollIntoView({ behavior: "smooth", block: "center" });
}

function adicionarCampoFoto(url = "", titulo = "") {
  const container = document.getElementById("fotosContainer");
  if (!container) return;

  const grupo = document.createElement("div");
  grupo.className = "foto-input-group mb-3";
  grupo.innerHTML = `
    <div class="form-row">
      <div>
        <label>URL da foto</label>
        <input type="url" class="foto-url" value="${url}" placeholder="https://..." />
      </div>
      <div>
        <label>Legenda da foto</label>
        <input type="text" class="foto-titulo" value="${titulo}" placeholder="Ex.: Retrato oficial" />
      </div>
    </div>
    <button type="button" class="btn-secondary-cad mt-2 remover-foto">
      <i class="bi bi-trash-fill me-1"></i>Remover foto
    </button>
  `;

  container.appendChild(grupo);

  grupo.querySelector(".remover-foto").addEventListener("click", () => {
    if (container.querySelectorAll(".foto-input-group").length > 1) {
      grupo.remove();
    } else {
      grupo.querySelector(".foto-url").value = "";
      grupo.querySelector(".foto-titulo").value = "";
    }
  });
}

function preencherFormulario(pessoa) {
  document.getElementById("nome").value = pessoa.nome || "";
  document.getElementById("subtitulo").value = pessoa.subtitulo || "";
  document.getElementById("descricao").value = pessoa.descricao || "";
  document.getElementById("descricaoCompleta").value = pessoa.descricaoCompleta || "";
  document.getElementById("imagem").value = pessoa.imagem || "";
  document.getElementById("nacionalidade").value = pessoa.nacionalidade || "";
  document.getElementById("areaDeAtuacao").value = pessoa.areaDeAtuacao || "";
  document.getElementById("nascimento").value = pessoa.nascimento || "";
  document.getElementById("falecimento").value = pessoa.falecimento || "";
  document.getElementById("legado").value = pessoa.legado || "";
  document.getElementById("destaque").checked = Boolean(pessoa.destaque);

  const container = document.getElementById("fotosContainer");
  if (!container) return;

  container.innerHTML = "";
  if (Array.isArray(pessoa.fotos) && pessoa.fotos.length > 0) {
    pessoa.fotos.forEach((foto) => adicionarCampoFoto(foto.url || "", foto.titulo || ""));
  } else {
    adicionarCampoFoto();
  }
}

function coletarDadosFormulario() {
  const form = document.getElementById("formCadastro");
  const dados = {
    nome: document.getElementById("nome").value.trim(),
    subtitulo: document.getElementById("subtitulo").value.trim(),
    descricao: document.getElementById("descricao").value.trim(),
    descricaoCompleta: document.getElementById("descricaoCompleta").value.trim(),
    imagem: document.getElementById("imagem").value.trim(),
    nacionalidade: document.getElementById("nacionalidade").value.trim(),
    areaDeAtuacao: document.getElementById("areaDeAtuacao").value.trim(),
    nascimento: document.getElementById("nascimento").value.trim(),
    falecimento: document.getElementById("falecimento").value.trim(),
    legado: document.getElementById("legado").value.trim(),
    destaque: document.getElementById("destaque").checked,
    fotos: []
  };

  const grupos = [...document.querySelectorAll(".foto-input-group")];
  grupos.forEach((grupo) => {
    const url = grupo.querySelector(".foto-url")?.value?.trim() || "";
    const titulo = grupo.querySelector(".foto-titulo")?.value?.trim() || "";
    if (url || titulo) {
      dados.fotos.push({ url, titulo });
    }
  });

  if (!form.checkValidity()) {
    form.reportValidity();
    return null;
  }

  return dados;
}

async function carregarPessoa(id) {
  const response = await fetch(`${API_URL}/${COLECAO}/${id}`);
  if (!response.ok) throw new Error("Pessoa não encontrada");
  return response.json();
}

async function salvarPessoa(dados) {
  const metodo = pessoaIdAtual ? "PUT" : "POST";
  const url = pessoaIdAtual ? `${API_URL}/${COLECAO}/${pessoaIdAtual}` : `${API_URL}/${COLECAO}`;

  const response = await fetch(url, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  });

  if (!response.ok) {
    throw new Error("Não foi possível salvar a pessoa histórica.");
  }

  return response.json();
}

function configurarModoEdicao(pessoa) {
  const titulo = document.querySelector(".cadastro-titulo");
  const subtitulo = document.querySelector(".cadastro-sub");
  if (titulo) {
    titulo.innerHTML = '<i class="bi bi-pencil-square me-2"></i>Editar pessoa histórica';
  }
  if (subtitulo) {
    subtitulo.textContent = "Altere os dados abaixo e salve as mudanças no JSON Server.";
  }

  const containerAcoes = document.querySelector(".form-actions");
  if (containerAcoes && !document.getElementById("btnExcluir")) {
    const botaoExcluir = document.createElement("button");
    botaoExcluir.id = "btnExcluir";
    botaoExcluir.type = "button";
    botaoExcluir.className = "btn-secondary-cad";
    botaoExcluir.innerHTML = '<i class="bi bi-trash-fill me-1"></i>Excluir pessoa';
    botaoExcluir.addEventListener("click", async () => {
      if (!confirm("Deseja realmente excluir esta pessoa histórica?")) return;

      try {
        const response = await fetch(`${API_URL}/${COLECAO}/${pessoaIdAtual}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Erro ao excluir");
        mostrarFeedback("sucesso", "Pessoa removida com sucesso.");
        setTimeout(() => {
          window.location.href = "index.html";
        }, 800);
      } catch (err) {
        mostrarFeedback("erro", err.message || "Não foi possível excluir a pessoa.");
      }
    });
    containerAcoes.prepend(botaoExcluir);
  }
}

async function inicializarCadastro() {
  const params = new URLSearchParams(window.location.search);
  pessoaIdAtual = params.get("id");

  const form = document.getElementById("formCadastro");
  const btnAdicionarFoto = document.getElementById("btnAddFoto");

  if (btnAdicionarFoto) {
    btnAdicionarFoto.addEventListener("click", () => adicionarCampoFoto());
  }

  adicionarCampoFoto();

  if (pessoaIdAtual) {
    try {
      const pessoa = await carregarPessoa(pessoaIdAtual);
      preencherFormulario(pessoa);
      configurarModoEdicao(pessoa);
    } catch (err) {
      mostrarFeedback("erro", "Não foi possível carregar a pessoa para edição.");
    }
  }

  if (form) {
    form.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      const dados = coletarDadosFormulario();
      if (!dados) return;

      try {
        const pessoaSalva = await salvarPessoa(dados);
        mostrarFeedback("sucesso", pessoaIdAtual ? "Pessoa atualizada com sucesso!" : "Pessoa cadastrada com sucesso!");
        setTimeout(() => {
          window.location.href = `detalhes.html?id=${pessoaSalva.id}`;
        }, 800);
      } catch (err) {
        mostrarFeedback("erro", err.message || "Não foi possível salvar a pessoa.");
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", inicializarCadastro);
