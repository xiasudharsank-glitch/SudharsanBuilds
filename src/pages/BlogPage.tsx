import Blog from '../components/Blog';
import Footer from '../components/Footer';
import { useEffect } from 'react';

export default function BlogPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-20">
      <Blog limit={null} showViewAll={false} />
      <Footer />
    </div>
  );
}
