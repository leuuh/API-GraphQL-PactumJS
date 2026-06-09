/**
 * Suíte de Testes - Produtos
 *
 * Testa os seguintes serviços GraphQL:
 * - addProduct    → Adicionar produto
 * - editProduct   → Editar produto (requer id via workaround)
 * - deleteProduct → Remover produto (requer id via workaround)
 *
 * ⚠️ NOTA SOBRE O SCHEMA ATUAL:
 * O tipo Product na API retorna: name, categories, description, price,
 * specialPrice, photos, popular, quantity, visible, location, additionalDetails.
 * NÃO inclui o campo id.
 * As mutations editProduct e deleteProduct aceitam id como argumento
 * mas o resultado não inclui id. Usamos um ID mockado para demonstrar
 * que a chamada é aceita pela API (status 200).
 *
 * Inclui testes funcionais (status, resposta) e de contrato (formato/tipos dos dados).
 */

const { spec } = require('pactum');
const { like, expression } = require('pactum-matchers');
const { BASE_URL, getAdminToken } = require('../helpers/auth');

// ─────────────────────────────────────────────
// Queries GraphQL (ajustadas ao schema real)
// Product retorna: { name, description, price, visible, ... }
// ─────────────────────────────────────────────
const ADD_PRODUCT_MUTATION = `
  mutation AddProduct(
    $name: String
    $description: String
    $price: Float
    $visible: Boolean
  ) {
    addProduct(
      name: $name
      description: $description
      price: $price
      visible: $visible
    ) {
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

// ID existente na base para testes de edit/delete
// (o schema atual não retorna id via GraphQL)
const PRODUTO_ID_EXISTENTE = '67acdb1b0cf0a913258b3e3e';

// ─────────────────────────────────────────────
// Suíte de Testes
// ─────────────────────────────────────────────
describe('🛍️ Suite de Testes - Produtos', () => {
  let token;

  // Autentica antes de todos os testes
  before(async () => {
    token = await getAdminToken();
  });

  // ─── addProduct ──────────────────────────────
  describe('addProduct - Adicionar Produto', () => {
    /**
     * Teste de Contrato: valida a estrutura (tipo dos campos) da resposta.
     * Usa like() para verificar o TIPO dos dados, não o valor exato.
     */
    it('[Contrato] Deve retornar name, description, price e visible com os tipos corretos', async () => {
      await spec()
        .post(BASE_URL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(ADD_PRODUCT_MUTATION)
        .withGraphQLVariables({
          name: 'Produto Contrato Exercicio',
          description: 'Descrição do produto de exercício de contrato',
          price: 99.99,
          visible: true,
        })
        .expectStatus(200)
        .expectJsonMatch({
          data: {
            addProduct: {
              name: like('Produto Contrato Exercicio'),       // tipo: string
              description: like('Descrição do produto...'),  // tipo: string
              price: like(99.99),                             // tipo: number (float)
              visible: like(true),                            // tipo: boolean
            },
          },
        });
    });

    it('[Funcional] Deve retornar status 200 ao adicionar um produto válido', async () => {
      const response = await spec()
        .post(BASE_URL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(ADD_PRODUCT_MUTATION)
        .withGraphQLVariables({
          name: 'Produto Status 200 Exercicio',
          description: 'Produto para verificar status 200',
          price: 49.90,
          visible: false,
        })
        .expectStatus(200);

      // Garante ausência de erros GraphQL
      if (response.body.errors) {
        throw new Error(`GraphQL retornou erro: ${JSON.stringify(response.body.errors)}`);
      }
    });

    it('[Funcional] Deve retornar o preço exato do produto adicionado', async () => {
      const precoEsperado = 259.90;

      await spec()
        .post(BASE_URL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(ADD_PRODUCT_MUTATION)
        .withGraphQLVariables({
          name: 'Produto Preco Exato Exercicio',
          description: 'Produto para verificar preço exato',
          price: precoEsperado,
          visible: true,
        })
        .expectStatus(200)
        .expectJson('data.addProduct.price', precoEsperado);
    });

    it('[Funcional] Deve retornar o nome exato do produto adicionado', async () => {
      const nomeEsperado = 'Produto Nome Exato Exercicio 2026';

      await spec()
        .post(BASE_URL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(ADD_PRODUCT_MUTATION)
        .withGraphQLVariables({
          name: nomeEsperado,
          description: 'Produto para verificar nome',
          price: 19.99,
          visible: true,
        })
        .expectStatus(200)
        .expectJson('data.addProduct.name', nomeEsperado);
    });
  });

  // ─── editProduct ─────────────────────────────
  describe('editProduct - Editar Produto', () => {
    /**
     * Teste de Contrato: valida a estrutura da resposta ao editar.
     * O schema atual retorna { name, description, price } — sem id no retorno.
     */
    it('[Contrato] Deve retornar name, description e price (ou null) com tipos corretos ao editar', async () => {
      // Contrato: campos devem ser String|null para name/description e Number|null para price
      const isStringOrNull = "(() => { const v = $V; return v === null || typeof v === 'string'; })()";
      const isNumberOrNull = "(() => { const v = $V; return v === null || typeof v === 'number'; })()";

      await spec()
        .post(BASE_URL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(EDIT_PRODUCT_MUTATION)
        .withGraphQLVariables({
          id: PRODUTO_ID_EXISTENTE,
          name: 'Produto Contrato Edit Exercicio',
          price: 199.99,
          description: 'Descrição editada no contrato',
        })
        .expectStatus(200)
        .expectJsonMatch({
          data: {
            editProduct: {
              name: expression(isStringOrNull),        // tipo: String | null
              description: expression(isStringOrNull), // tipo: String | null
              price: expression(isNumberOrNull),       // tipo: Float/Number | null
            },
          },
        });
    });

    it('[Funcional] Deve retornar status 200 ao tentar editar um produto', async () => {
      await spec()
        .post(BASE_URL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(EDIT_PRODUCT_MUTATION)
        .withGraphQLVariables({
          id: PRODUTO_ID_EXISTENTE,
          name: 'Produto Status 200 Edit',
          price: 299.00,
          description: 'Verificando status 200 no edit',
        })
        .expectStatus(200);
    });

    it('[Funcional] A resposta de editProduct deve conter os campos name, description e price', async () => {
      const response = await spec()
        .post(BASE_URL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(EDIT_PRODUCT_MUTATION)
        .withGraphQLVariables({
          id: PRODUTO_ID_EXISTENTE,
          name: 'Verificando Campos Edit Produto',
          price: 399.50,
          description: 'Verificando campos retornados',
        })
        .expectStatus(200);

      const editProduct = response.body.data?.editProduct;
      if (!editProduct || typeof editProduct !== 'object') {
        throw new Error('Resposta não contém data.editProduct');
      }
      if (!('name' in editProduct) || !('description' in editProduct) || !('price' in editProduct)) {
        throw new Error('Campos obrigatórios ausentes na resposta de editProduct');
      }
    });
  });

  // ─── deleteProduct ────────────────────────────
  describe('deleteProduct - Deletar Produto', () => {
    /**
     * Teste de Contrato: valida a estrutura da resposta ao deletar.
     */
    it('[Contrato] Deve retornar name, description e price (ou null) ao deletar um produto', async () => {
      // Contrato: campos devem ser String|null para name/description e Number|null para price
      const isStringOrNull = "(() => { const v = $V; return v === null || typeof v === 'string'; })()";
      const isNumberOrNull = "(() => { const v = $V; return v === null || typeof v === 'number'; })()";

      await spec()
        .post(BASE_URL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(DELETE_PRODUCT_MUTATION)
        .withGraphQLVariables({ id: PRODUTO_ID_EXISTENTE })
        .expectStatus(200)
        .expectJsonMatch({
          data: {
            deleteProduct: {
              name: expression(isStringOrNull),        // tipo: String | null
              description: expression(isStringOrNull), // tipo: String | null
              price: expression(isNumberOrNull),       // tipo: Float/Number | null
            },
          },
        });
    });

    it('[Funcional] Deve retornar status 200 ao deletar um produto', async () => {
      await spec()
        .post(BASE_URL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(DELETE_PRODUCT_MUTATION)
        .withGraphQLVariables({ id: PRODUTO_ID_EXISTENTE })
        .expectStatus(200);
    });

    it('[Funcional] A resposta de deleteProduct deve conter os campos name, description e price', async () => {
      const response = await spec()
        .post(BASE_URL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(DELETE_PRODUCT_MUTATION)
        .withGraphQLVariables({ id: PRODUTO_ID_EXISTENTE })
        .expectStatus(200);

      const deleteProduct = response.body.data?.deleteProduct;
      if (!deleteProduct || typeof deleteProduct !== 'object') {
        throw new Error('Resposta não contém data.deleteProduct');
      }
      if (!('name' in deleteProduct) || !('description' in deleteProduct) || !('price' in deleteProduct)) {
        throw new Error('Campos obrigatórios ausentes na resposta de deleteProduct');
      }
    });
  });
});
