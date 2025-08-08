import React from 'react'
import FeaturedAuctions from '../components/home/FeaturedAuctions'
import HeroSection from '../components/home/HeroSection'
import Navbar from '../components/Navbar'
import AboutSection from '../components/home/AboutSection'
import ReviewsSection from '../components/home/ReviewsSection'
import ContactSection from '../components/home/ContactSection'
import Footer from '../components/Footer'
import { Contact } from 'lucide-react'


function Home() {
  return (
    <div>
      <Navbar/>
    
      <HeroSection/>
      <FeaturedAuctions/>
      <ReviewsSection/>
      <AboutSection/>
      <ContactSection/>
      <Footer/>
      
    </div>
  )
};

export default Home
