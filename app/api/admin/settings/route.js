import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { getSettings, saveSettings } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ settings: getSettings() });
}

export async function PUT(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const patch = {};
  const allowed = [
    'brandName',
    'brandLogo',
    'brandTagline',
    'activationPrice',
    'currency',
    'paymentProvider',
    'stripePublishableKey',
    'stripeSecretKey',
    'paypalClientId',
    'gabsterScript',
  ];
  allowed.forEach((key) => {
    if (body[key] !== undefined) patch[key] = body[key];
  });

  if (patch.activationPrice !== undefined) {
    const price = Number(patch.activationPrice);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: 'Activation price must be a positive number' }, { status: 400 });
    }
    patch.activationPrice = price;
  }

  if (body.affiliates && typeof body.affiliates === 'object') {
    const current = getSettings().affiliates;
    const affiliates = { ...current };
    Object.keys(body.affiliates).forEach((key) => {
      if (!current[key]) return;
      const incoming = body.affiliates[key] || {};
      affiliates[key] = {
        ...current[key],
        ...(incoming.name !== undefined ? { name: String(incoming.name) } : {}),
        ...(incoming.url !== undefined ? { url: String(incoming.url) } : {}),
        ...(incoming.note !== undefined ? { note: String(incoming.note) } : {}),
        ...(incoming.accent !== undefined ? { accent: String(incoming.accent) } : {}),
      };
    });
    patch.affiliates = affiliates;
  }

  const saved = saveSettings(patch);
  return NextResponse.json({ ok: true, settings: saved });
}
