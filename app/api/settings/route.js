import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/store';

export const dynamic = 'force-dynamic';

/**
 * Public settings consumed by the builder and the publish wizard.
 * Secret keys (Stripe secret, PayPal secret) are never returned.
 */
export async function GET() {
  const s = getSettings();
  return NextResponse.json({
    settings: {
      brandName: s.brandName,
      brandLogo: s.brandLogo,
      brandTagline: s.brandTagline,
      activationPrice: s.activationPrice,
      currency: s.currency,
      paymentProvider: s.paymentProvider,
      stripePublishableKey: s.stripePublishableKey,
      paypalClientId: s.paypalClientId,
      affiliates: s.affiliates,
      gabsterScript: s.gabsterScript,
    },
  });
}
