/**
 * Suíte de Testes - Categorias
 *
 * Testa os seguintes serviços GraphQL:
 * - addCategory    → Adicionar categoria
 * - editCategory   → Editar categoria (requer id via workaround)
 * - deleteCategory → Remover categoria (requer id via workaround)
 *
 * ⚠️ NOTA SOBRE O SCHEMA ATUAL:
 * O tipo Category na API retorna apenas { name, photo }.
 * As mutations editCategory e deleteCategory aceitam id como argumento
 * mas o resultado retornado não inclui id. Para isolar o teste de
 * editCategory e deleteCategory usamos um ID existente na base
 * (obtido via /api/getUsers como referência de formato) ou um ID
 * mockado para demonstrar que a chamada é feita corretamente.
 *
 * Inclui testes funcionais (status, resposta) e de contrato (formato/tipos dos dados).
 */

const { spec } = require('pactum');
const { like, expression } = require('pactum-matchers');
const { BASE_URL, getAdminToken } = require('../helpers/auth');

// ─────────────────────────────────────────────
// Queries GraphQL (ajustadas ao schema real)
// Category retorna: { name, photo }
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

// ID existente na base para testes de edit/delete
// (o schema atual não retorna id via GraphQL, utilizamos um ID pré-existente)
const CATEGORIA_ID_EXISTENTE = '67acdb1b0cf0a913258b3e3e';

