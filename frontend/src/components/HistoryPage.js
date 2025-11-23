import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

import { LayoutList, LayoutGrid, Stethoscope, Search, Filter } from 'lucide-react';

import { useState, useRef, useReducer, useEffect } from 'react';
import axios from 'axios';
const API_BASE = 'http://localhost:8080';

import { historyData } from '../contexts/historyDataContext';

import '../styles/history.css';

import CardHistory from './CardHistory';
import PaginationComp from './PaginationComp';

import { reducerHistory } from '../reducers/reducerHistory';

const options = ['descending sort', 'ascending sort'];

let dataHistory = [];
export default function HistoryPage() {
  console.log('rendering');

  const [mydata, setm] = useState([]);
  const [data, dispatchHistory] = useReducer(reducerHistory, mydata);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE}/api/history?userId=${localStorage.getItem('userId')}`
        );
        setm(response.data); // Met à jour mydata
        dispatchHistory({ type: 'SET_DATA', payload: response.data }); // Met à jour l'état de data avec les nouvelles données
        setLoading(true);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const [btnActive, setActive] = useState('list');
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  /* ============================== 
      Control de pagination
      ============================== */
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [currentPage, setCurrentPage] = useState(1); // Page active
  const itemsPerPage = 3; // Nombre d'éléments par page
  const [layout, setLayout] = useState('list');
  // Calcul des éléments à afficher pour la page active
  const startIndex = (currentPage - 1) * itemsPerPage;
  console.log('Start');
  let currentData = data.length > 0 ? data.slice(startIndex, startIndex + itemsPerPage) : [];
  console.log('curr', currentData);

  /* ============================== 
       Handling events
      ============================== */
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  const handleClick = () => {
    console.info(`You clicked ${options[selectedIndex]}`);
  };

  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    setOpen(false);
    //hna andiro sortings;
    if (options[selectedIndex] === 'descending sort') {
      dispatchHistory({
        type: 'descending',
        payload: {
          data: data,
        },
      });
    }
    if (options[selectedIndex] === 'ascending sort') {
      dispatchHistory({
        type: 'ascending',
        payload: {
          data: data,
        },
      });
    }
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
    console.log(data);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const handleChangeButton = (event, newAlignment) => {
    console.log(newAlignment);
    if (newAlignment !== null) {
      setActive(newAlignment);
    }
    if (layout === 'grid') {
      setLayout('list');
    } else {
      setLayout('grid');
    }
  };
  return (
    <historyData.Provider
      value={{
        data: data,
        currentData: currentData,
      }}
    >
      <div className="history" style={{ width: '95%', height: '95%' }}>
        <Container maxWidth="xl">
          <Grid container spacing={8} className="main-root">
            <Grid
              item
              xs={12}
              className="nav-bar"
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' }, // Colonne pour mobile, ligne pour écrans plus larges
                alignItems: 'center',
                justifyContent: { xs: 'space-between', sm: 'center' },
                gap: 2,
              }}
            >
              <div className="head">
                <Stethoscope className="icon" />
                <div className="title">
                  <h3>Historique de predictions réalisé</h3>
                  <p>Visualisez les résultats de vos prédictions</p>
                </div>
              </div>
              <ToggleButtonGroup
                value={btnActive}
                exclusive
                onChange={handleChangeButton}
                aria-label="text alignment"
                className="control"
              >
                <ToggleButton
                  value="list"
                  aria-label="left aligned"
                  style={{ borderRadius: '12px' }}
                >
                  <LayoutList style={{ height: '19px', width: '19px', fontWeight: '300' }} />
                </ToggleButton>
                <ToggleButton value="grid" aria-label="centered" style={{ borderRadius: '12px' }}>
                  <LayoutGrid style={{ height: '22px', width: '22px', fontWeight: '300' }} />
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={12}>
              <div className="content">
                <div className="menu">
                  <div className="search">
                    <Search
                      style={{ height: '20px', width: '20px', color: 'hsl(215.4 16.3% 46.9%)' }}
                    />
                    <TextField
                      id="outlined-basic"
                      label="Search predictions.."
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '40px',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'hsl(215.4 16.3% 46.9%)',
                        },
                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'hsl(215.4 16.3% 46.9%)',
                        },
                      }}
                      onChange={(event) => {
                        dispatchHistory({
                          type: 'search',
                          payload: {
                            keyword: event.target.value,
                            data: data,
                            originalData: mydata,
                          },
                        });
                      }}
                    />
                  </div>
                  <ButtonGroup
                    variant="contained"
                    ref={anchorRef}
                    aria-label="Button group with a nested menu"
                    sx={{ backgroundColor: 'transparent' }}
                  >
                    <Button onClick={handleClick}>
                      <Filter style={{ marginRight: '4px' }} />
                      {options[selectedIndex]}
                    </Button>
                    <Button
                      size="small"
                      aria-controls={open ? 'split-button-menu' : undefined}
                      aria-expanded={open ? 'true' : undefined}
                      aria-label="descending sort"
                      aria-haspopup="menu"
                      onClick={handleToggle}
                    >
                      <ArrowDropDownIcon />
                    </Button>
                  </ButtonGroup>
                  <Popper
                    sx={{ zIndex: 1 }}
                    open={open}
                    anchorEl={anchorRef.current}
                    role={undefined}
                    transition
                    disablePortal
                  >
                    {({ TransitionProps, placement }) => (
                      <Grow
                        {...TransitionProps}
                        style={{
                          transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                        }}
                      >
                        <Paper>
                          <ClickAwayListener onClickAway={handleClose}>
                            <MenuList id="split-button-menu" autoFocusItem>
                              {options.map((option, index) => (
                                <MenuItem
                                  key={option}
                                  disabled={index === 2}
                                  selected={index === selectedIndex}
                                  onClick={(event) => handleMenuItemClick(event, index)}
                                >
                                  {option}
                                </MenuItem>
                              ))}
                            </MenuList>
                          </ClickAwayListener>
                        </Paper>
                      </Grow>
                    )}
                  </Popper>
                </div>
                {/* table here */}
                <CardHistory layout={layout} />
              </div>
            </Grid>
          </Grid>
        </Container>
        <PaginationComp
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handlePageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </historyData.Provider>
  );
}
