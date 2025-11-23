import * as React from 'react';
// elements
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Typography, Box } from '@mui/material';
import Button from '@mui/material/Button';
import { Player } from '@lottiefiles/react-lottie-player';
import animationData from '../AnimationHeart.json';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

//size
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
// icons (pas encore utilisés mais on peut s'en servir plus tard)
// icons (pas encore utilisés)
// style
import '../styles/Predict.css';
//component
import CardDisease from './CardDisease';
import TabsPanel from './ui/TabsPanel';
import Header from './ui/Header';
//data
import symptoms from '../data/Symtoms.json';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function Predict() {
  const navigate = useNavigate();

  // gestion responsive
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.up('sm') && theme.breakpoints.down('md'));
  const isMd = useMediaQuery(theme.breakpoints.up('md') && theme.breakpoints.down('lg'));
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));

  const cardWidth = React.useMemo(() => {
    if (isXs || isSm) return '90%';
    if (isMd) return '67%';
    if (isLg) return '40%';
    return '50%';
  }, [isXs, isSm, isMd, isLg]);

  const CardDiseaseWidth = React.useMemo(() => {
    if (isXs || isSm) return '90%';
    if (isMd) return '70%';
    if (isLg) return '50%';
    return '50%';
  }, [isXs, isSm, isMd, isLg]);

  // --- Nouvel état pour les onglets ---
  const [activeTab, setActiveTab] = React.useState('predict');

  const handleTabChange = (_event, newValue) => {
    setActiveTab(newValue);
  };

  const tabs = [
    { label: 'Prédiction', value: 'predict' },
    { label: 'Mes résultats', value: 'results' },
    { label: 'Infos santé', value: 'infos' },
    { label: 'Conseils', value: 'advice' },
    { label: 'Ressources', value: 'resources' },
    { label: 'Statistiques', value: 'statistics' },
    { label: 'Contact', value: 'contact' },
    { label: 'Mon espace', value: 'account' },
    { label: 'Admin', value: 'admin' },
  ];

  // states
  const [loading, setLoading] = React.useState(false);
  const [Showcard, setShowCard] = React.useState(false);
  const [selectedOptions, setSelectedOptions] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [userName, setUserName] = React.useState('Unknown');
  const [userId, setUserId] = React.useState();
  const [cardContent, setCardContent] = React.useState({});
  // Nouveaux états pour les onglets enrichis
  const [resultsList, setResultsList] = React.useState([]);
  const [resultsLoading, setResultsLoading] = React.useState(false);
  const [resourcesList, setResourcesList] = React.useState([]);
  const [stats, setStats] = React.useState({ total: 0, topDiseases: [] });
  const [contactForm, setContactForm] = React.useState({ name: '', email: '', message: '' });
  const [contactLoading, setContactLoading] = React.useState(false);
  const [contactSnackbar, setContactSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'info',
  });

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token') || localStorage.getItem('token');
    const userId = urlParams.get('userId') || localStorage.getItem('userId');
    const userName = urlParams.get('userName') || localStorage.getItem('userName');

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', userName);
    } else {
      navigate('/login'); // Si le token n'existe pas, rediriger vers la page de connexion
    }
  }, [navigate]);

  React.useEffect(() => {
    setUserId(localStorage.getItem('userId'));
    setUserName(localStorage.getItem('userName'));
  }, []);

  // Préparer une liste de ressources basées sur les symptômes (locale)
  React.useEffect(() => {
    const res = symptoms.slice(0, 40).map((s) => ({
      title: s.title,
      link: `https://www.who.int/search?q=${encodeURIComponent(s.title)}`,
      summary: `Informations et conseils généraux sur ${s.title}`,
    }));
    setResourcesList(res);
  }, []);

  // Récupérer l'historique de l'utilisateur depuis le backend
  const fetchHistory = React.useCallback(async () => {
    if (!userId) return;
    setResultsLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/api/history', {
        params: { userId },
      });
      setResultsList(res.data || []);
      // calcul statistique simple
      const total = (res.data || []).length;
      const counts = {};
      (res.data || []).forEach((r) => {
        const d = r.disease || (r.disease && r.disease[0]) || 'Inconnu';
        counts[d] = (counts[d] || 0) + 1;
      });
      const topDiseases = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([d, c]) => ({ disease: d, count: c }));
      setStats({ total, topDiseases });
    } catch (e) {
      console.error('Erreur fetchHistory', e);
    } finally {
      setResultsLoading(false);
    }
  }, [userId]);

  // Charger l'historique lorsque l'onglet correspondant est activé
  React.useEffect(() => {
    if (activeTab === 'results' || activeTab === 'statistics') {
      fetchHistory();
    }
  }, [activeTab, fetchHistory]);

  // handlers
  const handleClick = async () => {
    setLoading(true);
    try {
      const symptomes = selectedOptions.map((item) => item.title);
      const response = await axios.post('http://localhost:8080/api/predict', {
        symptomes: symptomes,
        userId: userId,
      });
      console.log(response.data);
      setCardContent(response.data);

      // Attendre 3 secondes avant de désactiver le loading et d'afficher la carte
      setTimeout(() => {
        setLoading(false);
        setShowCard(true);
      }, 3000); // 3000 millisecondes = 3 secondes
    } catch (e) {
      console.error(e);
      setLoading(false); // Désactiver le loading en cas d'erreur
    }
  };

  const handleAroundClick = () => {
    if (Showcard) {
      setShowCard(false);
    }
  };

  const handleChange = (event, value, reason) => {
    if (value.length === 6) {
      console.log('Triggering Snackbar');
      setOpen(true);
    }
    setSelectedOptions(value);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const action = (
    <React.Fragment>
      <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  // Contact form handlers
  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm((s) => ({ ...s, [name]: value }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Poster le formulaire vers le backend
    setContactLoading(true);
    axios
      .post('http://localhost:8080/api/contact', {
        name: contactForm.name,
        email: contactForm.email,
        message: contactForm.message,
        userId,
      })
      .then((res) => {
        setContactSnackbar({
          open: true,
          message: 'Message envoyé — nous vous répondrons bientôt.',
          severity: 'success',
        });
        setContactForm({ name: '', email: '', message: '' });
      })
      .catch((err) => {
        console.error('Contact error', err);
        setContactSnackbar({
          open: true,
          message: 'Erreur envoi message — veuillez réessayer plus tard.',
          severity: 'error',
        });
      })
      .finally(() => setContactLoading(false));
  };

  const handleContactSnackbarClose = () => {
    setContactSnackbar((s) => ({ ...s, open: false }));
  };

  return (
    <>
      {/* CardDisease */}
      <CardDisease
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          visibility: Showcard ? 'visible' : 'hidden',
          width: CardDiseaseWidth,
        }}
        cardContent={cardContent}
      />

      {/* Loading */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          visibility: loading ? 'visible' : 'hidden',
        }}
      >
        <Player autoplay loop src={animationData} style={{ height: '170px', width: '600px' }} />
      </div>

      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: isXs ? '5%' : '10%',
          position: 'relative',
          opacity: loading || Showcard ? 0.1 : 1,
        }}
        onClick={handleAroundClick}
      >
        {/* Snackbar */}
        <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={handleClose}
          message="Do not exceed 6 symptoms!"
          action={action}
        />
        <Snackbar
          open={contactSnackbar.open}
          autoHideDuration={6000}
          onClose={handleContactSnackbarClose}
          message={contactSnackbar.message}
        />

        {/* Header et Barre d’onglets */}
        <Header title="HealthyAI" />
        <TabsPanel tabs={tabs} value={activeTab} onChange={handleTabChange} />

        {/* 🔹 Contenu selon l’onglet actif */}
        {/* Onglet Prédiction : ton interface actuelle */}
        {activeTab === 'predict' && (
          <>
            {/* accueil */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0 20px',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  textAlign: 'center',
                  margin: '0',
                  fontWeight: '700',
                  color: '#0e992e',
                  zIndex: '2',
                  position: 'relative',
                }}
              >
                Bienvenue sur votre plateforme santé, {userName}!
              </Typography>
              <Typography
                sx={{
                  textAlign: 'center',
                  margin: '0',
                  fontSize: '14px',
                  color: 'gray',
                  zIndex: '2',
                  position: 'relative',
                }}
              >
                <h3>
                  Votre allié santé, propulsé par l&apos;IA.
                  <br />
                  <br />
                  HealthyAI est une plateforme qui utilise l’intelligence artificielle pour{' '}
                  <i>
                    prédire les risques de maladies, donner des conseils personnalisés et
                    recommander des actions concrètes adaptées à votre quotidien
                  </i>
                  . <br />
                  Obtenez des analyses rapides et des préventions ciblées, à portée de clic.
                  <br />
                  <br />
                  ⚠️ Rappel important : HealthyAI est un outil d’IA à visée préventive et
                  prédictive.
                  <br />
                  Il ne remplace pas un diagnostic médical ni une consultation professionnelle. Les
                  résultats sont probabilistes et limités.
                  <br />
                  En cas de symptômes graves ou de doute, consultez toujours un médecin.
                  <br />
                  <br />
                  HealthyAI – SN : Prédiction intelligente, santé accessible.
                </h3>
              </Typography>
            </div>

            <div
              style={{
                display: 'flex',
                position: 'relative',
                gap: '10%',
                justifyContent: 'center',
                zIndex: '2',
                alignItems: 'center',
              }}
            >
              {/* image */}
              <img
                src="/assets/doctor-illustration.svg"
                alt="IA médecin"
                style={{ maxWidth: 220 }}
              />

              {/* input */}
              <div className="CenterDiv" style={{ width: cardWidth }}>
                <Typography sx={{ textAlign: 'start', fontWeight: '600' }}>
                  Sélectionnez les symptômes que vous ressentez et nous vous prédisons la maladie
                  probable
                </Typography>
                <Autocomplete
                  multiple
                  id="checkboxes-tags-demo"
                  options={symptoms}
                  disableCloseOnSelect
                  getOptionLabel={(option) => option.title}
                  value={selectedOptions}
                  onChange={handleChange}
                  renderOption={(props, option, { selected }) => {
                    const { key, ...optionProps } = props;
                    const isDisabled = selectedOptions.length >= 6 && !selected;
                    return (
                      <li
                        key={key}
                        {...optionProps}
                        style={{
                          opacity: isDisabled ? 0.5 : 1,
                          pointerEvents: isDisabled ? 'none' : 'auto',
                        }}
                      >
                        <Checkbox
                          icon={icon}
                          checkedIcon={checkedIcon}
                          style={{ marginRight: 8 }}
                          disabled={isDisabled}
                          checked={selected}
                        />
                        {option.title}
                      </li>
                    );
                  }}
                  style={{ width: '90%' }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Symptoms"
                      sx={{
                        zIndex: 2,
                        borderRadius: '12px',
                        borderColor: 'black !important',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderRadius: '12px',
                            borderColor: '#3949ab',
                          },
                          '&.Mui-focused fieldset': {
                            borderRadius: '12px',
                          },
                        },
                      }}
                    />
                  )}
                />
                <Button
                  disabled={selectedOptions.length <= 2}
                  onClick={handleClick}
                  variant="contained"
                  sx={{
                    width: {
                      xs: '90%',
                      sm: '90%',
                      md: '60%',
                      lg: '50%',
                      xl: '30%',
                    },
                    background: 'linear-gradient(to right, #12b82b, #0e992e)',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    color: '#fff',
                    transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 0 15px rgba(14, 153, 46, 0.6)',
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  Prédire
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Onglet Mes résultats */}
        {activeTab === 'results' && (
          <Box sx={{ mt: 4, px: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
              Mes résultats
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  if (!resultsLoading) fetchHistory();
                }}
              >
                Rafraîchir
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  // client-side CSV export if resultsList present
                  if (!resultsList || resultsList.length === 0) return;
                  const rows = resultsList.map((r) => ({
                    id: r._id,
                    disease: r.disease,
                    description: r.description,
                    Symptomes: Array.isArray(r.Symptomes)
                      ? r.Symptomes.join(';')
                      : r.Symptomes || '',
                    Confidence: r.Confidence || r.confidence || '',
                    date: r.createdAt || r.date || '',
                  }));
                  const header = Object.keys(rows[0]);
                  const csv = [header.join(',')]
                    .concat(
                      rows.map((row) =>
                        header
                          .map((h) => `"${(row[h] || '').toString().replace(/"/g, '""')}"`)
                          .join(',')
                      )
                    )
                    .join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'history_export.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Exporter CSV
              </Button>
            </Box>
            {resultsLoading ? (
              <Typography sx={{ color: 'gray', textAlign: 'center' }}>
                Chargement de l'historique...
              </Typography>
            ) : resultsList.length === 0 ? (
              <Typography sx={{ color: 'gray', textAlign: 'center' }}>
                Aucun résultat pour le moment. Lancez une prédiction pour commencer.
              </Typography>
            ) : (
              <Box
                sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}
              >
                {resultsList.map((r) => (
                  <Box
                    key={r._id || Math.random()}
                    sx={{ border: '1px solid #efefef', p: 2, borderRadius: 2 }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>
                      {r.disease || r.disease?.[0] || 'Inconnu'}
                    </Typography>
                    <Typography sx={{ color: 'gray', fontSize: 13 }}>
                      {r.description || ''}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography sx={{ fontWeight: 600 }}>Symptômes saisis</Typography>
                      <Typography sx={{ color: 'gray' }}>
                        {(r.Symptomes || r.symptomes || []).join(', ')}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        mt: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography sx={{ color: 'gray', fontSize: 12 }}>
                        Confiance: {r.Confidence || r.confidence || 'N/A'}
                      </Typography>
                      <Typography sx={{ color: 'gray', fontSize: 12 }}>
                        {new Date(r.createdAt || r.date || Date.now()).toLocaleString()}
                      </Typography>
                    </Box>
                    {r.precautions && (
                      <Box sx={{ mt: 1 }}>
                        <Typography sx={{ fontWeight: 600 }}>Précautions</Typography>
                        <ul>
                          {(Array.isArray(r.precautions) ? r.precautions : [r.precautions]).map(
                            (p, i) => (
                              <li key={i}>
                                <Typography sx={{ color: 'gray', fontSize: 13 }}>{p}</Typography>
                              </li>
                            )
                          )}
                        </ul>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={async () => {
                          if (!r._id) return;
                          try {
                            await axios.delete(`http://localhost:8080/api/history/${r._id}`);
                            fetchHistory();
                          } catch (err) {
                            console.error('delete error', err);
                          }
                        }}
                      >
                        Supprimer
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Onglet Infos santé */}
        {activeTab === 'infos' && (
          <Box sx={{ mt: 4, px: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Infos santé
            </Typography>
            <Typography sx={{ color: 'gray', mb: 2 }}>
              Section dédiée à l&apos;éducation sanitaire : conseils de prévention, hygiène de vie,
              rappels sur l&apos;importance de consulter un professionnel de santé, etc.
            </Typography>
            {/* On ajoutera plus tard du contenu dynamique, des articles, des liens fiables, etc. */}
          </Box>
        )}

        {/* Onglet Mon espace */}
        {activeTab === 'account' && (
          <Box sx={{ mt: 4, px: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Mon espace
            </Typography>
            <Typography sx={{ color: 'gray', mb: 2 }}>
              Espace personnel de {userName} : informations de profil, paramètres, préférences,
              langue, etc.
            </Typography>
            {/* Plus tard : formulaire de profil, changement de mot de passe, etc. */}
          </Box>
        )}

        {/* Onglet Conseils */}
        {activeTab === 'advice' && (
          <Box sx={{ mt: 4, px: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
              Conseils personnalisés
            </Typography>
            <Typography sx={{ color: 'gray', mb: 2, textAlign: 'center' }}>
              Basés sur vos symptômes sélectionnés, voici des recommandations générales.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
              {selectedOptions.length === 0 ? (
                <Typography sx={{ color: 'gray' }}>
                  Sélectionnez des symptômes dans l'onglet Prédiction pour voir des conseils
                  personnalisés.
                </Typography>
              ) : (
                selectedOptions.slice(0, 6).map((s) => (
                  <Box
                    key={s.title}
                    sx={{ width: '90%', border: '1px solid #eee', p: 2, borderRadius: 2 }}
                  >
                    <Typography sx={{ fontWeight: 600 }}>{s.title}</Typography>
                    <Typography sx={{ color: 'gray', fontSize: 13 }}>
                      Conseil général: Si vous ressentez {s.title}, surveillez l'évolution et
                      consultez un professionnel en cas d'aggravation.
                    </Typography>
                    <Button
                      sx={{ mt: 1 }}
                      href={`https://www.who.int/search?q=${encodeURIComponent(s.title)}`}
                      target="_blank"
                    >
                      En savoir plus
                    </Button>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        )}

        {/* Onglet Ressources */}
        {activeTab === 'resources' && (
          <Box sx={{ mt: 4, px: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
              Ressources fiables
            </Typography>
            <Typography sx={{ color: 'gray', mb: 2, textAlign: 'center' }}>
              Liens externes et courts résumés pour approfondir.
            </Typography>
            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}
            >
              {resourcesList.map((r) => (
                <Box key={r.title} sx={{ border: '1px solid #efefef', p: 2, borderRadius: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>{r.title}</Typography>
                  <Typography sx={{ color: 'gray', fontSize: 13 }}>{r.summary}</Typography>
                  <a href={r.link} target="_blank" rel="noreferrer">
                    Voir la ressource
                  </a>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Onglet Statistiques */}
        {activeTab === 'statistics' && (
          <Box sx={{ mt: 4, px: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
              Statistiques personnelles
            </Typography>
            {resultsLoading ? (
              <Typography sx={{ color: 'gray', textAlign: 'center' }}>
                Chargement des statistiques...
              </Typography>
            ) : (
              <Box sx={{ maxWidth: 900, mx: 'auto' }}>
                <Typography sx={{ fontWeight: 600 }}>
                  Total de prédictions : {stats.total}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ fontWeight: 600 }}>Top maladies détectées</Typography>
                  {stats.topDiseases.length === 0 ? (
                    <Typography sx={{ color: 'gray' }}>Aucune donnée disponible.</Typography>
                  ) : (
                    stats.topDiseases.map((t) => (
                      <Box
                        key={t.disease}
                        sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}
                      >
                        <Typography>{t.disease}</Typography>
                        <Typography sx={{ color: 'gray' }}>{t.count}</Typography>
                      </Box>
                    ))
                  )}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Onglet Contact */}
        {activeTab === 'contact' && (
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
              <TextField
                name="name"
                label="Nom"
                value={contactForm.name}
                onChange={handleContactChange}
              />
              <TextField
                name="email"
                label="Email"
                value={contactForm.email}
                onChange={handleContactChange}
              />
              <TextField
                name="message"
                label="Message"
                value={contactForm.message}
                onChange={handleContactChange}
                multiline
                rows={4}
              />
              <Button type="submit" variant="contained">
                Envoyer
              </Button>
            </Box>
          </Box>
        )}

        {/* Onglet Admin */}
        {activeTab === 'admin' && (
          <Box sx={{ mt: 4, px: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Administration
            </Typography>
            <Typography sx={{ color: 'gray', mb: 2 }}>
              Actions réservées aux administrateurs : gestion des utilisateurs, revues, etc.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => window.open('http://localhost:8080/admin', '_blank')}
            >
              Ouvrir panneau admin
            </Button>
          </Box>
        )}
      </div>
    </>
  );
}
