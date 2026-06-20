import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import { useState } from 'react';

import type { ProfileUser } from '@/components/layout/profile-dropdown';
import type { SidebarNavigationItem } from '@/components/layout/sidebar';
import { AppLayout } from '@/layouts/app-layout';
import { DesignSystemPage } from '@/pages/design-system-page';

const nurseNavigationItems: SidebarNavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: DashboardOutlinedIcon,
  },
  {
    id: 'patients',
    label: 'Pasien',
    icon: PeopleAltOutlinedIcon,
  },
  {
    id: 'screenings',
    label: 'Skrining',
    icon: FactCheckOutlinedIcon,
  },
  {
    id: 'history',
    label: 'Riwayat',
    icon: HistoryOutlinedIcon,
  },
  {
    id: 'reports',
    label: 'Laporan',
    icon: DescriptionOutlinedIcon,
  },
];

const previewUser: ProfileUser = {
  name: 'Rina Nuraini',
  role: 'Nurse',
};

export function App() {
  const [activeItemId, setActiveItemId] = useState('dashboard');
  const [systemMessage, setSystemMessage] = useState<string | null>(null);

  const activeNavigationItem =
    nurseNavigationItems.find((item) => item.id === activeItemId) ?? nurseNavigationItems[0];

  function handleNavigate(itemId: string) {
    const selectedItem = nurseNavigationItems.find((item) => item.id === itemId);

    setActiveItemId(itemId);
    setSystemMessage(
      selectedItem
        ? `Menu ${selectedItem.label} dipilih. Routing akan diintegrasikan pada Phase 2.`
        : null,
    );
  }

  return (
    <AppLayout
      title={activeNavigationItem.label}
      user={previewUser}
      navigationItems={nurseNavigationItems}
      activeItemId={activeItemId}
      onNavigate={handleNavigate}
      onProfile={() => {
        setSystemMessage(
          'Menu Profil dipilih. Halaman profil akan diintegrasikan pada phase berikutnya.',
        );
      }}
      onChangePassword={() => {
        setSystemMessage('Menu Ganti Password dipilih. Form akan dibuat bersama alur autentikasi.');
      }}
      onLogout={() => {
        setSystemMessage(
          'Aksi Logout dipilih. Session logout akan diimplementasikan pada Phase 2.',
        );
      }}
    >
      <DesignSystemPage systemMessage={systemMessage} />
    </AppLayout>
  );
}
