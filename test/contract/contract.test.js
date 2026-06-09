/**
 * Testes de Contrato - Categorias e Produtos
 *
 * Arquivo dedicado exclusivamente aos testes de contrato que validam:
 * 1. A estrutura (schema) das respostas da API GraphQL
 * 2. Os tipos de dados retornados (string, number, boolean, etc.)
 * 3. A presença obrigatória de campos no retorno
 *
 * Utiliza `like()` do pactum-matchers para verificar apenas o TIPO
 * dos valores, não os valores exatos — esta é a essência de um teste de contrato.
 *
 * ⚠️ SCHEMA ATUAL DA API:
 * - Category: retorna { name: String, photo: String }
 * - Product: retorna { name, description, price, visible, quantity, ... }
 * - NÃO há campo id nos tipos de retorno do GraphQL.
 */

const { spec } = require('pactum');
const { like, expression } = require('pactum-matchers');
const { BASE_URL, getAdminToken } = require('../helpers/auth');

// ─────────────────────────────────────────────
// Queries GraphQL (schema real da API)
// ─────────────────────────────────────────────
const ADD_CATEGORY_MUTATION = `
  mutation AddCategory($name: String, $photo: String) {
    addCategory(name: $name, photo: $photo) {
      name
      photo
    }
  }
`;

const EDIT_CATEGORY_MUTATION = `
  mutation EditCategory($id: ID!, $name: String, $photo: String) {
    editCategory(id: $id, name: $name, photo: $photo) {
      name
      photo
    }
  }
`;

const DELETE_CATEGORY_MUTATION = `
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id) {
      name
      photo
    }
  }
`;

const ADD_PRODUCT_MUTATION = `
  mutation AddProduct($name: String, $description: String, $price: Float, $visible: Boolean) {
    addProduct(name: $name, description: $description, price: $price, visible: $visible) {
      name
      description
      price
      visible
    }
  }
`;

const EDIT_PRODUCT_MUTATION = `
  mutation EditProduct($id: ID!, $name: String, $price: Float, $description: String) {
    editProduct(id: $id, name: $name, price: $price, description: $description) {
      name
      description
      price
    }
  }
`;

const DELETE_PRODUCT_MUTATION = `
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id) {
      name
      description
      price
    }
  }
`;

// ID existente usado como argumento para edit/delete
const ID_EXISTENTE = '67acdb1b0cf0a913258b3e3e';

