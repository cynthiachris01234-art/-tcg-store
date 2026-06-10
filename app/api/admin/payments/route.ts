import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);

    const [intents, charges] = await Promise.all([
      stripe.paymentIntents.list({ limit, expand: ['data.payment_method'] }),
      stripe.charges.list({ limit }),
    ]);

    const chargeMap = new Map(charges.data.map(c => [c.payment_intent as string, c]));

    const payments = intents.data.map(pi => {
      const charge = chargeMap.get(pi.id);
      const pm = pi.payment_method as any;
      return {
        id:            pi.id,
        orderId:       pi.metadata?.orderId ?? null,
        amount:        pi.amount,
        currency:      pi.currency,
        status:        pi.status,
        created:       pi.created,
        description:   pi.description,
        receiptUrl:    charge?.receipt_url ?? null,
        cardBrand:     pm?.card?.brand ?? charge?.payment_method_details?.card?.brand ?? null,
        cardLast4:     pm?.card?.last4 ?? charge?.payment_method_details?.card?.last4 ?? null,
        cardCountry:   pm?.card?.country ?? charge?.payment_method_details?.card?.country ?? null,
        billingName:   pm?.billing_details?.name ?? charge?.billing_details?.name ?? null,
        billingEmail:  pm?.billing_details?.email ?? charge?.billing_details?.email ?? null,
        network:       pm?.card?.network ?? null,
        riskScore:     charge?.outcome?.risk_score ?? null,
        riskLevel:     charge?.outcome?.risk_level ?? null,
        refunded:      charge?.refunded ?? false,
        amountRefunded:charge?.amount_refunded ?? 0,
      };
    });

    const totalRevenue  = payments.filter(p => p.status === 'succeeded').reduce((s, p) => s + p.amount, 0);
    const totalRefunded = payments.reduce((s, p) => s + p.amountRefunded, 0);

    return NextResponse.json({
      payments,
      meta: {
        total:        payments.length,
        succeeded:    payments.filter(p => p.status === 'succeeded').length,
        failed:       payments.filter(p => p.status === 'requires_payment_method' || p.status === 'canceled').length,
        pending:      payments.filter(p => p.status === 'processing' || p.status === 'requires_action').length,
        totalRevenue,
        totalRefunded,
      },
    });
  } catch (err: any) {
    console.error('Payments API error:', err);
    return NextResponse.json({ error: err.message ?? 'Failed to load payments' }, { status: 500 });
  }
}
