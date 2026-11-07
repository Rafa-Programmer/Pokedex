let todosPokemons = [];
let tipoAtual = "todos";
let textoPesquisa = "";

const nomesStats = {
  hp: "Vida",
  attack: "Ataque",
  defense: "Defesa",
  "special-attack": "Ataque especial",
  "special-defense": "Defesa especial",
  speed: "Velocidade",
};

const nomesTipos = {
  normal: "Normal",
  fire: "Fogo",
  water: "Água",
  electric: "Elétrico",
  grass: "Planta",
  ice: "Gelo",
  fighting: "Lutador",
  poison: "Veneno",
  ground: "Terra",
  flying: "Voador",
  psychic: "Psíquico",
  bug: "Inseto",
  rock: "Pedra",
  ghost: "Fantasma",
  dragon: "Dragão",
  dark: "Sombrio",
  steel: "Aço",
  fairy: "Fada",
};

async function buscarPokemon(nome) {
  const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nome}`);
  if (!resposta.ok) {
    throw new Error("Pokémon não encontrado");
  }
  const dados = await resposta.json();
  return dados;
}

function criarCartao(pokemon) {
  const cartao = document.createElement("div");
  cartao.className = "cartao";
  cartao.classList.add(pokemon.types[0].type.name);
  cartao.innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <h2>${pokemon.name}</h2>
    <p>Nº ${pokemon.id}</p>
  `;
  cartao.addEventListener("click", () => mostrarDetalhes(pokemon));
  return cartao;
}

function mostrarPokemons(pokemons) {
  const container = document.getElementById("lista");
  container.innerHTML = "";

  if (pokemons.length === 0) {
    container.innerHTML = `<p class="mensagem">Nenhum Pokémon encontrado. Para procurar outro, escreve o nome completo ou o número e carrega em Enter.</p>`;
    return;
  }

  pokemons.forEach((pokemon) => {
    container.appendChild(criarCartao(pokemon));
  });
}

function combinaTexto(p) {
  return p.name.includes(textoPesquisa) || String(p.id).includes(textoPesquisa);
}

function aplicarFiltros() {
  const filtrados = todosPokemons.filter((p) => {
    const tipoCerto =
      tipoAtual === "todos" || p.types.some((t) => t.type.name === tipoAtual);
    return combinaTexto(p) && tipoCerto;
  });
  mostrarPokemons(filtrados);
}

function criarFiltros() {
  const container = document.getElementById("filtros");
  const botoes = [["todos", "Todos"], ...Object.entries(nomesTipos)];

  botoes.forEach(([chave, nome]) => {
    const botao = document.createElement("button");
    botao.textContent = nome;
    botao.className = "filtro";
    if (chave === "todos") botao.classList.add("ativo");

    botao.addEventListener("click", () => {
      tipoAtual = chave;
      document
        .querySelectorAll(".filtro")
        .forEach((b) => b.classList.remove("ativo"));
      botao.classList.add("ativo");
      aplicarFiltros();
    });

    container.appendChild(botao);
  });
}

async function pesquisarNaApi(texto) {
  const container = document.getElementById("lista");
  container.innerHTML = `<p class="mensagem">A procurar...</p>`;

  try {
    const pokemon = await buscarPokemon(texto);
    mostrarPokemons([pokemon]);
  } catch (erro) {
    container.innerHTML = `<p class="mensagem">Não encontrei nenhum Pokémon com "${texto}".</p>`;
  }
}

async function iniciar() {
  const pedidos = [];
  for (let id = 1; id <= 151; id++) {
    pedidos.push(buscarPokemon(id));
  }
  todosPokemons = await Promise.all(pedidos);
  criarFiltros();
  aplicarFiltros();
}

const campoPesquisa = document.getElementById("pesquisa");

campoPesquisa.addEventListener("input", (evento) => {
  textoPesquisa = evento.target.value.toLowerCase().trim();
  aplicarFiltros();
});

campoPesquisa.addEventListener("keydown", (evento) => {
  if (evento.key === "Enter" && textoPesquisa !== "") {
    const existeNaLista = todosPokemons.some(combinaTexto);
    if (!existeNaLista) {
      pesquisarNaApi(textoPesquisa);
    }
  }
});

function mostrarDetalhes(pokemon) {
  const tipos = pokemon.types.map((t) => nomesTipos[t.type.name]).join(", ");
  const stats = pokemon.stats
    .map((s) => `<li>${nomesStats[s.stat.name]}: ${s.base_stat}</li>`)
    .join("");

  document.getElementById("detalhes-conteudo").innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <h2>${pokemon.name} (Nº ${pokemon.id})</h2>
    <p>Tipo: ${tipos}</p>
    <p>Altura: ${pokemon.height / 10} m | Peso: ${pokemon.weight / 10} kg</p>
    <ul>${stats}</ul>
  `;
  document.getElementById("detalhes").classList.remove("escondido");
}

document.getElementById("detalhes").addEventListener("click", () => {
  document.getElementById("detalhes").classList.add("escondido");
});

iniciar();
