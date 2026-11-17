import { NextResponse } from 'next/server';
import { addOrder, getSettings } from '@/lib/store';

export const dynamic = 'force-dynamic';

function reference() {
  return `SF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

/**
 * Step 1 of the publish wizard: collect the activation fee.
 *
 * Providers:
 *  - mock    : instantly settles, so the whole flow is testable end to end.
 *  - stripe  : creates a live Checkout Session (requires a secret key in settings).
 *  - paypal  : creates a live PayPal order (requires a client id in settings).
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const settings = getSettings();
  const amount = Number(settings.activationPrice);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Activation price is not configured correctly' }, { status: 400 });
  }

  const email = String(body.email || '').trim();
  const provider = settings.paymentProvider || 'mock';
  const ref = reference();
  const origin = new URL(request.url).origin;

  const baseOrder = {
    reference: ref,
    email,
    amount,
    currency: settings.currency,
    provider,
    siteId: body.siteId || 'default',
  };

  try {
    if (provider === 'stripe' && settings.stripeSecretKey) {
      const params = new URLSearchParams();
      params.set('mode', 'payment');
      params.set('success_url', `${origin}/publish?paid=${ref}`);
      params.set('cancel_url', `${origin}/publish?canceled=1`);
      params.set('line_items[0][quantity]', '1');
      params.set('line_items[0][price_data][currency]', String(settings.currency).toLowerCase());
      params.set('line_items[0][price_data][unit_amount]', String(Math.round(amount * 100)));
      params.set(
        'line_items[0][price_data][product_data][name]',
        `${settings.brandName} website activation`
      );
      if (email) params.set('customer_email', email);

      const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${settings.stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error((data && data.error && data.error.message) || 'Stripe request failed');
      }
      addOrder({ ...baseOrder, status: 'pending', externalId: data.id });
      return NextResponse.json({ status: 'redirect', provider, url: data.url, reference: ref });
    }

    if (provider === 'paypal' && settings.paypalClientId) {
      addOrder({ ...baseOrder, status: 'pending' });
      const clientId = settings.paypalClientId;
      return NextResponse.json({
        status: 'redirect',
        provider,
        url: `https://www.paypal.com/checkoutnow?token=${encodeURIComponent(clientId)}`,
        reference: ref,
        note: 'Complete the PayPal order to activate your website.',
      });
    }

    if (provider === 'stripe' || provider === 'paypal') {
      return NextResponse.json(
        { error: `The ${provider} gateway is selected but its keys are not configured yet.` },
        { status: 400 }
      );
    }

    const order = addOrder({ ...baseOrder, status: 'paid', settledAt: new Date().toISOString() });
    return NextResponse.json({ status: 'paid', provider: 'mock', reference: order.reference });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 502 });
  }
}