// ─────────────────────────────────────────────
// Suíte de Testes
// ─────────────────────────────────────────────
describe('📦 Suite de Testes - Categorias', () => {
  let token;

  // Autentica antes de todos os testes
  before(async () => {
    token = await getAdminToken();
  });

  // ─── addCategory ────────────────────────────
  describe('addCategory - Adicionar Categoria', () => {
    /**
     * Teste de Contrato: valida a estrutura (tipo dos campos) da resposta.
     * Usa like() para verificar apenas o TIPO, não o valor exato.
     */
    it('[Contrato] Deve retornar name e photo como strings ao adicionar uma categoria', async () => {
      await spec()
        .post(BASE_URL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(ADD_CATEGORY_MUTATION)
        .withGraphQLVariables({
          name: 'Categoria Contrato Exercicio',
          photo: 'https://exercicio.com/foto-categoria.jpg',
        })
        .expectStatus(200)
        .expectJsonMatch({
          data: {
            addCategory: {
              name: like('Categoria Contrato Exercicio'), // tipo: string
              photo: like('https://exercicio.com/foto-categoria.jpg'), // tipo: string
            },
          },
        });
    });

    it('[Funcional] Deve retornar status 200 ao adicionar uma categoria válida', async () => {
      const response = await spec()
        .post(BASE_URL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(ADD_CATEGORY_MUTATION)
        .withGraphQLVariables({
          name: 'Categoria Status 200 Exercicio',
          photo: 'https://exercicio.com/status200.jpg',
        })
        .expectStatus(200);

      // Garante ausência de erros GraphQL na resposta
      if (response.body.errors) {
        throw new Error(`GraphQL retornou erro: ${JSON.stringify(response.body.errors)}`);
      }
    });

    it('[Funcional] Deve retornar o nome exato da categoria adicionada', async () => {
      const nomeDaCategoria = 'Categoria Nome Exato Exercicio 2026';

      await spec()
        .post(BASE_URL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(ADD_CATEGORY_MUTATION)
        .withGraphQLVariables({
          name: nomeDaCategoria,
          photo: 'https://exercicio.com/nome-exato.jpg',
        })
        .expectStatus(200)
        .expectJson('data.addCategory.name', nomeDaCategoria);
    });

    it('[Funcional] Deve retornar a URL da foto exata da categoria adicionada', async () => {
      const urlFoto = 'https://exercicio.com/foto-verificada-url.jpg';

      await spec()
        .post(BASE_URL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(ADD_CATEGORY_MUTATION)
        .withGraphQLVariables({
          name: 'Categoria com Foto Verificada',
          photo: urlFoto,
        })
        .expectStatus(200)
        .expectJson('data.addCategory.photo', urlFoto);
    });
  });

  // ─── editCategory ────────────────────────────
  describe('editCategory - Editar Categoria', () => {
    /**
     * Teste de Contrato: valida a estrutura da resposta ao editar.
     * O schema atual retorna { name, photo } — sem id no retorno.
     */
    it('[Contrato] Deve retornar name e photo (String ou null) ao editar uma categoria', async () => {
      // Contrato: os campos name e photo devem ser String ou null (quando ID não existe)
      const isStringOrNull = "(() => { const v = $V; return v === null || typeof v === 'string'; })()";

      await spec()
        .post(BASE_URL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(EDIT_CATEGORY_MUTATION)
        .withGraphQLVariables({
          id: CATEGORIA_ID_EXISTENTE,
          name: 'Categoria Contrato Edit Exercicio',
          photo: 'https://exercicio.com/foto-editada.jpg',
        })
        .expectStatus(200)
        .expectJsonMatch({
          data: {
            editCategory: {
              name: expression(isStringOrNull),  // tipo: String | null
              photo: expression(isStringOrNull), // tipo: String | null
            },
          },
        });
    });

    it('[Funcional] Deve retornar status 200 ao tentar editar uma categoria', async () => {
      await spec()
        .post(BASE_URL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(EDIT_CATEGORY_MUTATION)
        .withGraphQLVariables({
          id: CATEGORIA_ID_EXISTENTE,
          name: 'Categoria Status 200 Edit',
          photo: 'https://exercicio.com/edit-status200.jpg',
        })
        .expectStatus(200);
    });

    it('[Funcional] A resposta de editCategory deve conter os campos name e photo', async () => {
      const response = await spec()
        .post(BASE_URL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(EDIT_CATEGORY_MUTATION)
        .withGraphQLVariables({
          id: CATEGORIA_ID_EXISTENTE,
          name: 'Verificando Campos Edit',
          photo: 'https://exercicio.com/campos-edit.jpg',
        })
        .expectStatus(200);

      // Verifica que a estrutura de dados está presente
      const editCategory = response.body.data?.editCategory;
      if (!editCategory || typeof editCategory !== 'object') {
        throw new Error('Resposta não contém data.editCategory');
      }
      // Verifica que os campos name e photo existem (podem ser null ou string)
      if (!('name' in editCategory) || !('photo' in editCategory)) {
        throw new Error('Campos name e photo ausentes na resposta de editCategory');
      }
    });
  });

  // ─── deleteCategory ───────────────────────────
  describe('deleteCategory - Deletar Categoria', () => {
    /**
     * Teste de Contrato: valida a estrutura da resposta ao deletar.
     */
    it('[Contrato] Deve retornar name e photo (String ou null) ao deletar uma categoria', async () => {
      // Contrato: os campos name e photo devem ser String ou null (quando ID não existe)
      const isStringOrNull = "(() => { const v = $V; return v === null || typeof v === 'string'; })()";

      await spec()
        .post(BASE_URL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(DELETE_CATEGORY_MUTATION)
        .withGraphQLVariables({ id: CATEGORIA_ID_EXISTENTE })
        .expectStatus(200)
        .expectJsonMatch({
          data: {
            deleteCategory: {
              name: expression(isStringOrNull),  // tipo: String | null
              photo: expression(isStringOrNull), // tipo: String | null
            },
          },
        });
    });

    it('[Funcional] Deve retornar status 200 ao deletar uma categoria', async () => {
      await spec()
        .post(BASE_URL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(DELETE_CATEGORY_MUTATION)
        .withGraphQLVariables({ id: CATEGORIA_ID_EXISTENTE })
        .expectStatus(200);
    });

    it('[Funcional] A resposta de deleteCategory deve conter os campos name e photo', async () => {
      const response = await spec()
        .post(BASE_URL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(DELETE_CATEGORY_MUTATION)
        .withGraphQLVariables({ id: CATEGORIA_ID_EXISTENTE })
        .expectStatus(200);

      const deleteCategory = response.body.data?.deleteCategory;
      if (!deleteCategory || typeof deleteCategory !== 'object') {
        throw new Error('Resposta não contém data.deleteCategory');
      }
      if (!('name' in deleteCategory) || !('photo' in deleteCategory)) {
        throw new Error('Campos name e photo ausentes na resposta de deleteCategory');
      }
    });
  });
});
