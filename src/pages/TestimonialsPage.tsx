import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import { useEffect } from 'react';

export default function TestimonialsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-20">
      <Testimonials limit={null} showViewAll={false} />
      <Footer />
    </div>
  );
}
