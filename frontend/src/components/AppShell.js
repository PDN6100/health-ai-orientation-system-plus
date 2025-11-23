import * as React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Typography,
  Button,
  TextField,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import InfoIcon from '@mui/icons-material/Info';
import LinkIcon from '@mui/icons-material/Link';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import axios from 'axios';
const API_BASE = 'http://localhost:8080';
import Header from './ui/Header';
import TabsPanel from './ui/TabsPanel';
import Predict from './Predict';
import HistoryPage from './HistoryPage';
// AdminDashboard removed
import Profile from './Profile';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SpaIcon from '@mui/icons-material/Spa';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import SimpleBarChart from './ui/SimpleBarChart';
import AdvancedCharts from './ui/AdvancedCharts';
import { useNavigate } from 'react-router-dom';
import symptoms from '../data/Symtoms.json';

export default function AppShell() {
  const [activeTab, setActiveTab] = React.useState('predict');
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const navigate = useNavigate();

  const [userName, setUserName] = React.useState(localStorage.getItem('userName') || '');
  const userId = localStorage.getItem('userId') || '';

  const tabs = [
    { label: 'Prédiction', value: 'predict', tooltip: 'Effectuer une nouvelle prédiction' },
    { label: 'Mes résultats', value: 'results', tooltip: 'Voir votre historique de prédictions' },
    { label: 'Infos santé', value: 'infos', tooltip: 'Articles et conseils santé' },
    { label: 'Conseils', value: 'advice', tooltip: 'Conseils basés sur vos symptômes' },
    { label: 'Ressources', value: 'resources', tooltip: 'Liens externes et documents' },
    { label: 'Statistiques', value: 'statistics', tooltip: 'Statistiques personnelles' },
    { label: 'Contact', value: 'contact', tooltip: 'Nous contacter' },
    { label: 'Mon espace', value: 'account', tooltip: 'Paramètres du compte' },
    // Admin tab removed — managed separately
  ];

  const onLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const [resultsList, setResultsList] = React.useState([]);
  const [resultsLoading, setResultsLoading] = React.useState(false);
  const [stats, setStats] = React.useState({ total: 0, topDiseases: [] });
  const [resourcesList, setResourcesList] = React.useState([]);

  React.useEffect(() => {
    // prepare resources from symptoms
    const res = (symptoms || [])
      .slice(0, 40)
      .map((s) => ({ title: s.title, link: `https://www.who.int/search?q=${encodeURIComponent(s.title)}`, summary: `Informations et conseils généraux sur ${s.title}` }));
    setResourcesList(res);
  }, []);

  const fetchHistory = React.useCallback(async () => {
    if (!userId) return;
    setResultsLoading(true);
    try {
      const r = await axios.get(`${API_BASE}/api/history`, { params: { userId } });
      const data = r.data || [];
      setResultsList(data);
      const total = data.length;
      const counts = {};
      data.forEach((entry) => {
        const d = entry.disease || (Array.isArray(entry.disease) ? entry.disease[0] : 'Inconnu');
        counts[d] = (counts[d] || 0) + 1;
      });
      const topDiseases = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([d, c]) => ({ disease: d, count: c }));
      setStats({ total, topDiseases });
    } catch (err) {
      console.error('fetchHistory error', err);
    } finally {
      setResultsLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    if (activeTab === 'results' || activeTab === 'statistics') fetchHistory();
  }, [activeTab, fetchHistory]);

  // keep userName in sync if localStorage changes within same window
  React.useEffect(() => {
    const onSave = () => setUserName(localStorage.getItem('userName') || '');
    window.addEventListener('profile:saved', onSave);
    return () => window.removeEventListener('profile:saved', onSave);
  }, []);

  // listen for prediction events so history/advice update automatically
  React.useEffect(() => {
    const handler = (e) => {
      const pred = e && e.detail ? e.detail : null;
      if (pred) {
        // optimistic update so advice updates immediately even if backend/userId missing
        setResultsList((prev) => {
          const next = [pred, ...prev];
          // recalc stats
          const counts = {};
          next.forEach((entry) => {
            const d = entry.disease || (Array.isArray(entry.disease) ? entry.disease[0] : 'Inconnu');
            counts[d] = (counts[d] || 0) + 1;
          });
          const total = next.length;
          const topDiseases = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([d, c]) => ({ disease: d, count: c }));
          setStats({ total, topDiseases });
          return next;
        });
      }
      // refresh authoritative history when possible
      fetchHistory();
    };
    window.addEventListener('prediction:created', handler);
    return () => window.removeEventListener('prediction:created', handler);
  }, [fetchHistory]);

  const toggleDrawer = () => setDrawerOpen((s) => !s);

  const goToTab = (value) => {
    setActiveTab(value);
    setDrawerOpen(false);
  };

  const AdviceTab = () => (
    <Box sx={{ mt: 4, px: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        Conseils personnalisés
      </Typography>
      <Typography sx={{ color: 'gray', mb: 2 }}>
        Recommandations adaptées à vos prédictions récentes et conseils généraux de prévention
        et d'hygiène de vie.
      </Typography>

      {/* Highlighted based on recent predictions */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>Basé sur vos prédictions récentes</Typography>
        {resultsList.length === 0 ? (
          <Typography sx={{ color: 'gray' }}>Aucune prédiction récente pour personnaliser les conseils.</Typography>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {Array.from(new Set(resultsList.map((r) => (Array.isArray(r.disease) ? r.disease[0] : r.disease || 'Inconnu')))).slice(0,5).map((d) => {
              const info = findAdviceFor(d) || {};
              return (
                <Box key={d} sx={{ minWidth: 220, p: 2, border: '1px solid #efefef', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalHospitalIcon color="primary" />
                    <Typography sx={{ fontWeight: 700 }}>{d}</Typography>
                    <Chip label="Récemment détectée" size="small" color="warning" sx={{ ml: 1 }} />
                  </Box>
                  <Typography sx={{ color: 'gray', fontSize: 13, mt: 1 }}>{info.fullDescription || info.overview || 'Fiche détaillée non disponible pour cette maladie.'}</Typography>
                  <Accordion sx={{ mt: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>Détails</AccordionSummary>
                    <AccordionDetails>
                      <Typography sx={{ fontWeight: 600 }}>Aperçu</Typography>
                      <Typography sx={{ color: 'gray' }}>{info.fullDescription || info.overview || 'Détails non disponibles pour cette maladie.'}</Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography sx={{ fontWeight: 600 }}>Conseils rapides</Typography>
                        <Typography sx={{ color: 'gray' }}>{info.firstLineAdvice || 'Aucun conseil rapide disponible pour cette maladie.'}</Typography>
                      </Box>
                      <Box sx={{ mt: 1 }}>
                        <Typography sx={{ fontWeight: 600 }}>Conseils pratiques</Typography>
                        {Array.isArray(info.practicalTips) && info.practicalTips.length > 0 ? (
                          <ul>
                            {info.practicalTips.slice(0,5).map((p,i)=>(<li key={i} style={{ color:'#666' }}>{p}</li>))}
                          </ul>
                        ) : null}
                      </Box>
                      <Box sx={{ mt: 1 }}>
                        <Typography sx={{ fontWeight: 600 }}>Prévention</Typography>
                        <ul>
                          {(info.prevention || []).slice(0,5).map((p, i) => <li key={i} style={{ color: '#666' }}>{p}</li>)}
                        </ul>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Lifestyle / hygiene of life */}
      <Box sx={{ mb: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Box sx={{ p: 2, border: '1px solid #efefef', borderRadius: 2 }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Hygiène de vie</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}><FitnessCenterIcon /> <Typography>Activité physique régulière</Typography></Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}><LocalDiningIcon /> <Typography>Alimentation équilibrée</Typography></Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}><SpaIcon /> <Typography>Gestion du stress & sommeil</Typography></Box>
          </Box>
        </Box>

        <Box sx={{ p: 2, border: '1px solid #efefef', borderRadius: 2 }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Conseils généraux</Typography>
          <Typography sx={{ color: 'gray', fontSize: 13 }}>Nombre de fiches conseils disponibles: {Object.keys(adviceMap).length}</Typography>
          <Box sx={{ mt: 1 }}>
            {Object.entries(adviceMap).slice(0,6).map(([k,v]) => (
              <Box key={k} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <EmojiObjectsIcon fontSize="small" />
                <Typography sx={{ fontWeight: 600 }}>{k}</Typography>
                <Typography sx={{ color: 'gray', fontSize: 12, ml: 1 }}>{v.overview?.slice(0,80) || ''}...</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Full list of advice as accordions */}
      <Box>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>Toutes les recommandations</Typography>
        {Object.keys(adviceMap).length === 0 ? (
          <Typography sx={{ color: 'gray' }}>Aucune donnée disponible.</Typography>
        ) : (
          Object.entries(adviceMap).map(([d, info]) => (
            <Accordion key={d} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalHospitalIcon />
                  <Typography sx={{ fontWeight: 600 }}>{d}</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={{ fontWeight: 600 }}>Aperçu</Typography>
                <Typography sx={{ color: 'gray' }}>{info.fullDescription || info.overview}</Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>Conseils rapides</Typography>
                  <Typography sx={{ color: 'gray' }}>{info.firstLineAdvice}</Typography>
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>Conseils pratiques</Typography>
                  {Array.isArray(info.practicalTips) && info.practicalTips.length > 0 ? (
                    <ul>
                      {info.practicalTips.map((p, i) => (
                        <li key={i} style={{ color: '#666' }}>{p}</li>
                      ))}
                    </ul>
                  ) : (
                    <Typography sx={{ color: 'gray' }}>{info.firstLineAdvice}</Typography>
                  )}
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>Prévention</Typography>
                  <ul>
                    {(info.prevention || []).map((p,i)=>(<li key={i} style={{ color:'#666' }}>{p}</li>))}
                  </ul>
                </Box>
                <Typography sx={{ color: 'gray', fontSize: 12 }}>Quand consulter: {info.whenToSeekCare}</Typography>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>
    </Box>
  );

  const ResourcesTab = ({ resourcesList = [] }) => (
    <Box sx={{ mt: 4, px: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Ressources fiables
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography sx={{ color: 'gray', fontSize: 13 }}>{resourcesList.length} ressources</Typography>
          <TextField size="small" placeholder="Rechercher..." onChange={(e) => setResourcesFilter(e.target.value)} InputProps={{ startAdornment: <SearchIcon /> }} />
        </Box>
      </Box>
      <Typography sx={{ color: 'gray', mb: 2 }}>Liens externes, documents et guides techniques classés par thématique.</Typography>
      <Box className="card-grid">
        {filteredResources.length === 0 ? (
          <Typography sx={{ color: 'gray', textAlign: 'center' }}>Aucune ressource correspondant à la recherche.</Typography>
        ) : (
          filteredResources.map((r, i) => (
            <Box key={r.title} className="resource-card">
              <img src={i % 2 === 0 ? '/assets/premium_photo-1699387204388-120141c76d51.avif' : '/assets/doctor-illustration.svg'} alt="illustration" />
              <Typography sx={{ fontWeight: 700 }}>{r.title}</Typography>
              <Typography sx={{ color: 'gray', fontSize: 13, mb: 1 }}>{r.summary}</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip size="small" icon={<InsertDriveFileIcon />} label="Guide" />
                  <Chip size="small" icon={<ArticleIcon />} label="Article" />
                </Box>
                <a href={r.link} target="_blank" rel="noreferrer"><LinkIcon /></a>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );

  // Articles for infos santé
  const [articles, setArticles] = React.useState([]);
  React.useEffect(() => {
    // load small curated articles list
    import('../data/articles.json')
      .then((m) => setArticles(m.default || m))
      .catch(() => setArticles([]));
  }, []);

  // disease advice
  const [adviceMap, setAdviceMap] = React.useState({});
  React.useEffect(() => {
    import('../data/diseaseAdvice.json')
      .then((m) => setAdviceMap(m.default || m))
      .catch(() => setAdviceMap({}));
  }, []);
  // helper: normalize disease name for matching
  const normalize = (s = '') =>
    String(s)
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();

  // find best advice entry for a disease string by normalization and inclusion
  const findAdviceFor = (diseaseName) => {
    if (!diseaseName) return null;
    const keyDirect = Object.keys(adviceMap).find((k) => k === diseaseName);
    if (keyDirect) return adviceMap[keyDirect];
    const norm = normalize(diseaseName);
    // exact normalized match
    const exact = Object.entries(adviceMap).find(([k]) => normalize(k) === norm);
    if (exact) return exact[1];
    // inclusion: advice key contained in diseaseName or vice versa
    const incl = Object.entries(adviceMap).find(([k]) => {
      const nk = normalize(k);
      return norm.includes(nk) || nk.includes(norm);
    });
    if (incl) return incl[1];
    // fallback: try startsWith
    const starts = Object.entries(adviceMap).find(([k]) => normalize(k).startsWith(norm) || norm.startsWith(normalize(k)));
    if (starts) return starts[1];
    return null;
  };
  // Resources filtering
  const [resourcesFilter, setResourcesFilter] = React.useState('');
  const filteredResources = resourcesList.filter((r) => r.title.toLowerCase().includes(resourcesFilter.toLowerCase()) || r.summary.toLowerCase().includes(resourcesFilter.toLowerCase()));

  const ResultsTab = ({ items = [], loading = false }) => (
    <Box sx={{ mt: 4, px: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
        Mes résultats
      </Typography>
      {loading ? (
        <Typography sx={{ color: 'gray', textAlign: 'center' }}>Chargement de l'historique...</Typography>
      ) : items.length === 0 ? (
        <Typography sx={{ color: 'gray', textAlign: 'center' }}>Aucun résultat pour le moment.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Summary cards */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 180, p: 2, border: '1px solid #efefef', borderRadius: 2 }}>
              <Typography sx={{ fontSize: 12, color: 'gray' }}>Total prédictions</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 20 }}>{stats.total || items.length}</Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: 180, p: 2, border: '1px solid #efefef', borderRadius: 2 }}>
              <Typography sx={{ fontSize: 12, color: 'gray' }}>Nombre de maladies distinctes</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 20 }}>{new Set(items.map((it) => (Array.isArray(it.disease) ? it.disease[0] : it.disease || 'Inconnu'))).size}</Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: 200, p: 2, border: '1px solid #efefef', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: 12, color: 'gray' }}>Dernière prédiction</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{new Date(items[0].createdAt || items[items.length - 1].createdAt || Date.now()).toLocaleString()}</Typography>
              </Box>
              <Box>
                <Tooltip title="Exporter les résultats au format CSV">
                      <IconButton onClick={async () => {
                    try {
                      const res = await axios.get(`${API_BASE}/api/history/export`, { params: { userId }, responseType: 'blob' });
                      const url = window.URL.createObjectURL(new Blob([res.data]));
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', 'history_export.csv');
                      document.body.appendChild(link);
                      link.click();
                      link.parentNode.removeChild(link);
                    } catch (err) { console.error('Export error', err); }
                  }}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>

          {/* Per-item cards */}
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            {items.map((r) => (
              <Box key={r._id || Math.random()} sx={{ border: '1px solid #efefef', p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalHospitalIcon color="primary" />
                  <Typography sx={{ fontWeight: 700 }}>{r.disease || (Array.isArray(r.disease) ? r.disease[0] : 'Inconnu')}</Typography>
                  <Chip label={`Confiance ${Math.round((r.Confidence || r.confidence || 0) * 100)}%`} size="small" sx={{ ml: 1 }} />
                </Box>
                <Typography sx={{ color: 'gray', fontSize: 13 }}>{r.description || ''}</Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>Symptômes saisis</Typography>
                  <Typography sx={{ color: 'gray' }}>{(r.Symptomes || r.symptomes || []).join(', ')}</Typography>
                </Box>
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ color: 'gray', fontSize: 12 }}>{new Date(r.createdAt || r.date || Date.now()).toLocaleString()}</Typography>
                  <Box>
                    <Tooltip title="Supprimer cet élément">
                      <IconButton onClick={async () => {
                        try {
                          await axios.delete(`${API_BASE}/api/history/${r._id}`);
                          fetchHistory();
                        } catch (err) { console.error('Delete error', err); }
                      }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Détails / Source">
                      <IconButton onClick={() => window.alert('Détails: ' + (r.description || ''))}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );

  const ArticlesTab = () => (
    <Box sx={{ mt: 4, px: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
        Infos santé — Articles sélectionnés
      </Typography>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        {articles.length === 0 ? (
          <Typography sx={{ color: 'gray', textAlign: 'center' }}>Aucun article disponible.</Typography>
        ) : (
          articles.map((a) => (
            <Box key={a.id} sx={{ border: '1px solid #efefef', p: 2, borderRadius: 2 }}>
              {a.image && <img src={a.image} alt="thumb" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 6 }} />}
              <Typography sx={{ fontWeight: 700, mt: 1 }}>{a.title}</Typography>
              <Typography sx={{ color: 'gray', fontSize: 13 }}>{a.summary}</Typography>
              <Typography sx={{ color: 'gray', fontSize: 12, mt: 1 }}>{a.author} — {a.date}</Typography>
              <Box sx={{ mt: 1 }}>
                <a href={a.url} target="_blank" rel="noreferrer">Lire la source</a>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );

  const StatisticsTab = ({ stats = { total: 0, topDiseases: [] }, loading = false }) => (
    <Box sx={{ mt: 4, px: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
        Statistiques personnelles
      </Typography>
      {loading ? (
        <Typography sx={{ color: 'gray', textAlign: 'center' }}>Chargement...</Typography>
      ) : (
        <Box sx={{ maxWidth: 980, mx: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ fontWeight: 600 }}>Total de prédictions : {stats.total}</Typography>
            <Button variant="outlined" size="small" onClick={() => fetchHistory()}>
              Rafraîchir
            </Button>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>Top maladies détectées</Typography>
              {stats.topDiseases.length === 0 ? (
                <Typography sx={{ color: 'gray' }}>Aucune donnée disponible.</Typography>
              ) : (
                <AdvancedCharts topDiseases={stats.topDiseases} history={resultsList} />
              )}
          </Box>
        </Box>
      )}
    </Box>
  );
  const [contactForm, setContactForm] = React.useState({ name: '', email: '', message: '' });
  const [contactLoading, setContactLoading] = React.useState(false);
  const [contactSnackbar, setContactSnackbar] = React.useState({ open: false, message: '' });

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm((s) => ({ ...s, [name]: value }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactLoading(true);
    axios
      .post(`${API_BASE}/api/contact`, {
        name: contactForm.name,
        email: contactForm.email,
        message: contactForm.message,
        userId,
      })
      .then(() => {
        setContactSnackbar({ open: true, message: 'Message envoyé — nous vous répondrons bientôt.' });
        setContactForm({ name: '', email: '', message: '' });
      })
      .catch((err) => {
        console.error('Contact error', err);
        setContactSnackbar({ open: true, message: 'Erreur envoi message — veuillez réessayer.' });
      })
      .finally(() => setContactLoading(false));
  };

  const ContactTab = () => (
    <Box sx={{ mt: 4, px: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
        Contact / Assistance
      </Typography>
      <Typography sx={{ color: 'gray', mb: 2, textAlign: 'center' }}>
        Envoyez-nous un message pour signaler un problème ou demander de l'aide.
      </Typography>
      <Box
        component="form"
        onSubmit={handleContactSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <TextField name="name" label="Nom" value={contactForm.name} onChange={handleContactChange} />
        <TextField name="email" label="Email" value={contactForm.email} onChange={handleContactChange} />
        <TextField
          name="message"
          label="Message"
          value={contactForm.message}
          onChange={handleContactChange}
          multiline
          rows={4}
        />
        <Button type="submit" variant="contained" disabled={contactLoading}>
          Envoyer
        </Button>
      </Box>
      {contactSnackbar.open && (
        <Box sx={{ mt: 2, color: 'green' }}>{contactSnackbar.message}</Box>
      )}
    </Box>
  );

  const AccountTab = () => (
    <Box sx={{ mt: 4, px: 4, textAlign: 'center' }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        Mon espace
      </Typography>
      <Typography sx={{ color: 'gray', mb: 2 }}>
        Espace personnel de {userName} : informations de profil, paramètres, préférences,
        langue, etc.
      </Typography>
      <Button variant="outlined" onClick={() => setActiveTab('profile')}>
        Éditer mon profil
      </Button>
    </Box>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'predict':
        return <Predict userId={userId} userName={userName} />;
        case 'results':
          return <ResultsTab items={resultsList} loading={resultsLoading} />;
      case 'infos':
        return <ArticlesTab />;
      case 'advice':
        return <AdviceTab />;
      case 'resources':
        return <ResourcesTab resourcesList={resourcesList} />;
      case 'statistics':
        return <StatisticsTab stats={stats} loading={resultsLoading} />;
      case 'contact':
        return <ContactTab />;
      case 'account':
        return <AccountTab />;
      case 'profile':
        return <Profile onSaved={(p) => { if (p && p.name) setUserName(p.name); }} />;
      default:
        return <Predict userId={userId} userName={userName} />;
    }
  };

  return (
    <Box>
      <Header title="HealthyAI" onMenu={toggleDrawer} userName={userName} onLogout={onLogout} />
      <TabsPanel tabs={tabs} value={activeTab} onChange={(_e, v) => setActiveTab(v)} />

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260 }} role="presentation" onClick={() => setDrawerOpen(false)}>
          <List>
            <ListItem>
              <ListItemText primary={`Bonjour ${userName || 'utilisateur'}`} />
            </ListItem>
            <Divider />
            {tabs.map((t) => (
              <ListItem key={t.value} disablePadding>
                <ListItemButton onClick={() => goToTab(t.value)}>
                  <ListItemText primary={t.label} secondary={t.tooltip} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box sx={{ mt: 2 }}>{renderContent()}</Box>
    </Box>
  );
}
