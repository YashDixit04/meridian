import type { Page } from '@playwright/test';

export async function seedAuthenticatedSession(page: Page) {
  await page.addInitScript(() => {
    const session = {
      id: 'e2e-user',
      email: 'e2e@maridian.test',
      username: 'e2e',
      firstName: 'E2E',
      lastName: 'User',
      role: 'SUPERADMIN',
      tenantId: 't1',
      roleType: 'superadmin',
      permissions: { pages: [], fields: {} },
      loginTimestamp: Date.now(),
    };
    window.localStorage.setItem('b2b_access_token', 'e2e-access-token');
    window.localStorage.setItem('b2b_refresh_token', 'e2e-refresh-token');
    window.localStorage.setItem('b2b_user_session', JSON.stringify(session));
    window.localStorage.setItem('hasSeenTour', 'true');
  });
}
