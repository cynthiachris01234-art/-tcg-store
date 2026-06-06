import Link from 'next/link';
import { Truck, Package, Globe, Clock, Shield, ArrowLeft, Zap } from 'lucide-react';

export const metadata = { title: 'Shipping Policy — Apex TCG' };

// ── Shipping zones & rates ────────────────────────────────────────────────────

const ZONES = [
  {
    region: '🇺🇸 United States (Domestic)',
    flag: '🇺🇸',
    color: '#3B82F6',
    standard: { label: 'Standard (5–8 business days)', rates: [
      { size: 'Single Booster Box',        weight: '2–4 lbs',   std: '$9.99',  exp: '$29.99'  },
      { size: 'ETB / UPC / SPC',           weight: '3–6 lbs',   std: '$12.99', exp: '$34.99'  },
      { size: 'Case (6–12 boxes)',          weight: '15–25 lbs', std: '$24.99', exp: '$59.99'  },
      { size: 'Multiple items / Large order', weight: '25+ lbs', std: '$34.99', exp: '$79.99'  },
    ]},
  },
  {
    region: '🇨🇦 Canada & Mexico',
    flag: '🇨🇦',
    color: '#EF4444',
    standard: { label: 'Standard (8–14 business days)', rates: [
      { size: 'Single Booster Box',        weight: '2–4 lbs',   std: '$19.99', exp: '$49.99'  },
      { size: 'ETB / UPC / SPC',           weight: '3–6 lbs',   std: '$24.99', exp: '$59.99'  },
      { size: 'Case (6–12 boxes)',          weight: '15–25 lbs', std: '$59.99', exp: '$129.99' },
      { size: 'Multiple items / Large order', weight: '25+ lbs', std: '$79.99', exp: '$169.99' },
    ]},
  },
  {
    region: '🇬🇧 🇩🇪 🇫🇷 Europe',
    flag: '🇪🇺',
    color: '#F59E0B',
    standard: { label: 'Standard (10–21 business days)', rates: [
      { size: 'Single Booster Box',        weight: '2–4 lbs',   std: '$34.99', exp: '$74.99'  },
      { size: 'ETB / UPC / SPC',           weight: '3–6 lbs',   std: '$44.99', exp: '$89.99'  },
      { size: 'Case (6–12 boxes)',          weight: '15–25 lbs', std: '$99.99', exp: '$199.99' },
      { size: 'Multiple items / Large order', weight: '25+ lbs', std: '$129.99', exp: '$249.99' },
    ]},
  },
  {
    region: '🇯🇵 🇰🇷 🇸🇬 Asia & Pacific',
    flag: '🌏',
    color: '#8B5CF6',
    standard: { label: 'Standard (14–28 business days)', rates: [
      { size: 'Single Booster Box',        weight: '2–4 lbs',   std: '$39.99', exp: '$89.99'  },
      { size: 'ETB / UPC / SPC',           weight: '3–6 lbs',   std: '$49.99', exp: '$109.99' },
      { size: 'Case (6–12 boxes)',          weight: '15–25 lbs', std: '$119.99', exp: '$229.99' },
      { size: 'Multiple items / Large order', weight: '25+ lbs', std: '$159.99', exp: '$299.99' },
    ]},
  },
  {
    region: '🌍 Middle East, Africa & Latin America',
    flag: '🌍',
    color: '#10B981',
    standard: { label: 'Standard (15–35 business days)', rates: [
      { size: 'Single Booster Box',        weight: '2–4 lbs',   std: '$44.99', exp: '$99.99'  },
      { size: 'ETB / UPC / SPC',           weight: '3–6 lbs',   std: '$54.99', exp: '$119.99' },
      { size: 'Case (6–12 boxes)',          weight: '15–25 lbs', std: '$129.99', exp: '$249.99' },
      { size: 'Multiple items / Large order', weight: '25+ lbs', std: '$174.99', exp: '$329.99' },
    ]},
  },
];

const PRODUCT_SIZES = [
  { type: 'Single Booster Box',     dims: '12″ × 8″ × 4″',  weight: '2–4 lbs',   example: 'One booster box (OP01, SV9, etc.)' },
  { type: 'ETB / UPC / SPC',        dims: '14″ × 10″ × 6″', weight: '3–6 lbs',   example: 'Elite Trainer Box, Ultra Premium Collection' },
  { type: 'Case (6–12 boxes)',       dims: '24″ × 16″ × 12″',weight: '15–25 lbs', example: 'Full display case, 6 or 12 booster boxes' },
  { type: 'Multiple / Large order',  dims: '30″ × 20″ × 16″',weight: '25+ lbs',   example: 'Multiple cases or mixed large orders' },
];

