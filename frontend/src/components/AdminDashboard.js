import React, { useEffect, useState } from 'react';
import axios from 'axios';
const API_BASE = 'http://localhost:8080';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Modal,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  AppBar,
  Toolbar,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import diseaseAdviceData from '../data/diseaseAdvice.json';
import { Add, Edit, Delete, Dashboard, People, BarChart, Logout } from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart as BarChartGraph,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';

const COLORS = ['#1976d2', '#e91e63', '#00C49F', '#FFBB28', '#FF8042', '#A020F0', '#FF6384'];

const styleModal = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'user', password: '' });
  const [activeView, setActiveView] = useState('dashboard'); // État pour gérer la vue active
  const [selectedUser, setSelectedUser] = useState(null); // Utilisateur sélectionné pour afficher ses prédictions
  const [diseaseAdvice, setDiseaseAdvice] = useState({});
  const [openDiseaseModal, setOpenDiseaseModal] = useState(false);
  const [editDiseaseKey, setEditDiseaseKey] = useState(null);
  const [diseaseForm, setDiseaseForm] = useState({ overview: '', typicalSymptoms: [], prevention: [], whenToSeekCare: '', firstLineAdvice: '', fullDescription: '', practicalTips: [] });

  useEffect(() => {
    fetchAdminData();
    loadDiseaseAdvice();
  }, []);

  const loadDiseaseAdvice = () => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get(`${API_BASE}/admin/diseaseAdvice`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          if (res.data && Object.keys(res.data).length > 0) {
            setDiseaseAdvice(res.data);
            localStorage.setItem('diseaseAdvice', JSON.stringify(res.data));
            return;
          }
          // fallback to local or bundled
          const local = localStorage.getItem('diseaseAdvice');
          if (local) setDiseaseAdvice(JSON.parse(local));
          else setDiseaseAdvice(diseaseAdviceData || {});
        })
        .catch((err) => {
          console.warn('Server diseaseAdvice not available:', err.message || err);
          const local = localStorage.getItem('diseaseAdvice');
          if (local) setDiseaseAdvice(JSON.parse(local));
          else setDiseaseAdvice(diseaseAdviceData || {});
        });
      return;
    }
    try {
      const local = localStorage.getItem('diseaseAdvice');
      if (local) {
        setDiseaseAdvice(JSON.parse(local));
      } else {
        setDiseaseAdvice(diseaseAdviceData || {});
      }
    } catch (e) {
      console.error('Erreur chargement diseaseAdvice:', e);
      setDiseaseAdvice(diseaseAdviceData || {});
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Vous devez être connecté en tant qu'admin pour accéder à cette page.");
        setLoading(false);
        return;
      }
      const headers = { headers: { Authorization: `Bearer ${token}` } };
      const usersRes = await axios.get(`${API_BASE}/admin/users`, headers);
      const predictionsRes = await axios.get(`${API_BASE}/admin/predictions`, headers);
      setUsers(usersRes.data);
      setPredictions(predictionsRes.data);
    } catch (err) {
      console.error('Erreur lors du chargement des données :', err);
      const msg = err.response && err.response.status === 403 ? "Accès refusé : droits administrateur requis." : 'Erreur lors du chargement des données.';
      setError(msg);
    }
    setLoading(false);
  };

  // CRUD Operations
  const handleOpenModal = (user = null) => {
    setEditUser(user);
    setForm(
      user
        ? { name: user.name, email: user.email, role: user.role }
        : { name: '', email: '', role: 'user' }
    );
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditUser(null);
    setForm({ name: '', email: '', role: 'user' });
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSaveUser = async () => {
    try {
      if (!form.name || !form.email || !form.role) {
        alert('Tous les champs sont obligatoires !');
        return;
      }
      if (editUser) {
        // Modifier un utilisateur
        await axios.put(`${API_BASE}/admin/users/${editUser._id}`, form);
        alert('Utilisateur modifié avec succès !');
      } else {
        // Ajouter un utilisateur
        await axios.post(`${API_BASE}/admin/users`, form);
        alert('Utilisateur ajouté avec succès !');
      }
      fetchAdminData();
      handleCloseModal();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde :', err);
      alert('Erreur lors de la sauvegarde !');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      try {
        await axios.delete(`${API_BASE}/admin/users/${id}`);
        alert('Utilisateur supprimé avec succès !');
        fetchAdminData();
      } catch (err) {
        console.error('Erreur lors de la suppression :', err);
        alert('Erreur lors de la suppression !');
      }
    }
  };

  // Graphique
  const diseaseStats = predictions.reduce((acc, p) => {
    acc[p.disease] = (acc[p.disease] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(diseaseStats)
    .sort((a, b) => b[1] - a[1]) // Trier par valeur décroissante
    .slice(0, 5) // Limiter à 5 catégories principales
    .map(([disease, count]) => ({ name: disease, value: count }));

  const otherCount = Object.entries(diseaseStats)
    .slice(5)
    .reduce((acc, [, count]) => acc + count, 0);
  if (otherCount > 0) {
    chartData.push({ name: 'Autres', value: otherCount });
  }

  const userRoles = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});
  const roleData = Object.entries(userRoles).map(([role, count]) => ({
    name: role,
    value: count,
  }));

  // Déconnexion
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login'; // Redirige vers la page de connexion
  };

  // Disease advice CRUD (local)
  const handleOpenDiseaseEdit = (key = null) => {
    if (key) {
      const item = diseaseAdvice[key];
      setEditDiseaseKey(key);
      setDiseaseForm({
        overview: item.overview || '',
        typicalSymptoms: (item.typicalSymptoms || []).join('\n'),
        prevention: (item.prevention || []).join('\n'),
        whenToSeekCare: item.whenToSeekCare || '',
        firstLineAdvice: item.firstLineAdvice || '',
        fullDescription: item.fullDescription || '',
        practicalTips: (item.practicalTips || []).join('\n'),
      });
    } else {
      setEditDiseaseKey(null);
      setDiseaseForm({ overview: '', typicalSymptoms: [], prevention: [], whenToSeekCare: '', firstLineAdvice: '', fullDescription: '', practicalTips: [] });
    }
    setOpenDiseaseModal(true);
  };

  const handleCloseDiseaseModal = () => {
    setOpenDiseaseModal(false);
    setEditDiseaseKey(null);
  };

  const handleDiseaseFormChange = (e) => {
    setDiseaseForm({ ...diseaseForm, [e.target.name]: e.target.value });
  };

  const handleSaveDisease = () => {
    const normalized = {
      overview: diseaseForm.overview,
      typicalSymptoms: diseaseForm.typicalSymptoms.split('\n').map((s) => s.trim()).filter(Boolean),
      prevention: diseaseForm.prevention.split('\n').map((s) => s.trim()).filter(Boolean),
      whenToSeekCare: diseaseForm.whenToSeekCare,
      firstLineAdvice: diseaseForm.firstLineAdvice,
      fullDescription: diseaseForm.fullDescription,
      practicalTips: diseaseForm.practicalTips.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    const copy = { ...diseaseAdvice };
    if (editDiseaseKey) {
      copy[editDiseaseKey] = normalized;
    } else {
      // Generate a safe key from overview first line
      const key = 'New-' + Date.now();
      copy[key] = normalized;
    }
    setDiseaseAdvice(copy);
    localStorage.setItem('diseaseAdvice', JSON.stringify(copy, null, 2));
    // try to save on server if token present
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .post(`${API_BASE}/admin/diseaseAdvice`, copy, { headers: { Authorization: `Bearer ${token}` } })
        .then(() => {
          // saved on server
        })
        .catch((err) => console.warn('Could not save diseaseAdvice to server:', err.message || err));
    }
    setOpenDiseaseModal(false);
  };

  const handleExportDiseaseJSON = () => {
    const dataStr = JSON.stringify(diseaseAdvice, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diseaseAdvice-export.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleSaveToServer = () => {
      const token = localStorage.getItem('token');
    if (!token) return alert('Vous devez être connecté en tant qu\'admin pour sauvegarder sur le serveur.');
    axios
      .post(`${API_BASE}/admin/diseaseAdvice`, diseaseAdvice, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => alert('Fiches sauvegardées sur le serveur'))
      .catch((err) => alert('Échec sauvegarde serveur: ' + (err.message || err)));
  };

  // Afficher les prédictions d'un utilisateur
  const handleViewUserDetails = (userId) => {
    const userPredictions = predictions.filter((p) => {
      if (p.Userid && typeof p.Userid === 'object') {
        return p.Userid._id === userId; // Si `Userid` est un objet
      } else {
        return p.Userid === userId; // Si `Userid` est un ID
      }
    });

    if (userPredictions.length === 0) {
      alert('Aucune prédiction trouvée pour cet utilisateur.');
      return;
    }

    setSelectedUser({ userId, predictions: userPredictions });
    setActiveView('userDetails');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            bgcolor: '#1976d2',
            color: '#fff',
          },
        }}
      >
        <Toolbar />
        <List>
          <ListItem button={true} onClick={() => setActiveView('dashboard')}>
            <ListItemIcon sx={{ color: '#fff' }}>
              <Dashboard />
            </ListItemIcon>
            <ListItemText primary="Tableau de bord" />
          </ListItem>
          <ListItem button={true} onClick={() => setActiveView('users')}>
            <ListItemIcon sx={{ color: '#fff' }}>
              <People />
            </ListItemIcon>
            <ListItemText primary="Utilisateurs" />
          </ListItem>
          <ListItem button={true} onClick={() => setActiveView('stats')}>
            <ListItemIcon sx={{ color: '#fff' }}>
              <BarChart />
            </ListItemIcon>
            <ListItemText primary="Statistiques" />
          </ListItem>
          <ListItem button={true} onClick={() => setActiveView('diseases')}>
            <ListItemIcon sx={{ color: '#fff' }}>
              <Dashboard />
            </ListItemIcon>
            <ListItemText primary="Fiches maladies" />
          </ListItem>
          <Divider sx={{ bgcolor: '#fff' }} />
          <ListItem button={true} onClick={handleLogout}>
            <ListItemIcon sx={{ color: '#fff' }}>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Déconnexion" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <AppBar position="static" sx={{ bgcolor: '#1976d2', mb: 4 }}>
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <img
                src="/assets/doctor.png"
                alt="Dr. AI"
                style={{ height: 40 }}
                onError={(e) => {
                  if (e && e.target) e.target.src = '/assets/doctor-illustration.svg';
                }}
              />
              <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                Tableau de bord Administrateur
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Box>
              <Button color="inherit" onClick={() => window.location.href = '/'}>Accueil</Button>
              <Button color="inherit" onClick={handleLogout}>Déconnexion</Button>
            </Box>
          </Toolbar>
        </AppBar>

        {loading ? (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            {activeView === 'dashboard' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Typography variant="h4" sx={{ textAlign: 'center', color: '#1976d2', mb: 4 }}>
                  Tableau de bord
                </Typography>
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {/* Graphique des maladies */}
                  <Paper elevation={3} sx={{ p: 3, borderRadius: 3, minWidth: 350, maxWidth: 400 }}>
                    <Typography variant="h6" sx={{ color: '#4caf50', mb: 2 }}>
                      Statistiques maladies
                    </Typography>
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Typography color="#4caf50">
                        Pas assez de données pour le graphique.
                      </Typography>
                    )}
                  </Paper>

                  {/* Graphique des rôles */}
                  <Paper elevation={3} sx={{ p: 3, borderRadius: 3, minWidth: 350, maxWidth: 400 }}>
                    <Typography variant="h6" sx={{ color: '#1976d2', mb: 2 }}>
                      Répartition des rôles
                    </Typography>
                    {roleData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChartGraph data={roleData}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#1976d2" />
                        </BarChartGraph>
                      </ResponsiveContainer>
                    ) : (
                      <Typography color="#1976d2">
                        Pas assez de données pour le graphique.
                      </Typography>
                    )}
                  </Paper>
                </Box>
              </Box>
            )}

            {activeView === 'users' && (
              <Paper
                elevation={3}
                sx={{ p: 3, borderRadius: 3, minWidth: 350, maxWidth: 500, margin: '0 auto' }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="h5" sx={{ color: '#1976d2' }}>
                    Utilisateurs
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenModal()}
                    sx={{ bgcolor: '#1976d2' }}
                  >
                    Ajouter
                  </Button>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nom</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Rôle</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell align="right">
                            <IconButton color="primary" onClick={() => handleOpenModal(user)}>
                              <Edit />
                            </IconButton>
                            <IconButton color="error" onClick={() => handleDeleteUser(user._id)}>
                              <Delete />
                            </IconButton>
                            <Button size="small" sx={{ ml: 1 }} onClick={() => handleViewUserDetails(user._id)}>
                              Voir prédictions
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Typography sx={{ mt: 2, fontWeight: 600 }}>
                  Total : <span style={{ color: '#1976d2' }}>{users.length}</span>
                </Typography>
              </Paper>
            )}

            {activeView === 'userDetails' && selectedUser && (
              <Box>
                <Typography variant="h5" sx={{ mb: 2, color: '#1976d2' }}>
                  Prédictions de l'utilisateur
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Maladie</TableCell>
                        <TableCell>Confiance</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedUser.predictions.map((prediction) => (
                        <TableRow key={prediction._id}>
                          <TableCell>{prediction.disease}</TableCell>
                          <TableCell>{prediction.Confidence}%</TableCell>
                          <TableCell>{new Date(prediction.createdAt).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {activeView === 'stats' && (
              <Box>
                <Typography variant="h5" sx={{ textAlign: 'center', color: '#1976d2', mb: 4 }}>
                  Statistiques globales
                </Typography>
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Paper elevation={3} sx={{ p: 3, borderRadius: 3, minWidth: 350, maxWidth: 400 }}>
                    <Typography variant="h6" sx={{ color: '#4caf50', mb: 2 }}>
                      Nombre total de prédictions
                    </Typography>
                    <Typography variant="h4" sx={{ textAlign: 'center', color: '#4caf50' }}>
                      {predictions.length}
                    </Typography>
                  </Paper>
                  <Paper elevation={3} sx={{ p: 3, borderRadius: 3, minWidth: 350, maxWidth: 400 }}>
                    <Typography variant="h6" sx={{ color: '#1976d2', mb: 2 }}>
                      Nombre total d'utilisateurs
                    </Typography>
                    <Typography variant="h4" sx={{ textAlign: 'center', color: '#1976d2' }}>
                      {users.length}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            )}
            {activeView === 'diseases' && (
              <Box>
                <Typography variant="h5" sx={{ mb: 2, color: '#1976d2' }}>
                  Fiches maladies
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDiseaseEdit()} sx={{ bgcolor: '#1976d2', mr: 2 }}>
                      Ajouter une fiche
                    </Button>
                    <Button variant="outlined" onClick={handleExportDiseaseJSON} sx={{ mr: 2 }}>
                      Exporter JSON
                    </Button>
                    <Button variant="contained" color="secondary" onClick={handleSaveToServer}>
                      Sauvegarder serveur
                    </Button>
                  </Box>
                </Box>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>État</TableCell>
                        <TableCell>Maladie</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.keys(diseaseAdvice).map((key, idx) => (
                        <TableRow key={key}>
                          <TableCell>
                            {/* choose an icon based on index as a simple heuristic; admin can replace assets */}
                            <img
                              src={idx % 3 === 0 ? '/assets/state-healthy.svg' : idx % 3 === 1 ? '/assets/state-warning.svg' : '/assets/state-critical.svg'}
                              alt="state"
                              className="state-icon"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </TableCell>
                          <TableCell>{key}</TableCell>
                          <TableCell sx={{ maxWidth: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>{diseaseAdvice[key].overview}</TableCell>
                          <TableCell align="right">
                            <Button size="small" onClick={() => handleOpenDiseaseEdit(key)} startIcon={<Edit />}>
                              Éditer
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </>
        )}

        {/* Modal CRUD Utilisateur */}
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box sx={styleModal}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {editUser ? 'Modifier' : 'Ajouter'} un utilisateur
            </Typography>
            <TextField
              fullWidth
              label="Nom"
              name="name"
              value={form.name}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Rôle"
              name="role"
              value={form.role}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="contained" onClick={handleSaveUser} sx={{ bgcolor: '#1976d2' }}>
                {editUser ? 'Enregistrer' : 'Ajouter'}
              </Button>
              <Button variant="outlined" onClick={handleCloseModal}>
                Annuler
              </Button>
            </Box>
          </Box>
        </Modal>
        {/* Modal Fiche Maladie */}
        <Modal open={openDiseaseModal} onClose={handleCloseDiseaseModal}>
          <Box sx={{ ...styleModal, width: 700 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {editDiseaseKey ? 'Modifier' : 'Ajouter'} une fiche maladie
            </Typography>
            <TextField
              fullWidth
              label="Présentation brève (overview)"
              name="overview"
              value={diseaseForm.overview}
              onChange={handleDiseaseFormChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Symptômes typiques (une par ligne)"
              name="typicalSymptoms"
              value={diseaseForm.typicalSymptoms}
              onChange={handleDiseaseFormChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Prévention (une par ligne)"
              name="prevention"
              value={diseaseForm.prevention}
              onChange={handleDiseaseFormChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Quand consulter"
              name="whenToSeekCare"
              value={diseaseForm.whenToSeekCare}
              onChange={handleDiseaseFormChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Conseils de 1ère ligne"
              name="firstLineAdvice"
              value={diseaseForm.firstLineAdvice}
              onChange={handleDiseaseFormChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Description complète"
              name="fullDescription"
              value={diseaseForm.fullDescription}
              onChange={handleDiseaseFormChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Conseils pratiques (une par ligne)"
              name="practicalTips"
              value={diseaseForm.practicalTips}
              onChange={handleDiseaseFormChange}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="contained" onClick={handleSaveDisease} sx={{ bgcolor: '#1976d2' }}>
                Enregistrer
              </Button>
              <Button variant="outlined" onClick={handleCloseDiseaseModal}>
                Annuler
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
