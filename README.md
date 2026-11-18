# Pastejo Rotacionado

Aplicação para cadastro de pastos, piquetes e animais e para acompanhar a alocação dos animais nos piquetes. O projeto tem uma interface web em Express e Nunjucks, uma API REST em Express e um banco PostgreSQL.

## Executar com Docker

É necessário ter o Docker instalado e o comando `docker compose` disponível. Na primeira execução, o Docker baixa as imagens e instala as dependências da aplicação, então esse processo pode levar alguns minutos.

Na pasta do projeto, crie o arquivo local de configuração e inicie os serviços:

```bash
cp .env.example .env
docker compose up --build
```

A interface ficará disponível em <http://localhost:40100>. A API responde em <http://localhost:40000>; uma chamada `GET /` deve retornar a mensagem de que o servidor está ativo.

O acesso inicial é `admin` com senha `admin`. Também é criado o usuário `qwe` com senha `qwe`. Altere essas credenciais antes de utilizar o sistema fora de um ambiente local.

Para iniciar os serviços em segundo plano, use `docker compose up --build -d`. Para acompanhar todos os logs, use `docker compose logs -f`; para ver apenas um serviço, acrescente `database`, `backend` ou `frontend` ao comando. Encerre a visualização dos logs com `Ctrl+C`.

Para parar os containers sem remover os dados, execute:

```bash
docker compose down
```

O PostgreSQL guarda os dados no volume `postgres_data`. Para apagar também esse volume e recriar o banco com a estrutura e os dados iniciais, execute `docker compose down -v`. Esse comando remove os dados salvos no banco.

## Configuração

O arquivo `.env` da raiz é lido pelo Docker Compose e não deve ser enviado ao repositório. O arquivo `.env.example` contém os valores usados no ambiente local. Nele, `DB_NAME`, `DB_USER` e `DB_PASS` definem o banco e suas credenciais; `SECRET_API` define a chave usada para assinar os tokens JWT; e `SERVIDOR_DW3` informa à interface qual endereço da API o navegador deve acessar.

Por padrão, `SERVIDOR_DW3` aponta para `http://localhost:40000`. Como as chamadas à API são feitas pelo navegador do usuário, esse endereço precisa estar acessível a partir da máquina que abre a interface. Se acessar a aplicação por outro computador, configure `SERVIDOR_DW3` com o endereço ou domínio da máquina que executa os containers, mantendo a porta `40000`, e reinicie os serviços com `docker compose up -d`.

O banco não publica a porta PostgreSQL no host; ele fica acessível aos demais serviços pela rede interna do Compose, usando o nome `database`. A API publica a porta `40000` e a interface publica a porta `40100`.

## Serviços e inicialização do banco

O serviço `database` usa PostgreSQL 16 e executa `dw3backend/databaseConfig.sql` quando o volume é criado pela primeira vez. O arquivo cria as tabelas, habilita a extensão `pgcrypto` e insere os registros de exemplo e os dois usuários iniciais.

O serviço `backend` instala as dependências a partir de `dw3backend/package-lock.json`, conecta ao banco pelo nome de serviço `database` e aguarda o health check do PostgreSQL antes de iniciar. O serviço `frontend` instala as dependências de `dw3frontend`, atende na porta `40100` e aguarda a API responder antes de iniciar. Cada aplicação tem um health check para que o Compose informe quando está pronta.

O script SQL de inicialização é executado somente quando o PostgreSQL prepara um diretório de dados vazio. Alterações futuras nesse arquivo não são aplicadas a um volume já existente. Para recriar os dados locais a partir do script, remova o volume com `docker compose down -v` e suba os serviços novamente.

## Rotas da API

O login é feito em `POST /Login`, enviando `username` e `password` em JSON. As demais rotas de dados precisam do token retornado no cabeçalho `Authorization: Bearer <token>`. O token expira em dez minutos.

As rotas de pastos são `GET /getAllPastos`, `GET /getPastoByID/:pastoid`, `POST /insertPasto`, `PUT /updatePasto/:pastoid` e `DELETE /deletePasto/:pastoid`.

As rotas de piquetes são `GET /getAllPiquetes`, `GET /getPiqueteByID/:piqueteid`, `GET /getPastosToPiquete`, `POST /insertPiquete`, `PUT /updatePiquete/:piqueteid` e `DELETE /deletePiquete/:piqueteid`.

As rotas de animais são `GET /getAllAnimais`, `GET /getAnimalByID/:animalid`, `POST /insertAnimal`, `PUT /updateAnimal/:animalid` e `DELETE /deleteAnimal/:animalid`.

As rotas de alocações são `GET /getAllAlocados`, `GET /getAlocadoByID/:alocadoid`, `GET /getAnimaisToAlocado`, `GET /getPiquetesToAlocado`, `POST /insertAlocado`, `PUT /updateAlocado/:alocadoid` e `DELETE /deleteAlocado/:alocadoid`.

`POST /Logout` encerra a sessão na interface cliente. A autenticação da API usa tokens JWT e é validada em cada chamada protegida.

## Executar sem Docker

Para desenvolvimento local, é necessário ter Node.js e PostgreSQL instalados. Crie o banco `pastejo` e execute `dw3backend/databaseConfig.sql` nele. Em `dw3backend`, copie `.env.exemplo` para `.env`, ajuste as credenciais e mantenha `DB_HOST=localhost`.

Em um terminal, instale as dependências e inicie a API:

```bash
cd dw3backend
npm install
node app.js
```

Em outro terminal, mantenha `dw3frontend/dw3frontend.env` apontando para `http://localhost:40000` e inicie a interface:

```bash
cd dw3frontend
npm install
npm start
```

A interface abre em <http://localhost:40100> e a API em <http://localhost:40000>.

## Manutenção e problemas comuns

Use `docker compose ps` para conferir o estado dos serviços. Se algum container não iniciar, consulte `docker compose logs backend`, `docker compose logs frontend` ou `docker compose logs database`, conforme o serviço com problema.

Se as portas `40000` ou `40100` já estiverem ocupadas, libere-as antes de iniciar o Compose. A porta do banco não é publicada no host; para abrir um terminal PostgreSQL dentro do container, use `docker compose exec database psql -U postgres -d pastejo` (ajuste usuário e banco se tiver alterado o `.env`).

As variáveis `DB_NAME`, `DB_USER` e `DB_PASS` são aplicadas pelo PostgreSQL quando o volume é criado. Alterá-las depois não modifica automaticamente um banco já existente. Atualize as credenciais no PostgreSQL ou recrie o volume; a recriação apaga os dados, conforme explicado acima.

## Estrutura do projeto

`dw3backend` contém a API, seus controladores e modelos, a configuração do banco e o script SQL de inicialização. `dw3frontend` contém o servidor web, as rotas, os templates Nunjucks e os arquivos estáticos. Na raiz ficam o Compose, o exemplo de configuração local e esta documentação.
