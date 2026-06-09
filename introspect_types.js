async function fullIntrospect() {
  const query = `
    query {
      __schema {
        mutationType {
          fields {
            name
            type {
              name
              kind
              fields {
                name
                type { name kind ofType { name kind } }
              }
              ofType {
                name
                kind
                fields {
                  name
                  type { name kind ofType { name kind } }
                }
              }
            }
          }
        }
      }
    }
  `;
  const response = await fetch('http://lojaebac.ebaconline.art.br/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  const data = await response.json();
  const fields = data.data.__schema.mutationType.fields;
  const relevant = fields.filter(f => ['addCategory', 'editCategory', 'deleteCategory', 'addProduct', 'editProduct', 'deleteProduct'].includes(f.name));
  console.log(JSON.stringify(relevant, null, 2));
}
fullIntrospect();
