import React from 'react';

const Terms = () => {
  return (
    <div className="bg-[#fdfbf6] min-h-screen py-20 animate-fade-in">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-heading text-primary relative inline-block mb-4">
              Terms & Conditions
              <div className="absolute left-1/2 -bottom-4 transform -translate-x-1/2 w-24 border-b-2 border-secondary/20"></div>
            </h1>
            <p className="text-gray-500 mt-6 italic">Last updated: January 2026</p>
          </div>

          <div className="space-y-8 text-gray-700 leading-relaxed text-lg">
            <section>
              <h2 className="text-2xl font-heading text-primary mb-4">1. General Terms of Use</h2>
              <p>
                By accessing and using swastikhouse.com ("Website"), you agree to be bound by these Terms and Conditions. Swastik House ("we", "us", "our") reserves the right to modify these terms at any time. Continued use of the Website constitutes acceptance of any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading text-primary mb-4">2. Account Responsibilities</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information during registration and checkout. We reserve the right to suspend accounts that violate these terms or engage in fraudulent activity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading text-primary mb-4">3. Pricing & Payment</h2>
              <p className="mb-4">
                All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We offer two payment options:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Full Online Payment:</strong> Pay the entire order amount via Razorpay (UPI, cards, net banking, wallets).</li>
                <li><strong>Partial COD:</strong> Pay a fixed advance of ₹500 online to confirm your order. The remaining balance plus shipping charges is payable as Cash on Delivery at the time of delivery.</li>
              </ul>
              <p>
                Orders are confirmed only after successful payment (full or advance). Failed payments will not result in order confirmation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading text-primary mb-4">4. Shipping Timelines & Charges</h2>
              <p>
                Shipping is charged per piece: ₹299 for products under ₹5,000, and ₹499 for products ₹5,000 and above. Mixed carts are calculated per piece. Delivery timelines vary by location, typically 5-10 business days for metro cities and 7-15 business days for other areas.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading text-primary mb-4">5. Order Cancellation</h2>
              <p>
                Orders can be cancelled before they are packed. Once an order status changes to "Packed", cancellation is not possible. For partial COD orders, the advance payment is non-refundable after order confirmation unless the cancellation is due to our error.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading text-primary mb-4">6. Return & Exchange</h2>
              <p>
                Returns and exchanges are accepted within 7 days of delivery for unused items with original tags attached. Customized or altered items are not eligible for return. Please refer to our Return & Refund Policy for detailed procedures.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading text-primary mb-4">7. Product Colour & Fabric Disclaimer</h2>
              <p>
                We strive to display product colours as accurately as possible. However, due to variations in screen settings and the handcrafted nature of our products, slight variations in colour, fabric texture, and embroidery may occur. These variations are not considered defects.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading text-primary mb-4">8. Intellectual Property</h2>
              <p>
                All content on this Website, including images, designs, logos, and text, is the property of Swastik House and protected under Indian copyright and trademark laws. Unauthorized use is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading text-primary mb-4">9. Governing Law</h2>
              <p>
                These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Surat, Gujarat.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
