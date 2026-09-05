import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  Truck, 
  RotateCcw, 
  Ruler, 
  CreditCard, 
  Sparkles, 
  MessageCircle, 
  Mail
} from 'lucide-react';
import SEO from '../../components/common/SEO';

const FAQ_CATEGORIES = [
  { id: 'all', label: 'All Questions', icon: HelpCircle },
  { id: 'orders', label: 'Orders & Shipping', icon: Truck },
  { id: 'sizing', label: 'Sizing & Customization', icon: Ruler },
  { id: 'returns', label: 'Returns & Alterations', icon: RotateCcw },
  { id: 'payments', label: 'Payments & COD', icon: CreditCard },
  { id: 'care', label: 'Garment Care', icon: Sparkles },
];

const FAQS = [
  // Orders & Shipping
  {
    category: 'orders',
    question: 'How long does domestic shipping take within India?',
    answer: 'Orders are typically prepared, quality-checked, and dispatched from Surat within 24 to 48 business hours. Delivery takes 3 to 5 business days for metro cities and 5 to 7 days for other regions across India via our express courier partners (BlueDart, Delhivery, DTDC).'
  },
  {
    category: 'orders',
    question: 'How can I track my shipment status?',
    answer: 'Once your order is handed over to the courier, an SMS/Email with the tracking ID is sent to your registered contact. You can also visit our Track Order page and enter your Order ID or Courier Tracking Number to view real-time transit milestones.'
  },
  {
    category: 'orders',
    question: 'Do you deliver internationally outside India?',
    answer: 'Yes! We ship worldwide across the USA, UK, Canada, Australia, UAE, and Europe via DHL Express and FedEx. International delivery typically takes 7 to 10 business days.'
  },

  // Sizing & Customization
  {
    category: 'sizing',
    question: 'Are the Chaniya Cholis and Lehengas ready-made or semi-stitched?',
    answer: 'Most of our ethnic collection is provided in premium Semi-Stitched format. The Lehenga skirt comes pleated with a customizable waistband (fits up to 42" waist), and the Choli blouse includes pre-embroidered fabric with ample inner margin (fits bust sizes up to 42") so your local tailor can achieve a bespoke, body-flattering fit.'
  },
  {
    category: 'sizing',
    question: 'Can you stitch or customize the outfit according to my exact measurements?',
    answer: 'Yes! Custom stitching and bespoke tailoring are available upon request. After placing your order, simply reach out to our design concierge team via WhatsApp or Email with your Order ID and measurement chart.'
  },
  {
    category: 'sizing',
    question: 'What is the standard flare / ghera of your Lehengas?',
    answer: 'Our designer collection features a generous traditional flare ranging between 3.5 meters to 4.25 meters, lined with multi-layer micro-cotton fabric and built-in can-can net for that majestic volume.'
  },

  // Returns & Alterations
  {
    category: 'returns',
    question: 'What is your return or exchange policy?',
    answer: 'We offer a hassle-free 7-day return/exchange window from the date of delivery for unused, unstitched items with original tags and packaging intact. If you received a damaged or incorrect piece, our team will arrange a reverse pickup at zero additional cost.'
  },
  {
    category: 'returns',
    question: 'How do I initiate a return or exchange request?',
    answer: 'Log in to your account, navigate to "My Orders", open the delivered order, and click "Request Return / Exchange". You can select your reason and submit the request. Our support team will review and approve it within 24 hours.'
  },
  {
    category: 'returns',
    question: 'How soon will I receive my refund?',
    answer: 'For prepaid orders cancelled or returned, refunds are processed back to your original payment method (Bank / UPI / Card) within 5 to 7 business days following item inspection.'
  },

  // Payments & COD
  {
    category: 'payments',
    question: 'What payment modes are accepted on Shreeji Fashion?',
    answer: 'We accept UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards (Visa, MasterCard, RuPay), Net Banking, and Partial Cash on Delivery (COD).'
  },
  {
    category: 'payments',
    question: 'How does Partial Cash on Delivery (COD) work?',
    answer: 'To prevent bogus orders on high-value ethnic designer outfits, we collect a nominal ₹500 advance deposit via Razorpay at checkout, while the remaining balance is paid in cash or UPI directly to the courier delivery executive at your doorstep.'
  },
  {
    category: 'payments',
    question: 'Is my online transaction and card data secure?',
    answer: 'Absolutely. All transactions are encrypted with 256-bit SSL encryption and routed securely through RBI-approved Razorpay payment gateway. We never store credit card or CVV details on our servers.'
  },

  // Care Instructions
  {
    category: 'care',
    question: 'How should I clean and maintain heavy embroidered ethnic wear?',
    answer: 'We strongly recommend Dry Clean Only for all zari, mirror work, sequin, and hand-embroidered outfits. Do not machine wash or soak. Store garments in breathable muslin cloth bags in a dry place.'
  },
  {
    category: 'care',
    question: 'How do I iron fabrics with delicate mirror, foil, or resham embroidery?',
    answer: 'Always steam iron or press with a warm iron on the reverse (inside) side of the fabric. Never place a hot iron directly onto sequins, mirrors, or zari borders.'
  },
];

