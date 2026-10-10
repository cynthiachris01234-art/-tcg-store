import Link from 'next/link';
import { FaWhatsapp, FaInstagram, FaPhone, FaFacebook, FaTelegram } from 'react-icons/fa6';

export function TopBar() {
  return (
    <div className="w-full bg-black border-b border-gold/15" style={{ borderBottomColor: 'rgba(200,150,42,0.15)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11 text-xs">

          {/* Left — promo text */}
          <p className="text-muted hidden sm:block">
            🔥 <span className="text-accent font-semibold">100% sealed & authentic</span> TCG products — Free US shipping over $1,000
          </p>
          <p className="text-muted sm:hidden text-[11px]">
            🔥 100% sealed & authentic · Free US shipping over $1,000
          </p>

          {/* Right — contact links */}
          <div className="flex items-center gap-4 ml-auto">
            <a
              href="tel:+13322728148"
              className="flex items-center gap-2 text-muted hover:text-white transition-colors"
            >
              <FaPhone className="w-4 h-4 text-accent" />
              <span className="hidden sm:inline text-sm font-medium">+1 (332) 272-8148</span>
              <span className="sm:hidden text-sm">Call us</span>
            </a>

            <span className="text-gray-700">|</span>

            <a
              href="https://wa.me/13322728148"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
            >
              <FaWhatsapp className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">WhatsApp</span>
            </a>

            <span className="text-gray-700 hidden sm:inline">|</span>

            <a
              href="https://instagram.com/apextcg_distribution"
              target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 text-muted hover:text-pink-400 transition-colors"
            >
              <FaInstagram className="w-5 h-5" />
              <span className="text-sm font-medium">@apextcg_distribution</span>
            </a>

            <a
              href="https://www.facebook.com/people/Apex-TCG-Distribution/61582030211913/"
              target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 text-muted hover:text-blue-400 transition-colors"
              title="Facebook"
            >
              <FaFacebook className="w-5 h-5" />
            </a>

            <a
              href="https://t.me/apextcgshop"
              target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 text-muted hover:text-sky-400 transition-colors"
              title="Telegram"
            >
              <FaTelegram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
