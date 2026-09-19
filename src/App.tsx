import { useState } from 'react';
import './index.css';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import layoutStyles from './components/layout/Layout.module.css';
import { Dashboard } from './app/pages/Dashboard/Dashboard';
import { Calculator } from './app/pages/Calculator/Calculator';
import { Configuration } from './app/pages/Configuration/Configuration';
import { History } from './app/pages/History/History';
import { useRecipe } from './hooks/useRecipe';
import { useVacuumation } from './hooks/useVacuumation';
import { useVacuumSettings } from './hooks/useVacuumSettings';
import type { Page, PaintColor } from './types';

const LITERS_KEY = 'kampaunt_liters';

function loadLiters(): number {
  try {
    const raw = localStorage.getItem(LITERS_KEY);
    if (raw) return parseFloat(raw);
  } catch {}
  return 100;
}

const pageTitles: Record<Page, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Производство краски' },
  calculator: { title: 'Калькулятор', subtitle: 'Расчёт компонентов' },
  configuration: { title: 'Конфигурация', subtitle: 'Настройка рецепта' },
  history: { title: 'История процессов', subtitle: 'Архив вакумации' },
};

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [liters, setLiters] = useState<number>(loadLiters);

  const { recipe, updateRecipe } = useRecipe();
  const { durationMinutes, updateDuration } = useVacuumSettings();
  const {
    vacuumState,
    remaining,
    elapsed,
    progress,
    history,
    start,
    pause,
    resume,
    stop,
    reset,
  } = useVacuumation(liters);

  const handleLitersChange = (val: number) => {
    setLiters(val);
    localStorage.setItem(LITERS_KEY, String(val));
  };

  const handleStartVacuum = (duration: number, color: PaintColor) => {
    start(duration, color);
  };

  const pageInfo = pageTitles[currentPage];

  return (
    <div className={layoutStyles.layout}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className={layoutStyles.main}>
        <Header
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          vacuumStatus={vacuumState.status}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />

        <div className={layoutStyles.content}>
          {currentPage === 'dashboard' && (
            <Dashboard
              recipe={recipe}
              liters={liters}
              onLitersChange={handleLitersChange}
              vacuumState={vacuumState}
              remaining={remaining}
              elapsed={elapsed}
              progress={progress}
              durationMinutes={durationMinutes}
              onStartVacuum={handleStartVacuum}
              onPauseVacuum={pause}
              onResumeVacuum={resume}
              onStopVacuum={stop}
              onResetVacuum={reset}
            />
          )}

          {currentPage === 'calculator' && (
            <Calculator
              recipe={recipe}
              liters={liters}
              onLitersChange={handleLitersChange}
            />
          )}

          {currentPage === 'configuration' && (
            <Configuration
              recipe={recipe}
              durationMinutes={durationMinutes}
              onUpdateRecipe={updateRecipe}
              onUpdateDuration={updateDuration}
            />
          )}

          {currentPage === 'history' && (
            <History history={history} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
