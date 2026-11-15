import { useEffect } from 'react';
import { Footer } from './components/layout/Footer';
import { Navbar } from './components/layout/Navbar';
import { About } from './components/sections/About';
import { Awards } from './components/sections/Awards';
import { Experience } from './components/sections/Experience';
import { Hero } from './components/sections/Hero';
import { Interests } from './components/sections/Interests';
import { Projects } from './components/sections/Projects';
import { Skills } from './components/sections/Skills';
import { profile } from './data/resume';

export default function App() {
  useEffect(() => {
    const titleParts = [profile.name, profile.targetRole ?? profile.roleShort].filter(Boolean);
    document.title = titleParts.join(' · ');

    const description = document.querySelector('meta[name="description"]');
    if (description && profile.summary) {
      description.setAttribute('content', profile.summary);
    }
  }, []);

  return (
    <div className="min-h-screen bg-base">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Awards />
        <Projects />
        <Interests />
      </main>
      <Footer />
    </div>
  );
}
