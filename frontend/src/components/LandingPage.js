import Container from '@mui/material/Container';
import React,{useEffect,useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import KeyboardArrowRightOutlinedIcon from '@mui/icons-material/KeyboardArrowRightOutlined';
import EmergencyIcon from '@mui/icons-material/Emergency';
import '../styles/landing.css';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';

export default function LandingPage() {
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState();
    const navigate=useNavigate();
    //token
    useEffect(()=>{
        setToken(localStorage.getItem('token'));
    },[])
    // Simuler le chargement avec useEffect
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 4000); // Ajustez le délai selon vos besoins
        return () => clearTimeout(timer);
    }, []);

    if (loading) { 
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                background: "linear-gradient(135deg, #fefaff, #fefaff, #fbf9ff, #e5fcff, #d7fffc, #d6fff6, #d6fff6, #d9fff7, #e6fff9, #f7fffd, #feffff, #ffffff)" 
            }}>
                <img src="/assets/on-my-way-snoopy.gif" alt="Loading..." style={{height:"200px"}}/>
                <p style={{marginTop: "10px", fontSize: "25px", color: "#555"}}>Doctor Snoopy is coming...</p>
            </div>
        );
    }
    

    return (
        <div className='landing'>
            <Container fixed maxWidth='lg'>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh",flexDirection:"column" ,paddingBottom:"20px"}}>
                    <img src="/assets/heartbeat-pulse-unscreen.gif" style={{height:"130px"}}/>
                    <Grid container spacing={6}>
                        <Grid item xs={12} style={{textAlign:"center"}}>
                            <div className='title'>
                                <h1 style={{ fontSize: "60px" }}>Transforming Healthcare</h1>
                                <p style={{ fontSize: "20px", marginBottom: "20px", color: 'hsl(215.4 16.3% 46.9%)' }}>Predict diseases based on symptoms and get personalized health insights</p>
                                <Button variant="contained" endIcon={<KeyboardArrowRightOutlinedIcon />} style={{ borderRadius: "12px", padding: "10px 23px", fontSize: "12px", background: "linear-gradient(135deg,#00b6d6 0%,#0adaff 100%)", fontWeight: "500" }} className='btn' onClick={()=>{
                                    
                                     if (!token) {
                                        navigate("/login");
                                     }
                                     else {
                                         navigate("/predict");
                                     }
                                    
                                }}>
                                    Get Started
                                </Button>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} >
                            <div className='card'>
                                <EmergencyIcon className='icon' />
                                <h4>Disease Prediction</h4>
                                <p>Advanced AI-powered system to predict potential diseases based on your symptoms</p>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <div className='card'>
                                <ShieldOutlinedIcon className='icon' />
                                <h4>Precautions & Care</h4>
                                <p>Get detailed information about diseases and recommended precautions</p>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <div className='card'>
                                <HistoryOutlinedIcon className='icon' />
                                <h4>Health History</h4>
                                <p>Track your health journey with a comprehensive history of predictions</p>
                            </div>
                        </Grid>
                    </Grid>
                </div>
            </Container>
        </div>
    );
}
