async function discoverAPIs() {
  const authResp = await fetch('http://lojaebac.ebaconline.art.br/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: `mutation { authUser(email: "admin@admin.com", password: "admin123") { token } }` })
  });
  const { data: authData } = await authResp.json();
  const token = authData.authUser.token;

  const endpoints = [
    'http://lojaebac.ebaconline.art.br/api/getCategories',
    'http://lojaebac.ebaconline.art.br/api/getProducts',
    'http://lojaebac.ebaconline.art.br/api/getUsers',
    'http://lojaebac.ebaconline.art.br/public/authUser',
  ];

  for (const url of endpoints) {
    const r = await fetch(url, { headers: { 'Authorization': token } });
    const text = await r.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch(e) { parsed = text.slice(0, 300); }
    console.log(`\n${url}: ${r.status}`);
    if (r.ok && typeof parsed === 'object') {
      const keys = Object.keys(parsed);
      console.log('Keys:', keys);
      if (parsed.categories) console.log('First category:', JSON.stringify(parsed.categories[0], null, 2));
      if (parsed.products) console.log('First product:', JSON.stringify(parsed.products[0], null, 2));
      if (parsed.users) console.log('First user:', JSON.stringify(parsed.users[0], null, 2));
    }
  }
}
discoverAPIs();
