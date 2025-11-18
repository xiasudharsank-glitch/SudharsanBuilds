import Navigation from './components/Navigation';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Process from './components/Process';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AIChatbot from "./components/AIChatbot";
import FloatingAvatar from './components/FloatingAvatar';

function App() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <About />
      <Projects />
      <Process />
      <Services />
      <Testimonials />
      <Contact />
      <Footer />
      <AIChatbot />
      <FloatingAvatar />
    </div>
  );
}

export default App;
