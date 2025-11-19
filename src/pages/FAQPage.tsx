import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import { useEffect } from 'react';

export default function FAQPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-20">
      <FAQ limit={null} showViewAll={false} />
      <Footer />
    </div>
  );
}