export default function ShippingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Back */}
      <Link href="/" className="flex items-center gap-1.5 text-muted hover:text-white text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to store
      </Link>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-accent/15 rounded-xl flex items-center justify-center">
            <Truck className="w-5 h-5 text-accent" />
          </div>
          <h1 className="text-4xl font-black text-white">Shipping Policy</h1>
        </div>
        <p className="text-muted text-lg">We ship worldwide. All orders are fully insured and tracked.</p>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        {[
          { icon: Globe,   label: 'Worldwide',       desc: 'Ship to 180+ countries' },
          { icon: Shield,  label: 'Fully Insured',   desc: 'Every package covered'  },
          { icon: Package, label: '100% Sealed',     desc: 'Factory sealed only'    },
          { icon: Zap,     label: 'Fast Dispatch',   desc: '1–2 business day processing' },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="card p-4 text-center">
            <Icon className="w-5 h-5 text-accent mx-auto mb-2" />
            <p className="text-white font-semibold text-sm">{label}</p>
            <p className="text-muted text-xs mt-0.5">{desc}</p>
          </div>
        ))}
      </div>

      {/* Box size guide */}
      <div className="card p-6 mb-10">
        <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-accent" /> Product Size Reference
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border">
                <th className="text-left py-2 pr-4 text-muted font-medium text-xs uppercase tracking-wider">Product Type</th>
                <th className="text-left py-2 pr-4 text-muted font-medium text-xs uppercase tracking-wider">Dimensions</th>
                <th className="text-left py-2 pr-4 text-muted font-medium text-xs uppercase tracking-wider">Weight</th>
                <th className="text-left py-2 text-muted font-medium text-xs uppercase tracking-wider">Example</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-border">
              {PRODUCT_SIZES.map(p => (
                <tr key={p.type} className="hover:bg-white/[0.02]">
                  <td className="py-3 pr-4 text-white font-medium">{p.type}</td>
                  <td className="py-3 pr-4 text-muted font-mono text-xs">{p.dims}</td>
                  <td className="py-3 pr-4 text-muted">{p.weight}</td>
                  <td className="py-3 text-muted text-xs">{p.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipping rates by zone */}
      <h2 className="text-white font-bold text-2xl mb-6 flex items-center gap-2">
        <Globe className="w-6 h-6 text-accent" /> Shipping Rates by Region
      </h2>

      <div className="space-y-6 mb-12">
        {ZONES.map(zone => (
          <div key={zone.region} className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-bg-border flex items-center justify-between"
              style={{ background: `${zone.color}10` }}>
              <h3 className="text-white font-bold">{zone.region}</h3>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-muted" />
                <span className="text-muted text-xs">{zone.standard.label}</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-bg-border bg-bg/40">
                    <th className="text-left px-4 py-2.5 text-muted font-medium text-xs uppercase tracking-wider">Product</th>
                    <th className="text-left px-4 py-2.5 text-muted font-medium text-xs uppercase tracking-wider">Weight</th>
                    <th className="text-center px-4 py-2.5 text-muted font-medium text-xs uppercase tracking-wider">
                      📦 Standard
                    </th>
                    <th className="text-center px-4 py-2.5 text-muted font-medium text-xs uppercase tracking-wider">
                      ⚡ Express
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bg-border">
                  {zone.standard.rates.map(r => (
                    <tr key={r.size} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-white">{r.size}</td>
                      <td className="px-4 py-3 text-muted text-xs">{r.weight}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-white font-semibold">{r.std}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold" style={{ color: zone.color }}>{r.exp}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="card p-6 border border-accent/20 bg-accent/5 space-y-3 text-sm text-muted">
        <p className="text-white font-bold mb-2">📌 Important Notes</p>
        <p>• Shipping rates are calculated at checkout based on your exact address and order weight.</p>
        <p>• <strong className="text-white">Processing time:</strong> Orders are dispatched within 1–2 business days of payment confirmation.</p>
        <p>• <strong className="text-white">Express shipping</strong> uses FedEx, UPS, or DHL depending on destination.</p>
        <p>• <strong className="text-white">Standard shipping</strong> uses USPS Priority or economy international carriers.</p>
        <p>• All packages are fully insured. In case of loss or damage, we open a claim and reship or refund.</p>
        <p>• International orders may be subject to import duties and taxes imposed by the destination country. These are the buyer's responsibility.</p>
        <p>• Free standard shipping on USA orders over <strong className="text-white">$500</strong>.</p>
      </div>

      <div className="mt-8 text-center">
        <p className="text-muted text-sm">Questions about shipping?</p>
        <a href="https://wa.me/13322728148" target="_blank" rel="noopener noreferrer"
          className="btn-primary inline-flex items-center gap-2 mt-3 px-6 py-2.5 text-sm">
          💬 Chat with us on WhatsApp
        </a>
      </div>
    </div>
  );
}
