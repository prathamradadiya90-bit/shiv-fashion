import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="bg-[#fdfbf6] min-h-screen py-20 animate-fade-in">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-heading text-primary relative inline-block mb-4">
              Privacy Policy
              <div className="absolute left-1/2 -bottom-4 transform -translate-x-1/2 w-24 border-b-2 border-secondary/20"></div>
            </h1>
            <p className="text-gray-500 mt-6 italic">Last updated: January 2026</p>
          </div>

          <div className="space-y-8 text-gray-700 leading-relaxed text-lg">
            <section>
              <h2 className="text-2xl font-heading text-primary mb-4">Information We Collect</h2>
              <p>
                We collect personal information you provide during registration, checkout, and contact forms, including name, email, phone number, and shipping address. Payment information is processed securely by Razorpay and is not stored on our servers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading text-primary mb-4">How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Processing and fulfilling your orders</li>
                <li>Sending order confirmations and shipping updates</li>
                <li>Responding to customer inquiries</li>
                <li>Sending promotional emails (with your consent)</li>
                <li>Improving our website and services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading text-primary mb-4">Data Security</h2>
              <p>
                We implement industry-standard security measures including JWT authentication, password hashing, and HTTPS encryption. Payment data is handled exclusively by Razorpay's PCI-DSS compliant infrastructure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading text-primary mb-4">Cookies</h2>
              <p>
                We use cookies to maintain your shopping cart, authentication session, and preferences. You can disable cookies in your browser settings, though some features may not function properly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading text-primary mb-4">Third-Party Services</h2>
              <p>
                We use Razorpay for payments, Cloudinary for image hosting, and may use analytics services (Google Analytics, Meta Pixel). These services have their own privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading text-primary mb-4">Your Rights</h2>
              <p>
                You may request access to, correction of, or deletion of your personal data by contacting us at <a href="mailto:hello@swastikhouse.com" className="text-primary font-medium hover:underline">hello@swastikhouse.com</a>. We will respond within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading text-primary mb-4">Contact</h2>
              <p>
                For privacy-related queries, email us at <a href="mailto:hello@swastikhouse.com" className="text-primary font-medium hover:underline">hello@swastikhouse.com</a> or write to Swastik House, G-14, 16, Old Bombay Market, Surat 395010.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
