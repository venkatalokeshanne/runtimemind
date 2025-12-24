import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { SearchCommand } from '@/features/search/SearchCommand';
import { HomePage } from '@/pages/HomePage';
import { DocPage } from '@/pages/DocPage';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { docIndex } from '@/features/docs/docIndex';

function App() {
  const theme = useSelector((state) => state.theme.mode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <SearchCommand />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/docs/:docId"
            element={<Navigate to={`/docs/${Object.keys(docIndex)[0]}/${docIndex[Object.keys(docIndex)[0]].defaultSlug}`} replace />}
          />
          <Route
            path="/docs/:docId/:slug"
            element={
              <div className="flex">
                <Sidebar />
                <main className="flex-1 min-w-0">
                  <DocPage />
                </main>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
