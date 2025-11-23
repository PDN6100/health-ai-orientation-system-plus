import * as React from 'react';
import { Box } from '@mui/material';
import Header from './ui/Header';
import TabsPanel from './ui/TabsPanel';
import Predict from './Predict';
import HistoryPage from './HistoryPage';
import AdminDashboard from './AdminDashboard';
import Home from './Home';

export default function AppShell() {
  const [activeTab, setActiveTab] = React.useState('predict');

  const tabs = [
    { label: 'Prédiction', value: 'predict', tooltip: 'Effectuer une nouvelle prédiction' },
    { label: 'Mes résultats', value: 'results', tooltip: 'Voir votre historique de prédictions' },
    { label: 'Infos santé', value: 'infos', tooltip: 'Articles et conseils santé' },
    { label: 'Conseils', value: 'advice', tooltip: 'Conseils basés sur vos symptômes' },
    { label: 'Ressources', value: 'resources', tooltip: 'Liens externes et documents' },
    { label: 'Statistiques', value: 'statistics', tooltip: 'Statistiques personnelles' },
    { label: 'Contact', value: 'contact', tooltip: 'Nous contacter' },
    { label: 'Mon espace', value: 'account', tooltip: 'Paramètres du compte' },
    { label: 'Admin', value: 'admin', tooltip: 'Panneau administrateur' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'predict':
        return <Predict />;
      case 'results':
        return <HistoryPage />;
      case 'admin':
        return <AdminDashboard />;
      case 'infos':
        return <Home />;
      default:
        return <Predict />;
    }
  };

  return (
    <Box>
      <Header />
      <TabsPanel tabs={tabs} value={activeTab} onChange={(_e, v) => setActiveTab(v)} />
      <Box sx={{ mt: 2 }}>{renderContent()}</Box>
    </Box>
  );
}
