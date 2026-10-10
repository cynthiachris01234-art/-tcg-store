import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Clock, MessageCircle } from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaFacebook, FaTelegram } from 'react-icons/fa6';
import { SiTiktok } from 'react-icons/si';
import { ContactForm } from './ContactForm';

export const metadata = {
  title: 'Contact Us — Apex TCG',
  description: 'Get in touch with Apex TCG by WhatsApp, phone, email or social media. We usually reply within 2 hours.',
};

const CHANNELS = [
  { icon: FaWhatsapp, label: 'WhatsApp', value: '+1 (332) 272-8148', href: 'https://wa.me/13322728148', color: '#25D366', note: 'Fastest reply' },
  { icon: Phone, label: 'Call or text', value: '+1 (332) 272-8148', href: 'tel:+13322728148', color: '#C8962A' },
  { icon: Mail, label: 'Email', value: 'apextradingcardshop@gmail.com', href: 'mailto:apextradingcardshop@gmail.com', color: '#C8962A' },
  { icon: FaTelegram, label: 'Telegram', value: '@apextcgshop', href: 'https://t.me/apextcgshop', color: '#26A5E4' },
  { icon: FaInstagram, label: 'Instagram', value: '@apextcg_distribution', href: 'https://instagram.com/apextcg_distribution', color: '#E1306C' },
  { icon: FaFacebook, label: 'Facebook', value: 'Apex TCG Distribution', href: 'https://www.facebook.com/people/Apex-TCG-Distribution/61582030211913/', color: '#1877F2' },
  { icon: SiTiktok, label: 'TikTok', value: '@apextcg_distro', href: 'https://tiktok.com/@apextcg_distro', color: '#ffffff' },
];

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/" className="flex items-center gap-1.5 text-muted hover:text-white text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to store
      </Link>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-accent/15 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-accent" />
          </div>
          <h1 className="text-4xl font-black text-white">Contact Us</h1>
        </div>
        <p className="text-muted text-lg">
          Questions about a product, your order, or a bulk / wholesale deal? We&apos;re here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {CHANNELS.map(({ icon: Icon, label, value, href, color, note }) => (
            <a key={label} href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="card p-4 flex items-center gap-4 hover:border-accent/50 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-bg flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div className="min-w-0">
                <p className="text-muted text-xs flex items-center gap-2">
                  {label}
                  {note && <span className="text-green-400 bg-green-500/10 rounded px-1.5 py-0.5 text-[10px] font-semibold">{note}</span>}
                </p>
                <p className="text-white text-sm font-semibold truncate">{value}</p>
              </div>
            </a>
          ))}

          <div className="card p-4 flex items-start gap-4 border-accent/25 bg-accent/5">
            <Clock className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-white font-semibold">We usually reply within 2 hours</p>
              <p className="text-muted text-xs mt-1">
                For order questions, include your order number (it starts with APX-) so we can find it fast.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <ContactForm />
          <p className="text-muted text-xs">
            Looking for quick answers? See our <Link href="/faq" className="text-accent hover:underline">FAQ</Link>,{' '}
            <Link href="/shipping" className="text-accent hover:underline">Shipping Policy</Link> and{' '}
            <Link href="/returns" className="text-accent hover:underline">Returns &amp; Refunds</Link>. How we handle your
            information is explained in our <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
