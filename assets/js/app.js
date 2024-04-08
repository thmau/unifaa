(async () => {
    // Configuração do Axios para realizar chamadas à API
    const api = axios.create({
        baseURL: 'http://localhost:3400' // URL base da API
    });

    // Função para formatar a data
    const formatarData = (dataString) => {
        // Converte a string de data para um objeto Date
        const dataObj = new Date(dataString);

        // Extrai os componentes da data
        const dia = dataObj.getDate().toString().padStart(2, '0');
        const mes = (dataObj.getMonth() + 1).toString().padStart(2, '0');
        const ano = dataObj.getFullYear();
        const hora = dataObj.getHours().toString().padStart(2, '0');
        const minuto = dataObj.getMinutes().toString().padStart(2, '0');

        // Retorna a data formatada
        return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
    };

    // Inicialização de variáveis para armazenar os produtos e os detalhes do produto no modal
    let produtos = [];
    let produtoModal = {};

    // Função para atualizar a lista de produtos na tabela
    const atualizarListaProdutos = async () => {
        // Realiza uma chamada GET para obter a lista de produtos da API
        produtos = await api.get('produtos')
            .then((res) => res.data)
            .catch(() => []);

        // Constrói o HTML para exibir os produtos na tabela
        let html = [];

        // Verifica se existem produtos
        if(produtos.length == 0) {
          html.push(`
            <div class="grid-empty"> <span class="eva eva-shopping-bag-outline"></span> Não há produtos cadastrados.</div>
          `);
          document.querySelector('.footer').style.display = 'none';
        } else {
          for (let produto of produtos) {
              let json = JSON.stringify(produto);
              html.push(`
                <div class="grid-item" data-id="${produto.id}">
                  <div class="thumb">
                    <img src="${produto.foto}" alt="Foto do Produto">
                  </div>
                  <div class="info">
                    <div class="title"><span>${produto.nome}</span></div>
                    <div class="qntd">${produto.quantidadeEstoque} Disponíveis em Estoque</div>
                    <div class="description">${produto.observacao}</div>
                    <div class="price">${produto.valor}</div>

                    <div class="buttons">
                      <div class="dropdown">
                        <button class="btn btn-lg dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                          <span class="eva eva-more-vertical-outline"></span>
                        </button>
                        <ul class="dropdown-menu">
                          <li>
                            <a class="dropdown-item editar-produto" data-id="${produto.id}">
                              <span class="eva eva-edit-outline"></span> Editar
                            </a>
                          </li>
                          <li>
                            <a class="dropdown-item excluir-produto" data-id="${produto.id}">
                              <span class="eva eva-trash-2-outline"></span> Remover
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div class="register">Cadastro realizado em ${formatarData(produto.dataCadastro)}</div>

                  </div>
                </div>
              `);
          }
        }

        // Atualiza o conteúdo da tabela com o HTML gerado
        document.querySelector('#lista_produtos').innerHTML = html.join('');
    };

    // Função para realizar uma requisição POST para criar um novo produto
    const apiPostCriarProduto = async (produto) => {
        return await api.post('produtos', produto)
            .then((res) => res.data)
            .catch(() => []);
    };

    // Função para realizar uma requisição PUT para editar um produto existente
    const apiPutEditarProduto = async (id, produto) => {
        return await api.put(`produtos/${id}`, produto)
            .then((res) => res.data)
            .catch(() => []);
    };

    // Função para realizar uma requisição DELETE para excluir um produto
    const apiDeleteExcluirProduto = async (id) => {
        return await api.delete(`produtos/${id}`)
            .then((res) => res.data)
            .catch(() => []);
    };

    // Inicialização dos elementos da interface do usuário
    const modalProduto = new bootstrap.Modal('#modalProduto', {
        backdrop: true,
        focus: false,
        keyboard: false
    });

    // Event listeners para os botões e inputs
    const modalProdutoLabel = document.querySelector('#modalProdutoLabel');
    const inputProdutoNome = document.querySelector('#inputProdutoNome');
    const inputProdutoValor = document.querySelector('#inputProdutoValor');
    const inputProdutoQuantidade = document.querySelector('#inputProdutoQuantidade');
    const inputProdutoObservacao = document.querySelector('#inputProdutoObservacao');
    const inputProdutoFoto = document.querySelector('#inputProdutoFoto');
    const btnListarProdutos = document.querySelector('button#listar');
    const btnCriarProduto = document.querySelector('button#criar');
    const btnSalvarProduto = document.querySelector('#salvarProduto');

    // Flag para verificar se está editando um produto
    let editandoProduto = false;

    // Event listener para o modal ser fechado
    document.querySelector('#modalProduto')
        .addEventListener('hidden.bs.modal', event => {
            editandoProduto = false;
        });

    // Função para abrir o modal de criação de produto
    const onClickCriarProduto = async (id) => {
        produtoModal = {};
        modalProdutoLabel.textContent = 'Cadastrar Produto';
        inputProdutoNome.value = '';
        inputProdutoValor.value = '';
        inputProdutoQuantidade.value = '';
        inputProdutoObservacao.value = '';
        inputProdutoFoto.value = '';
        modalProduto.show();
    };

    // Função para abrir o modal de edição de produto
    const onClickEditarProduto = async (id) => {
        produtoModal = produtos.find(r => r.id === parseInt(id));

        modalProdutoLabel.textContent = 'Editar Produto';
        inputProdutoNome.value = produtoModal.nome;
        inputProdutoValor.value = produtoModal.valor;
        inputProdutoQuantidade.value = produtoModal.quantidadeEstoque;
        inputProdutoObservacao.value = produtoModal.observacao;
        inputProdutoFoto.value = produtoModal.foto;

        modalProduto.show();
    };

    // Função para excluir um produto
    const onClickExcluirProduto = async (id) => {

      swal({
          title: "Você tem certeza?",
          text: "Essa ação não poderá ser desfeita.",
          buttons: {
            confirm: "Confirmar",
            cancel: "Cancelar",
          },
          icon: "warning",
          // buttons: true,
          dangerMode: true,
      })
      .then(async (willDelete) => { // Usando async para usar await dentro de then
          if (willDelete) {

            // Deleta o produto
            await apiDeleteExcluirProduto(parseInt(id));
            // Atualiza a lista de produtos
            await atualizarListaProdutos();

            // Alerta de sucesso
            swal("O produto foi removido com sucesso!", {
              icon: "success",
            });
          }
      });

    };

    // Função para salvar um produto (criação ou edição)
    const onClickSalvarProduto = async () => {

        produtoModal.nome = inputProdutoNome.value;
        produtoModal.valor = inputProdutoValor.value;
        produtoModal.quantidadeEstoque = inputProdutoQuantidade.value;
        produtoModal.observacao = inputProdutoObservacao.value;
        produtoModal.foto = inputProdutoFoto.value;

        // Validação dos campos
        if (
            produtoModal.nome.length === 0 &&
            produtoModal.valor.length === 0 &&
            produtoModal.quantidadeEstoque.length === 0 &&
            produtoModal.foto.length === 0 &&
            produtoModal.observacao.length === 0
        ) {
            alert('Preencha todos os campos');
            return;
        }

        // Adiciona a data de cadastro do produto
        produtoModal.dataCadastro = new Date().toISOString();

        modalProduto.hide();

        // Verifica se está editando ou criando um novo produto
        if (produtoModal.id) {
            await apiPutEditarProduto(produtoModal.id, produtoModal);
        } else {
            await apiPostCriarProduto(produtoModal);
        }

        await atualizarListaProdutos();
    }

    // Event listener para os botões de edição e exclusão de produtos
    document.addEventListener('click', ev => {
        let el = ev?.target?.closest('a');
        let cls = el?.classList;
        if (cls?.contains('editar-produto')) {
            return onClickEditarProduto(el.dataset.id);
        }

        if (cls?.contains('excluir-produto')) {
            return onClickExcluirProduto(el.dataset.id);
        }
    });

    // Event listeners para os botões de listar, criar e salvar produtos
    btnListarProdutos.addEventListener('click', atualizarListaProdutos);
    btnCriarProduto.addEventListener('click', onClickCriarProduto);
    btnSalvarProduto.addEventListener('click', onClickSalvarProduto);

    // Inicializa a lista de produtos
    await atualizarListaProdutos();
})();
