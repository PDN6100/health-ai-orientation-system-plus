import * as React from 'react';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { extendTheme } from '@mui/material/styles';
//icons
import HistoryIcon from '@mui/icons-material/History';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import LogoutIcon from '@mui/icons-material/Logout';
//others
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import '../styles/NavCompStyle.css';
import Predict from './Predict';
import HistoryPage from './HistoryPage';
import { useNavigate } from 'react-router-dom';

//gestion routes
function renderPageContent(pathname) {
  if (pathname === '/Predict') {
    return <Predict />;
  }
  if (pathname === '/History') {
    return <HistoryPage />;
  }
}
const demoTheme = extendTheme({
  colorSchemes: { light: true },
  colorSchemeSelector: 'class',
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function useDemoRouter(initialPath) {
  const [pathname, setPathname] = React.useState(initialPath);

  const router = React.useMemo(() => {
    return {
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path) => setPathname(String(path)),
    };
  }, [pathname]);

  return router;
}

export default function NavComp(props) {
  const navigate = useNavigate();
  const { window } = props;
  const router = useDemoRouter('/Predict');
  // gestion responsive
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.up('sm') && theme.breakpoints.down('md'));
  const isMd = useMediaQuery(theme.breakpoints.up('md') && theme.breakpoints.down('lg'));
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  React.useEffect(() => {
    if (router.pathname === '/logout') {
      localStorage.removeItem('token'); // Supprime le token
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      navigate('/'); // Redirige hors de NavComp
    }
  }, [router.pathname, navigate]);
  const sidebarWidth = React.useMemo(() => {
    if (isXs) return 300;
    if (isSm) return 66;
    if (isMd) return 66;
    if (isLg) return 66;
    return 20;
  }, [isXs, isSm, isMd, isLg]);

  //navigation sidebar
  const NAVIGATION = [
    {
      segment: 'Predict',
      title: isXs ? 'Predict' : '',
      icon: <MonitorHeartIcon />,
    },
    {
      segment: 'History',
      title: isXs ? 'History' : '',
      icon: <HistoryIcon />,
    },
    {
      segment: 'logout',
      title: isXs ? 'Logout' : '',
      icon: <LogoutIcon />,
    },
  ];
  const demoWindow = window ? window() : undefined;
  return (
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      window={demoWindow}
      branding={{
        logo: (
          <img src="/logo1.png" alt="My Logo" style={{ height: '200px', marginRight: '10px' }} />
        ),
        title: <span style={{ color: '#12b82b' }}>HealthyAI</span>,
        homeUrl: '/',
      }}
    >
      <DashboardLayout
        sidebarExpandedWidth={sidebarWidth}
        defaultSidebarCollapsed={true}
        disableCollapsibleSidebar={true}
      >
        <PageContainer>{renderPageContent(router.pathname)}</PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}
