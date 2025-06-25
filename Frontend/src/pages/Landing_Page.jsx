import React from 'react';
import Navbar from '../components/Landing_Page/Navbar';
import Hero from '../components/Landing_Page/Hero'
import Features from '../components/Landing_Page/Features';
import CallToAction from '../components/Landing_Page/CallToAction';
import Footer from '../components/Landing_Page/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default LandingPage;
