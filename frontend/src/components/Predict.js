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
import diseaseAdviceData from '../data/diseaseAdvice.json';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const API_BASE = 'http://localhost:8080';

//size
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
// style
import '../styles/Predict.css';
//component
import CardDisease from './CardDisease';
//data
import symptoms from '../data/Symtoms.json';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function Predict({ userId: propUserId, userName: propUserName }) {
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

  // states
  const [loading, setLoading] = React.useState(false);
  const [Showcard, setShowCard] = React.useState(false);
  const [gifAvailable, setGifAvailable] = React.useState(true);
  const [selectedOptions, setSelectedOptions] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [userName, setUserName] = React.useState(propUserName || '');
  const [userId, setUserId] = React.useState(propUserId || '');
  const [cardContent, setCardContent] = React.useState({});
  const [mockUsed, setMockUsed] = React.useState(false);

  React.useEffect(() => {
    if (!propUserId) setUserId(localStorage.getItem('userId'));
    if (!propUserName) setUserName(localStorage.getItem('userName'));
  }, [propUserId, propUserName]);

  const handleClick = async () => {
    setLoading(true);
    try {
      const symptomes = selectedOptions.map((item) => item.title);
      let result = null;
      try {
        const response = await axios.post(`${API_BASE}/api/predict/forward`, {
          symptomes: symptomes,
          userId: userId,
        });
        result = response.data;
        setCardContent(result);
        setMockUsed(false);
        // Try to persist the prediction to backend history so "Mes résultats" increments
        try {
          const saveBody = {
            disease: result.disease,
            description: result.description,
            precautions: result.precautions,
            symptomes: symptomes,
            confidence: result.confidence,
            userId: userId,
          };
          const saved = await axios.post(`${API_BASE}/api/predict/save`, saveBody);
          // replace result with authoritative saved doc when available
          if (saved && saved.data) {
            result = saved.data;
            setCardContent(saved.data);
          }
        } catch (saveErr) {
          console.warn('Could not save prediction to server:', saveErr && saveErr.toString ? saveErr.toString() : saveErr);
        }
      } catch (netErr) {
        console.warn('Prediction network call failed, using frontend mock:', netErr && netErr.toString ? netErr.toString() : netErr);
        // Build deterministic mock from local diseaseAdviceData
        try {
          const keys = Object.keys(diseaseAdviceData || {});
          let disease = 'Unknown';
          let description = '';
          let precautions = [];
          if (keys.length > 0) {
            const index = symptomes.reduce((acc, s) => acc + (s ? s.length : 0), 0) % keys.length;
            disease = keys[index];
            const info = diseaseAdviceData[disease] || {};
            description = info.fullDescription || info.overview || '';
            precautions = info.practicalTips || info.prevention || [];
          }
          const confidence = Math.min(0.95, 0.6 + Math.min(symptomes.length, 4) * 0.1);
          const mockResp = { disease, confidence, description, precautions, _mock: true };
          result = mockResp;
          setCardContent(mockResp);
          setMockUsed(true);
        } catch (e) {
          console.error('Failed to build frontend mock:', e);
          throw netErr; // rethrow to be caught by outer catch
        }
      }

      // slight delay for UX
      setTimeout(() => {
        setLoading(false);
        setShowCard(true);
        // notify app that a new prediction was created so history/advice can refresh
        try {
          const evt = new CustomEvent('prediction:created', { detail: result || cardContent });
          window.dispatchEvent(evt);
        } catch (err) {
          console.warn('Could not dispatch prediction event', err);
        }
      }, 700);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleAroundClick = () => {
    if (Showcard) setShowCard(false);
  };

  const handleChange = (_event, value) => {
    if (value.length === 6) setOpen(true);
    setSelectedOptions(value);
  };

  const handleClose = (_event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  const action = (
    <React.Fragment>
      <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  const mockBanner = (
    <Snackbar
      open={mockUsed}
      autoHideDuration={8000}
      onClose={() => setMockUsed(false)}
      message="Résultat simulé (mode hors-ligne) — les prédictions réelles nécessitent une connexion au serveur"
      action={
        <IconButton size="small" aria-label="close" color="inherit" onClick={() => setMockUsed(false)}>
          <CloseIcon fontSize="small" />
        </IconButton>
      }
    />
  );

  return (
    <>
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

      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          visibility: loading ? 'visible' : 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {gifAvailable ? (
          <img
            src="/assets/heart.svg"
            alt="loading-heart"
            style={{ height: 170, width: 170, objectFit: 'contain' }}
            onError={(e) => {
              // if svg fails, fallback to Lottie
              if (e && e.target) e.target.style.display = 'none';
              setGifAvailable(false);
            }}
          />
        ) : (
          <Player autoplay loop src={animationData} style={{ height: '170px', width: '600px' }} />
        )}
      </div>

      {/* Decorative animated GIFs floating in the background for beauty */}
      <div className="iconns-container">
        <img className="iconn heartPulse decorative-gif" src="/assets/anim-heart.svg" alt="heart" onError={(e) => (e.target.style.display = 'none')} />
        <img className="iconn heartPulse decorative-gif" src="/assets/doctor.svg" alt="heart" onError={(e) => (e.target.style.display = 'none')} />
        <img className="iconn brain decorative-gif" src="/assets/anim-brain.svg" alt="brain" onError={(e) => (e.target.style.display = 'none')} />
        <img className="iconn stethoscope decorative-gif" src="/assets/anim-stethoscope.svg" alt="stethoscope" onError={(e) => (e.target.style.display = 'none')} />
        <img className="iconn pill decorative-gif" src="/assets/anim-pill.svg" alt="pill" onError={(e) => (e.target.style.display = 'none')} />
        <img className="iconn heartPulse decorative-gif" src="/assets/doctor.svg" alt="heart" onError={(e) => (e.target.style.display = 'none')} />
        <img className="iconn ambulance decorative-gif" src="/assets/anim-ambulance.svg" alt="ambulance" onError={(e) => (e.target.style.display = 'none')} />
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
        <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={handleClose}
          message="Do not exceed 6 symptoms!"
          action={action}
        />
        {mockBanner}

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
            Bienvenue sur votre plateforme santé{userName ? `, ${userName}` : ''}!
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
          <img
            src="/assets/doctor.png"
            alt="IA médecin"
            style={{ maxWidth: 220 }}
            onError={(e) => {
              // fallback to existing svg if doctor.svg not found
              if (e && e.target) e.target.src = '/assets/doctor-illustration.svg';
            }}
          />

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
      </div>
    </>
  );
}
