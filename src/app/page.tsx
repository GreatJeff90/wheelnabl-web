import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProblemsSolving from '@/components/ProblemsSolving';
import HowItWorks from '@/components/HowItWorks';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      <Navbar />
      <Hero />
      <ProblemsSolving />
      <HowItWorks />
      <Footer />
    </div>
  );
}