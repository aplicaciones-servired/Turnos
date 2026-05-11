import { useState } from 'react';
import { MainLayout } from '@/Layouts/MainLayout';
import { PageRouter, type PageType } from '@/Router';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  return (
    <MainLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      <PageRouter currentPage={currentPage} />
    </MainLayout>
  );
}

export default App;
