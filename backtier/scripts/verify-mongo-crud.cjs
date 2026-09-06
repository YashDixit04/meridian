const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3002';

async function request(method, path, body, token) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let payload;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const message = payload?.error || payload?.message || `${res.status} ${res.statusText}`;
    throw new Error(`${method} ${path} failed: ${message}`);
  }

  return payload?.data ?? payload;
}

async function main() {
  const rand = Date.now().toString().slice(-6);

  const login = await request('POST', '/auth/login', {
    email: 'superadmin@gmail.com',
    password: '123456',
  });

  const token = login.accessToken;
  if (!token) {
    throw new Error('Login succeeded but accessToken is missing.');
  }

  const me = await request('GET', '/auth/me', undefined, token);

  const createdTenant = await request('POST', '/tenants', {
    name: `QA Tenant ${rand}`,
    domain: `qa-${rand}.example.com`,
    status: 'Active',
    contactEmail: `qa-tenant-${rand}@example.com`,
    country: 'India',
    timezone: 'UTC+05:30',
    currency: 'INR',
  }, token);

  const fetchedTenant = await request('GET', `/tenants/${createdTenant.id}`, undefined, token);

  const updatedTenant = await request('PATCH', `/tenants/${createdTenant.id}`, {
    contactPhone: `+91-90000${rand}`,
    address: `Test Address ${rand}`,
  }, token);

  const userEmail = `qa-user-${rand}@example.com`;
  const userUsername = `qauser${rand}`;

  // Use the tenant created in this run so verification does not depend on platform tenant hints.
  const createdUser = await request('POST', `/tenants/${createdTenant.id}/users`, {
    email: userEmail,
    username: userUsername,
    password: 'Pass1234',
    firstName: 'QA',
    lastName: 'User',
    roleType: 'adminusers',
    role: 'USER',
    permissions: {
      pages: ['dashboard'],
      fields: {},
    },
  }, token);

  const fetchedUser = await request('GET', `/tenants/${createdTenant.id}/users/${createdUser.id}`, undefined, token);

  const updatedUser = await request('PATCH', `/tenants/${createdTenant.id}/users/${createdUser.id}`, {
    lastName: 'UserUpdated',
    roleType: 'admin',
  }, token);

  await request('DELETE', `/tenants/${createdTenant.id}/users/${createdUser.id}`, undefined, token);
  await request('DELETE', `/tenants/${createdTenant.id}`, undefined, token);

  const summary = {
    loginUser: me.email,
    tenantCreatedId: createdTenant.id,
    tenantFetchedName: fetchedTenant.name,
    tenantUpdatedPhone: updatedTenant.contactPhone,
    userCreatedId: createdUser.id,
    userFetchedEmail: fetchedUser.email,
    userUpdatedRoleType: updatedUser.roleType,
    status: 'PASS',
  };

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error('CRUD verification failed.');
  console.error(error.message || error);
  process.exit(1);
});