// ─────────────────────────────────────────────
// Suíte de Testes de Contrato
// ─────────────────────────────────────────────
describe('📋 Testes de Contrato - Categorias e Produtos', () => {
  let token;

  before(async () => {
    token = await getAdminToken();
  });

  // ══════════════════════════════════════════
  // CONTRATO - CATEGORIAS
  // ══════════════════════════════════════════
  describe('Contratos do serviço de Categorias', () => {
    /**
     * Contrato: addCategory
     * Garante que a resposta sempre contenha:
     *   - name: String
     *   - photo: String
     */
    it('Contrato addCategory → resposta deve conter name (String) e photo (String)', async () => {
      await spec()
        .post(BASE_URL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(ADD_CATEGORY_MUTATION)
        .withGraphQLVariables({
          name: 'Contrato Cat Add 2026',
          photo: 'https://contrato.com/categoria.jpg',
        })
        .expectStatus(200)
        .expectJsonMatch({
          data: {
            addCategory: {
              name: like('Contrato Cat Add 2026'),           // ← tipo: String
              photo: like('https://contrato.com/...'),        // ← tipo: String
            },
          },
        });
    });

    /**
     * Contrato: editCategory
     * Garante que a resposta ao editar sempre contenha:
     *   - name: String (pode ser null se id não existir)
     *   - photo: String (pode ser null se id não existir)
     */
    it('Contrato editCategory → resposta deve conter name (String) e photo (String)', async () => {
      // expression() permite null | string, pois o ID pode não existir na base
      const isStringOrNull = "(() => { const v = $V; return v === null || typeof v === 'string'; })()";

      await spec()
        .post(BASE_URL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(EDIT_CATEGORY_MUTATION)
        .withGraphQLVariables({
          id: ID_EXISTENTE,
          name: 'Contrato Cat Edit 2026',
          photo: 'https://contrato.com/editada.jpg',
        })
        .expectStatus(200)
        .expectJsonMatch({
          data: {
            editCategory: {
              name: expression(isStringOrNull),  // ← tipo: String | null
              photo: expression(isStringOrNull), // ← tipo: String | null
            },
          },
        });
    });

    /**
     * Contrato: deleteCategory
     * Garante que ao deletar, a resposta retorna:
     *   - name: String (pode ser null se id não existir)
     *   - photo: String (pode ser null se id não existir)
     */
    it('Contrato deleteCategory → resposta deve conter name (String) e photo (String)', async () => {
      // expression() permite null | string, pois o ID pode não existir na base
      const isStringOrNull = "(() => { const v = $V; return v === null || typeof v === 'string'; })()";

      await spec()
        .post(BASE_URL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(DELETE_CATEGORY_MUTATION)
        .withGraphQLVariables({ id: ID_EXISTENTE })
        .expectStatus(200)
        .expectJsonMatch({
          data: {
            deleteCategory: {
              name: expression(isStringOrNull),  // ← tipo: String | null
              photo: expression(isStringOrNull), // ← tipo: String | null
            },
          },
        });
    });
  });

  // ══════════════════════════════════════════
  // CONTRATO - PRODUTOS
  // ══════════════════════════════════════════
  describe('Contratos do serviço de Produtos', () => {
    /**
     * Contrato: addProduct
     * Garante que a resposta sempre contenha:
     *   - name: String
     *   - description: String
     *   - price: Float (número)
     *   - visible: Boolean
     */
    it('Contrato addProduct → resposta deve conter name (String), description (String), price (Float) e visible (Boolean)', async () => {
      await spec()
        .post(BASE_URL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(ADD_PRODUCT_MUTATION)
        .withGraphQLVariables({
          name: 'Contrato Produto Add 2026',
          description: 'Descrição para teste de contrato',
          price: 123.45,
          visible: true,
        })
        .expectStatus(200)
        .expectJsonMatch({
          data: {
            addProduct: {
              name: like('Contrato Produto Add 2026'), // ← tipo: String
              description: like('Descrição...'),        // ← tipo: String
              price: like(123.45),                      // ← tipo: Float/Number
              visible: like(true),                      // ← tipo: Boolean
            },
          },
        });
    });

    /**
     * Contrato: editProduct
     * Garante que a resposta ao editar sempre contenha:
     *   - name: String (pode ser null se id não existir)
     *   - description: String (pode ser null se id não existir)
     *   - price: Float (pode ser null se id não existir)
     */
    it('Contrato editProduct → resposta deve conter name (String), description (String) e price (Float)', async () => {
      // expression() permite null | tipo primário
      const isStringOrNull = "(() => { const v = $V; return v === null || typeof v === 'string'; })()";
      const isNumberOrNull = "(() => { const v = $V; return v === null || typeof v === 'number'; })()";

      await spec()
        .post(BASE_URL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(EDIT_PRODUCT_MUTATION)
        .withGraphQLVariables({
          id: ID_EXISTENTE,
          name: 'Contrato Produto Edit 2026',
          price: 999.99,
          description: 'Descrição editada para contrato',
        })
        .expectStatus(200)
        .expectJsonMatch({
          data: {
            editProduct: {
              name: expression(isStringOrNull),        // ← tipo: String | null
              description: expression(isStringOrNull), // ← tipo: String | null
              price: expression(isNumberOrNull),       // ← tipo: Float/Number | null
            },
          },
        });
    });

    /**
     * Contrato: deleteProduct
     * Garante que ao deletar, a resposta retorna:
     *   - name: String (pode ser null se id não existir)
     *   - description: String (pode ser null se id não existir)
     *   - price: Float (pode ser null se id não existir)
     */
    it('Contrato deleteProduct → resposta deve conter name (String), description (String) e price (Float)', async () => {
      // expression() permite null | tipo primário
      const isStringOrNull = "(() => { const v = $V; return v === null || typeof v === 'string'; })()";
      const isNumberOrNull = "(() => { const v = $V; return v === null || typeof v === 'number'; })()";

      await spec()
        .post(BASE_URL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(DELETE_PRODUCT_MUTATION)
        .withGraphQLVariables({ id: ID_EXISTENTE })
        .expectStatus(200)
        .expectJsonMatch({
          data: {
            deleteProduct: {
              name: expression(isStringOrNull),        // ← tipo: String | null
              description: expression(isStringOrNull), // ← tipo: String | null
              price: expression(isNumberOrNull),       // ← tipo: Float/Number | null
            },
          },
        });
    });
  });
});
