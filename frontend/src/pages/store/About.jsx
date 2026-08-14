import React, { useState } from 'react';
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
        name: 'About Shreeji Fashion Surat',
        url: 'https://shreejifashion.vercel.app/about',
        description: 'Learn about Shreeji Fashion, our master artisans in Surat, and our dedication to handcrafted authentic Gujarati ethnic wear and bridal chaniya cholis.',
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
    <div className="bg-[#fdfbf6] min-h-screen py-20 animate-fade-in">
      <SEO
        title="About Us & FAQs | Authentic Ethnic Heritage | Shreeji Fashion"
        description="Learn about Shreeji Fashion Surat, our artisan heritage, craftsmanship in designer Chaniya Choli, and frequently asked questions about orders and shipping."
        keywords="about shreeji fashion, ethnic wear artisans surat, chaniya choli manufacturer surat, lehenga faqs"
        schema={aboutSchema}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        
        {/* About Section */}
        <div className="text-center mb-16">
          <p className="text-secondary text-sm font-bold tracking-[0.2em] uppercase mb-6">Our Story</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading text-primary mb-10 relative inline-block">
            About Shreeji Fashion
            <div className="absolute left-1/2 -bottom-6 transform -translate-x-1/2 w-32 border-b-2 border-secondary/20"></div>
          </h1>
          
          <div className="space-y-8 text-gray-700 leading-relaxed text-left md:text-center mt-16 text-lg">
            <p>
              Swastik House is a premium lehenga choli brand rooted in the rich heritage of Rajasthan. Our name "Swastik" symbolizes auspiciousness and prosperity — values we weave into every piece of our collection.
            </p>
            <p>
              Founded with a vision to bring royal Rajwadi elegance to modern Indian women, we work with master artisans who have inherited centuries-old embroidery techniques. From intricate zari work to delicate embellishments, every lehenga tells a story of craftsmanship and culture.
            </p>
          </div>
          
          <div className="mt-20">
            <h2 className="text-3xl md:text-4xl font-heading text-primary mb-8 text-left md:text-center">Our Craft</h2>
            <div className="text-gray-700 leading-relaxed text-left md:text-center text-lg">
              <p>
                Each lehenga choli at Swastik House is handcrafted with meticulous attention to detail. We source the finest fabrics and collaborate with skilled artisans to ensure every garment is a masterpiece that you can cherish for a lifetime.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <p className="text-secondary text-sm font-bold tracking-[0.2em] uppercase mb-6">Help Center</p>
            <h2 className="text-4xl md:text-5xl font-heading text-primary relative inline-block">
              Frequently Asked Questions
              <div className="absolute left-1/2 -bottom-6 transform -translate-x-1/2 w-32 border-b-2 border-secondary/20"></div>
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
