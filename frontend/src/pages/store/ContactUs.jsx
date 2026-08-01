import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', formData);
      toast.success('Your message has been sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-heading font-bold text-primary mb-4">Contact Us</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We would love to hear from you. Whether you have a question about our Chaniya Cholis, pricing, or anything else, our team is ready to answer all your questions.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-12 max-w-6xl mx-auto">
        {/* Contact Information */}
        <div className="w-full md:w-1/3 space-y-8">
          <div className="bg-accent/10 p-6 rounded-lg border border-accent/20">
            <div className="flex items-start space-x-4">
              <div className="bg-primary text-white p-3 rounded-full">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold text-xl text-primary mb-2">Our Store</h3>
                <p className="text-gray-600">
                  123 Fashion Street, <br />
                  Ahmedabad, Gujarat 380001, <br />
                  India
                </p>
              </div>
            </div>
          </div>

          <div className="bg-accent/10 p-6 rounded-lg border border-accent/20">
            <div className="flex items-start space-x-4">
              <div className="bg-primary text-white p-3 rounded-full">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="font-bold text-xl text-primary mb-2">Call Us</h3>
                <p className="text-gray-600">
                  +91 98765 43210 <br />
                  Mon - Sat, 10am - 8pm
                </p>
              </div>
            </div>
          </div>

          <div className="bg-accent/10 p-6 rounded-lg border border-accent/20">
            <div className="flex items-start space-x-4">
              <div className="bg-primary text-white p-3 rounded-full">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold text-xl text-primary mb-2">Email Us</h3>
                <p className="text-gray-600">
                  info@shivfashion.com <br />
                  support@shivfashion.com
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="w-full md:w-2/3">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject (Optional)</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="How can we help you?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-primary focus:border-primary transition-colors resize-none"
                  placeholder="Write your message here..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : (
                  <>
                    Send Message <Send size={18} className="ml-2" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
