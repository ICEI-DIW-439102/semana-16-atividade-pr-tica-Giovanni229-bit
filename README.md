# Absolutamente Histórico

Este projeto evoluiu para uma aplicação web com CRUD completo para a entidade principal, utilizando JSON Server como backend simulado. A aplicação permite listar, visualizar, cadastrar, editar e excluir pessoas históricas a partir de um arquivo JSON.

## Integrantes
- Nome: Giovanni Oliveira
- Matrícula: 1640298
- Curso: Engenharia de Software
- Turno: Noite

## Objetivo da atividade
A proposta desta etapa foi implementar um backend simulado com JSON Server e conectar a interface do projeto ao CRUD da entidade principal, permitindo:
- Criar novas pessoas históricas
- Ler a lista e detalhes
- Atualizar registros existentes
- Excluir registros

## Estrutura do banco de dados
O arquivo [db/db.json](db/db.json) contém uma coleção chamada `pessoasHistoricas` com registros completos, além de `usuarios` e `favoritos` para a experiência do usuário.

Exemplo de estrutura:
```json
{
  "pessoasHistoricas": [
    {
      "id": "1",
      "nome": "Edson Arantes do Nascimento (Pelé)",
      "subtitulo": "O Rei do Futebol",
      "descricao": "O Rei do Futebol não apenas jogou; ele parou guerras e unificou nações através do esporte.",
      "descricaoCompleta": "Biografia completa da pessoa histórica.",
      "imagem": "https://...",
      "nacionalidade": "Brasileira",
      "nascimento": "23 de outubro de 1940",
      "falecimento": "29 de dezembro de 2022",
      "areaDeAtuacao": "Futebol",
      "legado": "Único jogador tricampeão mundial.",
      "destaque": true,
      "fotos": []
    }
  ]
}
```

## Como executar
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor JSON Server:
   ```bash
   npm start
   ```
3. Abra a aplicação em um navegador em:
   ```text
   http://localhost:3000
   ```

## Testes de requisições
Para testar as rotas REST, foi utilizado o Thunder Client (extensão do VS Code).

Endpoints principais:
- GET /pessoasHistoricas
- GET /pessoasHistoricas/:id
- POST /pessoasHistoricas
- PUT /pessoasHistoricas/:id
- DELETE /pessoasHistoricas/:id

## Prints da aplicação

### Página inicial
![alt text](<public/assets/imgs/Captura de tela 2026-07-05 224833.png>)
![alt text](<public/assets/imgs/Captura de tela 2026-07-05 224802.png>)
### Página de detalhes
![alt text](<public/assets/imgs/Captura de tela 2026-07-05 224833.png>)
