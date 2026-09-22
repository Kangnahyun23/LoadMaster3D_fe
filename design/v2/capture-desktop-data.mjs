// Reproducible design snapshot; imports the existing seed in an isolated browser page.
// Does not touch app-db, credentials, or the production session.
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5182/design/v2/screens.html');
  const data = await page.evaluate(async () => {
    const { buildSeed } = await import('/src/lib/mock-db/seed.ts');
    const { createMockDb } = await import('/src/lib/mock-db/mock-db.ts');
    const { summarizeDashboard } = await import('/src/features/manager/dashboard-summary.ts');
    const { ROLE_PERMISSIONS, PERMISSIONS } = await import('/src/features/auth/permissions.ts');
    const seed = buildSeed('2026-09-22');
    const db = createMockDb({ today: '2026-09-22', latencyMs: 0, now: () => new Date('2026-09-22T12:00:00+07:00') });
    const states = await db.listVehicleStates();
    const input = { today: '2026-09-22', vehicles: seed.vehicles, users: seed.users, vehicleStates: states,
      trips: seed.trips.map(trip => ({ trip, revisions: seed.revisions.filter(r => r.tripId === trip.id) })) };
    const periods = [
      { key: 'week', label: '7 ngày · 16–22/09', start: '2026-09-16', end: '2026-09-22' },
      { key: 'month', label: 'Tháng 9 · đến ngày 22', start: '2026-09-01', end: '2026-09-22' },
    ];
    return { capturedFor: '2026-09-22', vehicles: seed.vehicles, states, users: seed.users,
      permissions: PERMISSIONS, roles: ROLE_PERMISSIONS, events: seed.events,
      dashboards: periods.map(p => ({ ...p, summary: summarizeDashboard(input, { from: p.start, to: p.end }) })),
      revisions: seed.revisions.filter(r => r.tripId === 'TRIP-2026-0914').map(r => ({ id: r.id, jobId: r.jobId,
        createdAt: r.createdAt, approvedAt: r.approvedAt, sourceRevisionId: r.sourceRevisionId,
        settings: r.request.settings, metrics: r.result.metrics, isMockResult: r.result.isMockResult })) };
  });
  await writeFile('design/v2/desktop-snapshot.mock.js', `// Generated from existing LoadMaster seed and summary functions, 22/09/2026. No passwords.\nexport const snapshot = ${JSON.stringify(data, null, 2)};\n`);
  console.log('Snapshot:', data.vehicles.length, 'vehicles,', data.users.length, 'users,', data.events.length, 'events');
} finally { await browser.close(); }
