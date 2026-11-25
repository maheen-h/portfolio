import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Header, Footer } from './components/Layout';
import { getProject } from './content/projects';
import Home from './pages/Home';
import Work from './pages/Work';
import CaseStudy from './pages/CaseStudy';
import { About, Contact, Lab, NotFound, Resume } from './pages/Other';
import GlobalPathwaysLab from './pages/GlobalPathwaysLab';

/* Hash routing with plain names (#work, #work-ggu-edvisor-ai) so the site
   works on any static host and inside sandboxed previews. */
function useRoute() {
  const read = () => decodeURIComponent(window.location.hash.replace(/^#\/?/, ''));
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onChange = () => setRoute(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

function resolve(route: string) {
  if (route === '') return { title: '', el: <Home /> };
  if (route === 'work') return { title: 'Work', el: <Work /> };
  if (route.startsWith('work-')) {
    const p = getProject(route.slice(5));
    if (p) return { title: p.org, el: <CaseStudy project={p} /> };
  }
  if (route === 'lab') return { title: 'Product Lab', el: <Lab /> };
  if (route === 'lab-global-pathways' || route.startsWith('lab-global-pathways/') || route.startsWith('lab-global-pathways?')) return { title: 'Global Pathways AI prototype', el: <GlobalPathwaysLab /> };
  if (route === 'about') return { title: 'About', el: <About /> };
  if (route === 'resume') return { title: 'Resume', el: <Resume /> };
  if (route === 'contact') return { title: 'Contact', el: <Contact /> };
  return { title: 'Not found', el: <NotFound /> };
}

function App() {
  const route = useRoute();
  const { title, el } = resolve(route);
  const [first, setFirst] = useState(true);

  useEffect(() => {
    document.title = title ? `${title}, Maheen Hassan` : 'Maheen Hassan, Product Manager';
    if (first) return setFirst(false);
    // Pages inside the Global Pathways prototype manage their own scroll and focus.
    if (route.startsWith('lab-global-pathways/') || route.startsWith('lab-global-pathways?')) return;
    window.scrollTo(0, 0);
    // Move focus to the new page's heading for keyboard and screen reader users.
    requestAnimationFrame(() => document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true }));
  }, [route]);

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" onClick={(e) => { e.preventDefault(); document.querySelector<HTMLElement>('main h1')?.focus(); }} className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ledger focus:px-3 focus:py-2 focus:text-night">
        Skip to content
      </a>
      <Header route={route} />
      <main id="main" key={route.startsWith('lab-global-pathways') ? 'lab-global-pathways' : route} className="flex-1">{el}</main>
      <Footer />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
