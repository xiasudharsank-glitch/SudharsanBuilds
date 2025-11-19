import { useState } from 'react';
import { BookOpen, Clock, Calendar, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string[];
  keywords: string[];
  readTime: string;
  publishDate: string;
  featured: boolean;
}

export default function Blog() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: 'How to Start an Online Business in Trichy - Step by Step Guide',
      excerpt: 'Complete guide for Trichy entrepreneurs looking to establish their online presence and grow their business digitally.',
      keywords: ['web developer trichy', 'online business trichy', 'website for business'],
      readTime: '8 min read',
      publishDate: '2025-01-15',
      featured: true,
      content: [
        'Starting an online business in Trichy has never been more accessible. With the digital revolution reaching every corner of Tamil Nadu, local businesses now have unprecedented opportunities to expand their reach beyond traditional boundaries.',

        '**Step 1: Define Your Business Model**\nBefore diving into the digital world, clearly define what you\'re offering. Are you selling products, services, or both? Understanding your business model helps in choosing the right online platform and marketing strategy.',

        '**Step 2: Get Your Website Built**\nYour website is your digital storefront. For Trichy businesses, having a professionally designed website is crucial. Consider these options:\n• Landing Page (₹15,000) - Perfect for service providers\n• Business Website (₹30,000) - Ideal for established businesses\n• E-Commerce Store (₹50,000) - For product-based businesses',

        '**Step 3: Set Up Payment Integration**\nFor Trichy businesses, integrating Razorpay or PayPal makes accepting online payments seamless. Indian customers prefer UPI, cards, and net banking - ensure your payment gateway supports all these options.',

        '**Step 4: Optimize for Local SEO**\nMake sure customers in Trichy can find you! Include location-specific keywords like "web developer trichy," "Trichy business," and "Tiruchirappalli services" throughout your website.',

        '**Step 5: Leverage Social Media**\nCreate business profiles on Facebook and Instagram. These platforms are extremely popular in Trichy and help you connect with local customers directly.',

        '**Step 6: Start Marketing**\nUse Google My Business to appear in local searches. Run targeted Facebook ads for Trichy and surrounding areas. Collaborate with local influencers and businesses.',

        '**Why Work with a Local Web Developer?**\nPartnering with a local Trichy web developer means same timezone communication, understanding of local market needs, and the possibility of in-person meetings.',

        '**Get Started Today**\nReady to launch your online business in Trichy? Contact me for a free consultation and let\'s build your digital presence together.'
      ]
    },
    {
      id: 2,
      title: '5 Affordable Website Features Every Trichy Business Needs in 2025',
      excerpt: 'Essential website features that convert visitors into customers, specifically designed for local Trichy businesses.',
      keywords: ['affordable website', 'trichy business', 'website features'],
      readTime: '6 min read',
      publishDate: '2025-01-10',
      featured: true,
      content: [
        'In 2025, having just any website isn\'t enough - you need the right features to stand out and convert visitors into paying customers. Here are 5 essential features every Trichy business needs.',

        '**1. Mobile-First Design (Must-Have)**\nOver 80% of Indian users browse on mobile devices. Your website must look perfect and load fast on smartphones. This isn\'t optional anymore - Google penalizes non-mobile-friendly websites in search rankings.',

        '**2. Live Chat Integration (Cost: Minimal)**\nTrichy customers love instant communication! Add a live chat feature that allows instant communication. This feature alone can increase inquiries by 40-50%. It\'s easy to implement and incredibly effective.',

        '**3. Google Maps Integration (Cost: Free)**\nIf you have a physical location in Trichy, embed Google Maps. Customers need to find you easily. Add your exact address, photos, and business hours. This builds trust and drives foot traffic.',

        '**4. Contact Forms with Auto-Response**\nCapture leads with well-designed contact forms. Include fields for name, phone, email, and service selection. Auto-respond immediately with "We\'ll contact you within 24 hours" to build trust.',

        '**5. Payment Gateway Integration (Setup: Included in our packages)**\nAccept online payments directly on your website. Razorpay integration supports UPI, cards, net banking, and wallets. Essential for e-commerce but also great for service businesses taking advance bookings.',

        '**Pricing for Trichy Businesses**\n• Landing Page with all features: ₹15,000\n• Business Website (5-10 pages): ₹30,000\n• E-Commerce Store: ₹50,000',

        '**Why These Features Matter**\nThese aren\'t fancy additions - they\'re conversion tools. Each feature is designed to remove friction and make it easier for customers to choose your business.',

        '**Local Web Developer Advantage**\nWorking with a Trichy-based developer means faster turnaround, local market understanding, and ongoing support in the same timezone.',

        '**Ready to Upgrade Your Website?**\nLet\'s discuss which features your business needs. Book a free consultation today!'
      ]
    },
    {
      id: 3,
      title: 'Why Your Restaurant in Trichy Needs Online Ordering in 2025',
      excerpt: 'How Trichy restaurants can increase revenue by 30% with online ordering systems and digital presence.',
      keywords: ['restaurant website trichy', 'online ordering', 'food business'],
      readTime: '7 min read',
      publishDate: '2025-01-05',
      featured: false,
      content: [
        'The food industry in Trichy is booming, but restaurants without online ordering are leaving money on the table. Here\'s why your restaurant needs to go digital in 2025.',

        '**The Problem: Reliance on Third-Party Apps**\nSwiggy and Zomato charge 20-30% commission per order. For a ₹500 order, you lose ₹100-150 to commissions. Over a month, this adds up to lakhs of rupees in lost profit.',

        '**The Solution: Your Own Online Ordering System**\nBuild your own website with integrated online ordering. Accept payments via Razorpay. Zero commission. All profit stays with you.',

        '**Benefits of Direct Online Ordering:**\n• Keep 100% of profits (no 20-30% commission)\n• Build customer database for marketing\n• Control your brand experience\n• Accept advance orders\n• Reduce phone order errors',

        '**What Your Restaurant Website Needs:**\n1. Digital menu with photos and prices\n2. Online ordering system with cart\n3. Payment gateway (Razorpay/PayPal)\n4. Order tracking system\n5. Email/SMS notifications\n6. Google Maps location',

        '**Case Study: Local Trichy Restaurant**\nA biryani restaurant in Trichy launched their own ordering website. Results after 3 months:\n• 30% increase in orders\n• Saved ₹45,000 in third-party commissions\n• Built customer database of 500+ regular customers\n• Reduced phone order mistakes by 90%',

        '**Cost of Restaurant Website**\nComplete restaurant website with online ordering: ₹50,000 (one-time)\nCompared to: ₹15,000+ monthly in Swiggy/Zomato commissions.',

        '**Marketing Your Restaurant Online:**\n• Google My Business listing\n• Instagram food photos\n• Facebook ads targeting Trichy area\n• Email newsletter for offers\n• Customer reviews and ratings',

        '**ROI Calculation**\nInvestment: ₹50,000\nMonthly commission savings: ₹15,000\nBreak-even: 3-4 months\nAfter that: Pure profit increase!',

        '**Ready to Launch Your Restaurant Website?**\nLet\'s build your online ordering system. Contact me for a free consultation and custom quote.'
      ]
    },
    {
      id: 4,
      title: 'Local SEO Tips: How to Rank First on Google in Trichy',
      excerpt: 'Actionable SEO strategies to make your business appear first when Trichy customers search for your services.',
      keywords: ['SEO trichy', 'local SEO', 'google ranking'],
      readTime: '9 min read',
      publishDate: '2024-12-28',
      featured: false,
      content: [
        'Want to appear first when someone in Trichy searches for your business? Local SEO is the answer. Here\'s your complete guide to ranking #1 on Google in Trichy.',

        '**What is Local SEO?**\nLocal SEO helps your business appear in "near me" searches and location-specific queries like "web developer trichy" or "restaurants near Srirangam".',

        '**1. Claim Your Google Business Profile**\nThis is FREE and the most important step:\n• Go to google.com/business\n• Add your business name, address, phone\n• Choose correct category\n• Add photos of your business\n• Verify your listing',

        '**2. Use Location Keywords Throughout Your Website**\nInclude these in your website:\n• "Best [your service] in Trichy"\n• "Trichy [your business type]"\n• "Tiruchirappalli [service]"\n• Your locality (Srirangam, Cantonment, etc.)',

        '**3. Get Reviews from Trichy Customers**\nGoogle loves reviews! Ask satisfied customers to leave 5-star reviews on your Google Business Profile. Even 10-15 reviews can significantly boost rankings.',

        '**4. Create Location-Specific Content**\nWrite blog posts about:\n• "How to [solve problem] in Trichy"\n• "[Your service] guide for Trichy businesses"\n• "Best [product] for Trichy weather/conditions"',

        '**5. Build Local Backlinks**\nGet your website linked from:\n• Trichy business directories\n• Local news websites\n• Chamber of commerce website\n• Local event websites\n• Partnership websites',

        '**6. Mobile Optimization is Critical**\n85% of local searches happen on mobile. Your website must:\n• Load in under 3 seconds\n• Look perfect on smartphones\n• Have click-to-call buttons\n• Show your location clearly',

        '**7. Use Schema Markup (Local Business)**\nAdd structured data to help Google understand your business:\n• Business name and address\n• Phone number\n• Opening hours\n• Service areas\n• Reviews and ratings',

        '**8. Create Social Media Presence**\nGoogle considers social signals:\n• Facebook Business Page with Trichy location\n• Instagram with location tags\n• Regular posts about your business\n• Engage with local customers',

        '**Quick Wins for Trichy Businesses:**\n• Add your email on every page\n• Include your address in footer\n• Create "Contact Us" page with map\n• Add live chat widget\n• Use local landmarks in descriptions',

        '**How Long to See Results?**\n• Google Business Profile: 1-2 weeks\n• Local content: 1-3 months\n• Backlinks and reviews: 2-4 months\nSEO is a marathon, not a sprint!',

        '**Need Help with Local SEO?**\nI build SEO-optimized websites for Trichy businesses with all best practices included. Let\'s get your business ranking #1!'
      ]
    },
    {
      id: 5,
      title: 'How Much Does a Website Cost? Trichy Web Developer Pricing Guide',
      excerpt: 'Transparent pricing breakdown for websites in Trichy - from landing pages to e-commerce stores.',
      keywords: ['website cost', 'web developer cost', 'trichy pricing'],
      readTime: '6 min read',
      publishDate: '2024-12-20',
      featured: false,
      content: [
        'One of the most common questions I get: "How much does a website cost in Trichy?" Let me break down the pricing transparently so you know exactly what to expect.',

        '**Landing Page: ₹15,000**\nPerfect for:\n• Freelancers and consultants\n• Service providers\n• Portfolio websites\n• Lead generation\n\nWhat you get:\n• 1-2 page website\n• Mobile responsive design\n• Contact form\n• Live chat integration\n• Google Analytics\n• SSL certificate\n• 1 year hosting\n• Basic SEO\nTimeline: 1-2 weeks',

        '**Business Website: ₹30,000**\nPerfect for:\n• Small businesses\n• Professional services\n• Established companies\n• Multi-page presence\n\nWhat you get:\n• 5-10 pages\n• Custom design\n• CMS integration (easy updates)\n• Blog section\n• Advanced SEO\n• Analytics dashboard\n• Contact forms\n• Email setup\n• 1 year hosting\nTimeline: 3-4 weeks',

        '**E-Commerce Store: ₹50,000**\nPerfect for:\n• Online shops\n• Product businesses\n• Retail stores going digital\n\nWhat you get:\n• Product catalog (unlimited products)\n• Shopping cart\n• Payment gateway (Razorpay/PayPal)\n• Inventory management\n• Order tracking\n• Customer accounts\n• Admin dashboard\n• Email notifications\n• Mobile app-like experience\n• 1 year hosting\nTimeline: 4-6 weeks',

        '**Custom Development: ₹500-1000/hour**\nPerfect for:\n• Unique requirements\n• Complex features\n• API integrations\n• Custom business logic\n\nExamples:\n• Booking systems\n• CRM integration\n• Custom dashboards\n• Mobile apps\nTimeline: Flexible',

        '**What Affects Website Cost?**\nFactors that increase cost:\n• Number of pages\n• Custom features\n• Third-party integrations\n• Content creation\n• Advanced animations\n• Custom designs',

        '**What\'s Included in All Packages:**\n• Mobile-first responsive design\n• Fast loading speed (90+ PageSpeed score)\n• Live chat integration\n• SSL certificate (secure https)\n• Google Analytics\n• Contact forms\n• Social media integration\n• 1 year of technical support\n• Free minor updates for 6 months',

        '**What\'s NOT Included:**\n• Domain name (₹500-1000/year)\n• Content writing (can add for ₹5000)\n• Logo design (can add for ₹5000)\n• Professional photography\n• Digital marketing services',

        '**Ongoing Costs After Website Launch:**\n• Hosting: ₹3000-5000/year\n• Domain renewal: ₹500-1000/year\n• Maintenance: ₹5000-10000/year (optional)\n• Marketing: Variable',

        '**Why Choose Local Trichy Developer?**\n• Competitive pricing\n• Same timezone\n• Meet in person if needed\n• Understand local market\n• Ongoing support in Tamil if needed',

        '**Payment Terms:**\n• 30-50% advance to start\n• Balance on delivery\n• EMI options available for large projects',

        '**Money-Back Guarantee:**\nIf you\'re not satisfied with the website design, get 100% refund during the first revision. No questions asked.',

        '**Ready to Get Started?**\nContact me for a free consultation. Let\'s discuss your requirements and I\'ll give you an exact quote. No hidden fees, ever.'
      ]
    }
  ];

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="blog" className="py-16 md:py-24 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-8 h-8 text-cyan-600" />
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              Blog & <span className="text-cyan-600">Resources</span>
            </h2>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Helpful guides and insights for Trichy businesses looking to grow online
          </p>
        </motion.div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-12">
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border overflow-hidden cursor-pointer ${
                post.featured ? 'border-cyan-500 border-2' : 'border-slate-100'
              }`}
              onClick={() => setSelectedPost(post)}
            >
              {post.featured && (
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-1 text-sm font-bold">
                  Featured Article
                </div>
              )}

              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-slate-600 mb-4 line-clamp-3 text-sm">
                  {post.excerpt}
                </p>

                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(post.publishDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {post.keywords.slice(0, 2).map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-cyan-50 text-cyan-700 text-xs rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>

                <button className="flex items-center gap-2 text-cyan-600 font-semibold hover:text-cyan-700 transition-colors">
                  Read Article
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      {/* Blog Post Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                    {selectedPost.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{selectedPost.readTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(selectedPost.publishDate).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 md:p-8">
                {selectedPost.content.map((paragraph, idx) => (
                  <p
                    key={idx}
                    className="text-slate-700 leading-relaxed mb-6 whitespace-pre-line"
                    dangerouslySetInnerHTML={{
                      __html: paragraph
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-bold text-lg block mt-4 mb-2">$1</strong>')
                        .replace(/•/g, '•')
                    }}
                  />
                ))}

                {/* CTA at end of article */}
                <div className="mt-8 p-6 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Ready to Get Started?
                  </h3>
                  <p className="text-slate-700 mb-4">
                    Contact me today for a free consultation and let's build your online presence!
                  </p>
                  <button
                    onClick={scrollToContact}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Get Free Consultation
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
