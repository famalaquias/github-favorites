import { GithubUser } from './GithubUser.js';

/* classe que contém a lógica dos dados */
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  /* usersFavorites: vai verificar se há usuários na caixa de favorites */
  usersFavorites() {
    if (this.entries.length === 0) {
      document.querySelector("#favorites").style.display = ""
    } else {
      document.querySelector("#favorites").style.display = "none"
    }
  }

  /* load: vai fazer o carregamento de dados dos usuários */
  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  /* salvando os entries no localStorage */
  save() {
    // stringify: transforma um objeto que está no javascript em um objeto em texto;
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  /* add: vai digitar o nome de um usuário no input */
  async add(username) {
    try {
      // vai olhar se o usuário já existe dentro do entries;
      const userExists = this.entries.find(entry => entry.login === username); 
      if(userExists) {
        throw new Error('Usuário já cadastrado')
      }

      const user = await GithubUser.search(username)
      if(user.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }

      // pega o entries e add o novo usuário;
      this.entries = [user, ...this.entries];
      // atualiza os dados da tabela;
      this.update();
      // depois de add o usuário, salve no localStorage;
      this.save();

    } catch(error) {
      alert(error.message);
    }  
  }

  /* load: vai deletar um usuário */
  delete(user) {    
    const filteredEntries = this.entries
      .filter(entry => entry.login !== user.login);

    this.entries = filteredEntries;
    this.update();
    this.save();
    this.usersFavorites();
  }
}

/* classe que cria a visualização e eventos do HTML */
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);

    this.tbody = this.root.querySelector('tbody');

    this.update();
    this.onadd();
  }
  
  /* 
    criando o HTML;
    update: essa função será chamada sempre que alterar algum dado;
  */
  update() {
    this.removeAllTr(); 

    this.entries.forEach(user => {
      // colocando o objeto de entries em cada row - linha;
      const row = this.createRow();
      
      row.querySelector('.user img')
        .src = `https://github.com/${user.login}.png`;

      row.querySelector('.user img')
        .alt = `Imagem de ${user.name}`;

      row.querySelector('.user a')
        .href = `https://github.com/${user.login}`;

      row.querySelector('.user p')
        .textContent = user.name;

      row.querySelector('.user span')
        .textContent = user.login;  
      
      row.querySelector('.repositories')
        .textContent = user.public_repos;
        
      row.querySelector('.followers')
        .textContent = user.followers;
        
      /* botão de remover linha */
      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar essa linha?');

        if(isOk) {
          this.delete(user);
          alert(`${user.login} foi removido dos seus favoritos`)
        }
      }

      this.tbody.append(row);
      this.usersFavorites();
    })
  }

  /* removeAllTr: exclui todas as linhas da tabela */
  removeAllTr() {
    this.tbody.querySelectorAll("tr")
      .forEach((tr) => {
        tr.remove();
    });
  }

  createRow() {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="user">
        <img src="https://github.com/famalaquias.png" alt="Imagem github">

        <a href="https://github.com/famalaquias" target="_blank">
          <p>Fabiane Malaquias</p>
          <span>famalaquias</span>
        </a>
      </td>
      <td class="repositories">21</td>
      <td class="followers">35</td>
      <td>
        <button class="remove">Remover</button>
      </td>
    `

    return tr;
  }

  /* pegando o que digitar no input para fazer a busca ao clicar no botão de adicionar */
  onadd() {
    const addButton = this.root.querySelector('.search button');
    
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input');

      this.add(value);
    }
  }
}
