import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import SEO from '../../components/common/SEO';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        className="w-full py-4 flex justify-between items-center focus:outline-none text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold text-primary text-lg">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-secondary flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-secondary flex-shrink-0" />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-40 opacity-100 pb-4' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-gray-600 text-base leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

const About = () => {
  const faqs = [
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit/debit cards, UPI, net banking, and wallets securely processed through Razorpay."
    },
    {
      question: "How does Partial COD work?",
      answer: "Pay a fixed advance of ₹500 online to confirm your order. The remaining balance plus shipping is payable as Cash on Delivery."
    },
    {
      question: "What is your return policy?",
      answer: "Returns and exchanges are accepted within 7 days of delivery for unused items with original tags attached. Customized items are not eligible."
    },
    {
      question: "How long does shipping take?",
      answer: "Delivery typically takes 5-10 business days for metro cities and 7-15 business days for other areas."
    },
    {
      question: "Can I track my order?",
      answer: "Yes, once your order is shipped, you will receive a tracking number via email and you can track it in your profile."
    }
  ];

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        name: 'About chaniyacholi.nook Surat',
        url: 'https://chaniyacholinook.com/about',
        description: 'Learn about chaniyacholi.nook, our master artisans in Surat, and our dedication to handcrafted authentic Gujarati ethnic wear, Navratri ghagras, and bridal chaniya cholis.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="bg-white min-h-screen py-20 animate-fade-in">
      <SEO
        title="About Us & Story | chaniyacholi.nook | Tradition • Style • You"
        description="Discover the story of chaniyacholi.nook in Surat, Gujarat. Master craftsmanship in designer chaniya choli, Navratri ghagras, and bridal lehengas."
        keywords="about chaniyacholi.nook, chaniya choli manufacturer surat, ethnic wear artisans surat, navratri lehengas"
        schema={aboutSchema}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        
        {/* About Section */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 rounded-full border border-neutral-300 shadow-md overflow-hidden mx-auto mb-6 bg-white">
            <img src="/logo.png" alt="chaniyacholi.nook" className="w-full h-full object-cover" />
          </div>
          <p className="text-neutral-500 text-xs font-bold tracking-[0.3em] uppercase mb-3">Our Story</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading text-black mb-6 relative inline-block">
            About chaniyacholi<span className="text-neutral-500">.nook</span>
            <div className="absolute left-1/2 -bottom-4 transform -translate-x-1/2 w-32 border-b-2 border-black"></div>
          </h1>
          <p className="text-sm font-semibold tracking-[0.25em] text-neutral-600 uppercase mt-3 mb-10">Tradition • Style • You</p>
          
          <div className="space-y-6 text-neutral-700 leading-relaxed text-left md:text-center mt-12 text-lg">
            <p>
              <strong className="text-black font-heading font-semibold text-xl">chaniyacholi.nook</strong> is an exclusive designer ethnic boutique rooted in the world-renowned textile capital of Surat, Gujarat. We celebrate the timeless splendor of Indian ethnic couture through handcrafted chaniya cholis and bridal lehengas that bring together centuries of heritage and contemporary flair.
            </p>
            <p>
              Guided by our core motto — <em className="text-black font-medium">"Tradition • Style • You"</em> — we work closely with master weavers and generational artisans. From vibrant Navratri gamthi and mirror work to exquisite hand-zari bridal embroidery, every garment is crafted with passion and devotion.
            </p>
          </div>
          
          <div className="mt-16 bg-neutral-50 p-8 md:p-10 rounded-2xl border border-neutral-200 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-heading text-black mb-4 text-center">Our Artisan Craft</h2>
            <div className="text-neutral-700 leading-relaxed text-center text-base md:text-lg">
              <p>
                Each chaniya choli at <strong>chaniyacholi.nook</strong> is handcrafted with meticulous precision. We select the finest silks, georgettes, raw cottons, and rich textiles to ensure every ensemble is a cherished heirloom in your festive and bridal wardrobe.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <p className="text-neutral-500 text-sm font-bold tracking-[0.2em] uppercase mb-6">Help Center</p>
            <h2 className="text-4xl md:text-5xl font-heading text-black relative inline-block">
              Frequently Asked Questions
              <div className="absolute left-1/2 -bottom-6 transform -translate-x-1/2 w-32 border-b-2 border-black"></div>
            </h2>
          </div>
          
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 mt-16 max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
