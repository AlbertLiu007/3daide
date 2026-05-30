import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

type BetaSignup = {
  email: string;
  source: string;
  createdAt: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dataPath = path.join(process.cwd(), 'data', 'beta-signups.json');

async function readSignups(): Promise<BetaSignup[]> {
  try {
    const raw = await readFile(dataPath, 'utf8');
    const parsed = JSON.parse(raw) as BetaSignup[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; source?: string };
  const email = body.email?.trim().toLowerCase();

  if (!email || !emailPattern.test(email)) {
    return NextResponse.json({ ok: false, error: 'Invalid email address.' }, { status: 400 });
  }

  const signups = await readSignups();
  const nextSignup: BetaSignup = {
    email,
    source: body.source?.trim() || 'unknown',
    createdAt: new Date().toISOString(),
  };
  const deduped = signups.filter((signup) => signup.email !== email);

  await mkdir(path.dirname(dataPath), { recursive: true });
  await writeFile(dataPath, JSON.stringify([nextSignup, ...deduped], null, 2));

  return NextResponse.json({ ok: true });
}
