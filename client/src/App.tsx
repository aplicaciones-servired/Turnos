import { useState } from 'react';
import { MainLayout } from '@/Layouts/MainLayout';
import { PageRouter, type PageType } from '@/Router';
import { ToastProvider } from '@/Components/ui/toast/ToastProvider';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  return (
    <ToastProvider>
      <MainLayout currentPage={currentPage} onNavigate={setCurrentPage}>
        <PageRouter currentPage={currentPage} />
      </MainLayout>
    </ToastProvider>
  );
}

export default App;
