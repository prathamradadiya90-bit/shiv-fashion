import React from 'react';

const ReturnPolicy = () => {
  return (
    <div className="bg-[#fdfbf6] min-h-screen py-20 animate-fade-in">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl shadow-gray-100/50 border border-gray-100">
          
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif text-[#800020] mb-4">
              Return & Refund Policy
            </h1>
            <p className="text-gray-500 uppercase tracking-widest text-sm font-semibold">
              Last updated: January 2026
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-6"></div>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <section>
              <h2 className="text-2xl font-serif text-gray-900 mb-4 border-b pb-2">Return Window</h2>
              <p>
                We accept returns within 7 days of delivery. Items must be unused, unworn, unwashed, and have all original tags attached.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-gray-900 mb-4 border-b pb-2">Non-Returnable Items</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Customized or altered lehengas</li>
                <li>Items marked as final sale</li>
                <li>Products without original tags or packaging</li>
                <li>Items showing signs of wear or damage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-gray-900 mb-4 border-b pb-2">Exchange Policy</h2>
              <p>
                Exchanges for a different size are available within 7 days of delivery, subject to stock availability. One exchange per order is permitted. The customer is responsible for return shipping costs unless the exchange is due to our error.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-gray-900 mb-4 border-b pb-2">Refund Process</h2>
              <p>
                Once we receive and inspect the returned item, refunds are processed within 5-7 business days to the original payment method. For partial COD orders, the advance payment refund will be processed online; COD amounts are not applicable for refund.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-gray-900 mb-4 border-b pb-2">How to Initiate a Return</h2>
              <p>
                Contact us at <a href="mailto:hello@swastikhouse.com" className="text-[#800020] hover:underline font-medium">hello@swastikhouse.com</a> or WhatsApp with your order number and reason for return. Our team will provide return instructions and a return shipping address.
              </p>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