const FAQ = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Frequently Asked Questions (FAQ) | Shreeji Fashion Surat"
        description="Find answers to common questions about orders, shipping, semi-stitched sizing, returns, payments, and ethnic garment care at Shreeji Fashion."
        keywords="faq shreeji fashion, lehenga size chart, shipping surat ethnic wear, returns exchange policy"
      />

      <div className="max-w-4xl mx-auto space-y-10">

        {/* Header Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#800020]/10 text-[#800020] text-xs font-bold uppercase tracking-wider">
            <HelpCircle size={14} /> Help & Customer Support
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Everything you need to know about our handcrafted ethnic wear, custom sizing, delivery timelines, and order support.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. shipping time, size chart, COD, return)..."
            className="w-full bg-white border border-slate-200/90 rounded-2xl pl-12 pr-4 py-3.5 text-sm shadow-sm focus:ring-2 focus:ring-[#800020] focus:border-transparent outline-none transition-all"
          />
          <Search size={18} className="absolute left-4 top-4 text-slate-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-3.5 text-xs text-slate-400 hover:text-slate-700 bg-slate-100 px-2 py-1 rounded-md"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide justify-start sm:justify-center">
          {FAQ_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setOpenIndex(null);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                  isSelected
                    ? 'bg-[#800020] text-white shadow-[#800020]/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={14} className={isSelected ? 'text-[#E5C158]' : 'text-slate-400'} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* FAQs Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <HelpCircle size={40} className="mx-auto text-slate-300" />
              <h3 className="text-base font-bold text-slate-800">No matching questions found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching for different keywords or reach out directly to our customer assistance team.
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen 
                      ? 'bg-white border-[#800020]/30 shadow-md ring-1 ring-[#800020]/10' 
                      : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {faq.question}
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'bg-[#800020] text-white rotate-180' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <ChevronDown size={16} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50 animate-in fade-in duration-200">
                      <p className="whitespace-pre-line">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Still Have Questions Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#800020] to-[#500014] text-white p-8 sm:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left z-10">
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">Still have questions?</h3>
            <p className="text-xs sm:text-sm text-slate-200 max-w-md">
              Our fashion consultants in Surat are happy to help you with custom sizing, orders, and styling advice.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 z-10">
            <Link
              to="/contact"
              className="px-5 py-3 rounded-xl bg-white text-[#800020] text-xs font-bold hover:bg-slate-100 transition-colors shadow-sm flex items-center gap-2"
            >
              <Mail size={15} /> Contact Support
            </Link>
            <a
              href="https://api.whatsapp.com/send?phone=919876543210&text=Hi%20Shreeji%20Fashion,%20I%20have%20an%20inquiry"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <MessageCircle size={15} /> WhatsApp Support
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FAQ;
