import { useEffect } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { Footer } from './components/layout/Footer';
import { Navbar } from './components/layout/Navbar';
import { ScrollManager } from './components/layout/ScrollManager';
import { profile } from './data/resume';
import { Blog } from './pages/Blog';
import { ExperienceDetail } from './pages/ExperienceDetail';
import { Home } from './pages/Home';
import { PostDetail } from './pages/PostDetail';
import { ProjectDetail } from './pages/ProjectDetail';

function NotFound() {
  useEffect(() => {
    document.title = `页面不存在 · ${profile.name}`;
  }, []);

  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">404</span>
      <h1 className="text-[22px] font-medium text-ink">页面不存在</h1>
      <Link to="/" className="btn-ghost mt-2">
        回到首页
      </Link>
    </div>
  );
}

/**
 * 站点外壳：导航 + 路由出口 + 页脚。
 * 想加一个新页面：在 routes 里加一条 <Route>，页面组件放 src/pages/。
 */
export default function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <div className="flex min-h-screen flex-col bg-base">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/experience/:slug" element={<ExperienceDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<PostDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
