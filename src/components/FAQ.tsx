import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'How long does it take to build a website?',
      answer: 'Timeline depends on the type of website: Landing Pages take 1-2 weeks, Business Websites take 3-4 weeks, and E-Commerce Stores take 4-6 weeks. Custom projects are flexible. I work efficiently to deliver quality work on time.'
    },
    {
      question: 'Do you provide hosting and domain?',
      answer: 'Yes! All my packages include 1 year of hosting. Domain registration costs ₹500-1000/year extra. I can handle the complete setup for you, or you can purchase separately if you prefer.'
    },
    {
      question: 'Will my website work on mobile phones?',
      answer: 'Absolutely! All websites I build are mobile-first and fully responsive. They work perfectly on smartphones, tablets, and desktops. Over 80% of users browse on mobile, so this is a top priority.'
    },
    {
      question: 'Can I update the website myself after it\'s built?',
      answer: 'Yes! Business Website and E-Commerce packages include CMS (Content Management System) that allows you to easily update text, images, and products without any coding knowledge. I\'ll provide training on how to use it.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'I accept bank transfers, UPI, Google Pay, PhonePe, and Razorpay. Payment terms: 30-50% advance to start the project, balance on delivery. EMI options available for projects above ₹40,000.'
    },
    {
      question: 'Do you offer support after the website is launched?',
      answer: 'Yes! All packages include 1 year of technical support. Free minor updates for 6 months. For major changes or ongoing maintenance, we can discuss a monthly retainer starting from ₹3,000/month.'
    },
    {
      question: 'Will my website appear on Google?',
      answer: 'Yes! All websites include basic SEO (Search Engine Optimization). I submit your site to Google, add meta tags, and optimize for speed. For advanced SEO and ranking, we offer additional SEO services starting from ₹10,000.'
    },
    {
      question: 'Can you integrate payment gateway for online payments?',
      answer: 'Absolutely! I integrate Razorpay or PayPal which support UPI, credit/debit cards, net banking, and wallets. Setup is included in E-Commerce packages. For other packages, integration costs ₹5,000 extra.'
    },
    {
      question: 'What if I\'m not satisfied with the design?',
      answer: 'Your satisfaction is guaranteed! You get 2-3 free revisions during development. If you\'re still not happy during the first revision, I offer a 100% money-back guarantee. No questions asked.'
    },
    {
      question: 'Do you only work with Trichy businesses?',
      answer: 'While I\'m based in Trichy, I work with businesses across Tamil Nadu and all of India. Local Trichy clients get the benefit of in-person meetings, but I work remotely with clients nationwide.'
    },
    {
      question: 'Can you help with content and images for my website?',
      answer: 'Yes! Content writing services: ₹5,000 extra. I can write professional copy for all pages. For images, you can provide your own, or I can use high-quality stock photos. Professional photography can be arranged separately.'
    },
    {
      question: 'What\'s the difference between your packages?',
      answer: 'Landing Page (₹15k): 1-2 pages, perfect for freelancers. Business Website (₹30k): 5-10 pages with blog, ideal for companies. E-Commerce (₹50k): Full online store with payment and inventory. Custom: For unique requirements.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle className="w-8 h-8 text-cyan-600" />
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              Frequently Asked <span className="text-cyan-600">Questions</span>
            </h2>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Common questions about website development and my services
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden hover:border-cyan-500 transition-colors"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <span className="text-lg font-semibold text-slate-900 pr-4">
                  {faq.question}
                </span>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="w-6 h-6 text-cyan-600" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-slate-400" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pt-2 text-slate-700 leading-relaxed bg-slate-50 border-t border-slate-200">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-lg text-slate-600 mb-4">
            Still have questions?
          </p>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              const contactSection = document.getElementById('contact');
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Contact Me
          </a>
        </motion.div>
      </div>
    </section>
  );
}
