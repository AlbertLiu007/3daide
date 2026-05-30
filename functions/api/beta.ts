type Env = {
  DB: D1Database;
};

type BetaRequestBody = {
  email?: string;
  source?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const body = (await context.request.json().catch(() => null)) as BetaRequestBody | null;
  const email = body?.email?.trim().toLowerCase();

  if (!email || !emailPattern.test(email)) {
    return json({ ok: false, error: 'Invalid email address.' }, { status: 400 });
  }

  if (!context.env.DB) {
    return json({ ok: false, error: 'D1 database is not configured.' }, { status: 500 });
  }

  const source = body?.source?.trim() || 'unknown';
  const createdAt = new Date().toISOString();

  await context.env.DB.prepare(
    `
      INSERT INTO beta_signups (email, source, created_at)
      VALUES (?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        source = excluded.source,
        created_at = excluded.created_at
    `,
  )
    .bind(email, source, createdAt)
    .run();

  return json({ ok: true });
};

export const onRequest: PagesFunction<Env> = async () => {
  return json({ ok: false, error: 'Method not allowed.' }, { status: 405 });
};
