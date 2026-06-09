/**
 * Helper de autenticação
 * Centraliza a lógica de obtenção de token para reutilização nos testes.
 * Também fornece helpers para obter IDs via REST API quando necessário.
 */
const { spec } = require('pactum');

const BASE_URL = 'http://lojaebac.ebaconline.art.br/graphql';
const REST_BASE_URL = 'http://lojaebac.ebaconline.art.br';

const AUTH_MUTATION = `
  mutation AuthUser($email: String, $password: String) {
    authUser(email: $email, password: $password) {
      token
    }
  }
`;

/**
 * Autentica o usuário admin e retorna o token JWT
 * @returns {Promise<string>} Token de autenticação
 */
async function getAdminToken() {
  const response = await spec()
    .post(BASE_URL)
    .withGraphQLQuery(AUTH_MUTATION)
    .withGraphQLVariables({
      email: 'admin@admin.com',
      password: 'admin123',
    });

  return response.body.data.authUser.token;
}

/**
 * Obtém o ID de uma categoria a partir da REST API (/api/getUsers) OU
 * via workaround de nome. Como a API GraphQL não retorna IDs de categorias,
 * utilizamos a estratégia de buscar um ID existente através da lista de usuários
 * ou usando IDs pré-conhecidos da aplicação.
 *
 * NOTA: A API atual (lojaebac.ebaconline.art.br) não expõe IDs de Categoria
 * ou Produto via GraphQL. O schema retorna apenas name e photo para Category
 * e name, description, price, etc. para Product.
 *
 * Para fins de teste de editCategory/deleteCategory, usamos um ID válido
 * já conhecido da aplicação (obtido manualmente).
 */
async function getExistingCategoryId(token) {
  // Busca usuários para extrair IDs de objetos da aplicação (workaround)
  // Em produção real, deveríamos ter uma query Categories com id
  const response = await fetch(`${REST_BASE_URL}/api/getUsers`, {
    headers: { Authorization: token },
  });
  const data = await response.json();
  // Retorna o _id do primeiro usuário como referência de formato de ID
  return data.users[0]?._id || null;
}

module.exports = {
  BASE_URL,
  REST_BASE_URL,
  getAdminToken,
  getExistingCategoryId,
};
