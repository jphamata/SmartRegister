# SmartRegister: Plataforma Descentralizada de Registro de Propriedade Intelectual

O SmartRegister é uma plataforma que utiliza a tecnologia blockchain (com Ganache para desenvolvimento) para modernizar o registro e gerenciamento de Propriedade Intelectual (PI). Este projeto visa solucionar os problemas de centralização, altos custos e falta de transparência inerentes ao sistema tradicional de registro de PI.

## Funcionalidades

* **Registro de Obras:** Registre obras intelectuais de forma segura e imutável na blockchain, estabelecendo prova de autoria e data de criação com timestamp confiável. Metadados como título, categoria, autor e descrição são incluídos.
* **Histórico e Rastreabilidade:**  Registro completo e auditável de todas as transações e modificações relacionadas a cada obra, garantindo transparência e facilitando a verificação de autenticidade e proveniência.

## Tecnologias Utilizadas

* **Hardhat:** Framework para desenvolvimento, teste e deploy de smart contracts.
* **Ganache:** Rede local de desenvolvimento blockchain para testes e prototipagem.
* **React.js:**  Framework JavaScript para a interface do usuário (frontend).
* **Node.js & Express.js:**  Para o backend e a API.
* **Solidity:** Linguagem de programação para os smart contracts.
* **Metamask:** Extensão de navegador para interação com a blockchain.

## Arquitetura

O SmartRegister é composto por três camadas principais:

1. **Frontend (React.js):** Interface dinâmica e responsiva para interação do usuário.
2. **Backend (Express.js, Node.js):** API que conecta o frontend à blockchain.
3. **Smart Contracts (Solidity/Hardhat):** Lógica principal do sistema, gerenciando o registro e resolução de disputas.



## Instalação e Execução

1. **Clone o repositório:** `git clone https://github.com/jphamata/SmartRegister.git`
2. **Instale as dependências:**
    * Frontend: `cd client && npm install`
    * Backend: `cd server && npm install`
3. **Inicie a Ganache CLI:**  Abra um novo terminal e execute `ganache-cli`. Anote as 10 contas e a chave privada fornecidas.
4. **Deploy do Contrato:** Em um novo terminal, navegue até a pasta raiz do projeto e execute:  `npx hardhat run scripts/deploy.js --network ganache`
    * **Copie o endereço do contrato** que será exibido no terminal.
5. **Configure o endereço:**
    * Cole o endereço copiado em App.jsx.
6. **Inicie o Backend:** Em um novo terminal, navegue até a pasta `server` e execute: `node server.js`
7. **Inicie o Frontend:** Em um novo terminal, navegue até a pasta `client` e execute: `npm start`
8. **Configure o Metamask:**
    * Adicione a rede Ganache manualmente ao Metamask. Use a URL `http://127.0.0.1:8545` (ou a porta que a Ganache estiver usando).
    * Importe uma das contas fornecidas pela Ganache CLI para o Metamask usando a chave privada correspondente.

## Próximos Passos

* Implementar recursos avançados como detecção de plágio e análise de similaridade.
* Otimizar a escalabilidade para suportar um grande número de usuários.
* Explorar interoperabilidade com outras plataformas blockchain.

## Licença

[Apache-2.0](LICENSE)
