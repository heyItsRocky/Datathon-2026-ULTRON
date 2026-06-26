import { Outlet } from 'react-router-dom';
import { FooterBar } from './FooterBar';
import { RightContextPanel } from './RightContextPanel';
import { SectionToolbar } from './SectionToolbar';
import { SidebarNav } from './SidebarNav';
import { TopHeader } from './TopHeader';

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <SidebarNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader />
        <SectionToolbar />
        <main className="min-h-0 flex-1 overflow-auto p-4 lg:p-6"><Outlet /></main>
        <FooterBar />
      </div>
      <RightContextPanel />
    </div>
  );
}
