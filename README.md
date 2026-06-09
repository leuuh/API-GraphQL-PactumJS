# Exercícios - Testes de API GraphQL com PactumJS

Repositório de exercícios com testes de API para a aplicação GraphQL da Loja EBAC, utilizando **PactumJS** como framework de testes e **Mocha** como runner.

---

## 🗂️ Estrutura do Projeto

```
Exercicios-API-GraphQL-PactumJS/
├── test/
│   ├── helpers/
│   │   └── auth.js                  # Helper de autenticação compartilhado
│   ├── categorias/
│   │   └── categorias.test.js       # Suíte de testes de Categorias
│   ├── produtos/
│   │   └── produtos.test.js         # Suíte de testes de Produtos
│   └── contract/
│       └── contract.test.js         # Testes de contrato (Categorias + Produtos)
├── package.json
└── README.md
```

---

## 🧪 Serviços Testados

### 📦 Categorias
| Serviço          | Testes Funcionais | Teste de Contrato |
|-----------------|:-----------------:|:-----------------:|
| `addCategory`    | ✅ 2              | ✅ 1              |
| `editCategory`   | ✅ 2              | ✅ 1              |
| `deleteCategory` | ✅ 1              | ✅ 1              |

### 🛍️ Produtos
| Serviço          | Testes Funcionais | Teste de Contrato |
|-----------------|:-----------------:|:-----------------:|
| `addProduct`     | ✅ 2              | ✅ 1              |
| `editProduct`    | ✅ 2              | ✅ 1              |
| `deleteProduct`  | ✅ 1              | ✅ 1              |

---

## ⚡ Como Executar

### Pré-requisitos

- Node.js instalado
- Acesso à URL da API: `http://lojaebac.ebaconline.art.br/graphql`

### Instalação

```bash
npm install
```

### Executar todos os testes

```bash
npm test
```

### Executar apenas os testes de Categorias

```bash
npm run test:categorias
```

### Executar apenas os testes de Produtos

```bash
npm run test:produtos
```

### Executar apenas os testes de Contrato

```bash
npm run test:contract
```

---

## 📋 Tipos de Testes

### Testes Funcionais
Verificam o comportamento esperado da API:
- Status HTTP 200
- Valores exatos nos campos retornados
- Ausência de erros GraphQL

### Testes de Contrato
Verificam o **formato e tipos** da resposta da API usando `like()` do `pactum-matchers`:
- Presença obrigatória dos campos `id`, `name`, `photo`, `price`, etc.
- Tipo correto dos dados (string, number/float)
- Compatibilidade do schema entre consumidor e provedor

---

## 🔧 Tecnologias

- **[PactumJS](https://pactumjs.github.io/)** — Framework de testes de API REST e GraphQL
- **[Mocha](https://mochajs.org/)** — Test runner para Node.js
- **[pactum-matchers](https://www.npmjs.com/package/pactum-matchers)** — Matchers para testes de contrato
