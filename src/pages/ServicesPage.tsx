import Services from '../components/Services';
import Footer from '../components/Footer';
import { useEffect } from 'react';

export default function ServicesPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-20">
      <Services limit={null} showViewAll={false} />
      <Footer />
    </div>
  );
}
