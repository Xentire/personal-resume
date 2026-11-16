import { useEffect } from 'react';
import { About } from '../components/sections/About';
import { Awards } from '../components/sections/Awards';
import { Experience } from '../components/sections/Experience';
import { Hero } from '../components/sections/Hero';
import { Interests } from '../components/sections/Interests';
import { Notes } from '../components/sections/Notes';
import { Projects } from '../components/sections/Projects';
import { Skills } from '../components/sections/Skills';
import { profile } from '../data/resume';

/** 首页：一屏到底的所有区块。顺序即页面顺序。 */
export function Home() {
  useEffect(() => {
    const titleParts = [profile.name, profile.targetRole ?? profile.roleShort].filter(Boolean);
    document.title = titleParts.join(' · ');

    const description = document.querySelector('meta[name="description"]');
    if (description && profile.summary) {
      description.setAttribute('content', profile.summary);
    }
  }, []);

  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Awards />
      <Projects />
      <Notes />
      <Interests />
    </>
  );
}
