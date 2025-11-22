import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Accordion from '@mui/material/Accordion';
// import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
//icons
import {ShieldCheck,Activity} from "lucide-react";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
//size
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const ConfidenceLevel = ({ value }) => {
    return (
        <Box>
            <Box display="flex" alignItems="center">
            <Box flexGrow={1} mr={2}>
                <LinearProgress 
                variant="determinate" 
                value={value} 
                sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "#f5f5f5",
                    "& .MuiLinearProgress-bar": {
                    backgroundColor: "#00b894", 
                    },
                }}
                />
            </Box>
            <Typography variant="subtitle1" color="#00b894">
                {`${value}%`}
            </Typography>
            </Box>
        </Box>
    );
};
export default function CardDisease(props){
    // gestion responsive
    const theme = useTheme(); 
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));
    const isSm = useMediaQuery(theme.breakpoints.up('sm') && theme.breakpoints.down('md'));
    const isMd = useMediaQuery(theme.breakpoints.up('md') && theme.breakpoints.down('lg'));
    const isLg = useMediaQuery(theme.breakpoints.up('lg'));  

    console.log("hannnni")
    console.log('ss',props.cardContent);
   
    //state

    // const [Precautions,setPrecautions]=React.useState([]);
    const precautionList = Array.isArray(props.cardContent?.precautions)
    ? props.cardContent.precautions.map((precaution, index) => (
        <li key={index} style={{ listStyleType: "none" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <FiberManualRecordIcon
              sx={{ width: "15px", paddingTop: "0px", color: "#26a69a" }}
            />
            {precaution}
          </div>
        </li>
      ))
    : null;
  
    return(
        <div style={props.style}>
            <Card sx={{ padding:'16px',borderRadius:'14px'}} >
                <CardContent sx={{display:'flex',flexDirection:'column',alignItems:'start',justifyContent:'center',gap:'20px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}>
                        <Typography gutterBottom sx={{ color: '#424242', fontSize: 30,fontWeight:800 ,marginTop:'3px'}}>
                            {props.cardContent.disease}
                        </Typography>
                        <ShieldCheck style={{width:'50px',height:'50px',padding:'10px',backgroundColor:'#b2dfdb',borderRadius:'50%',color:'#009688'}}/>
                    </div>
                    <div>
                        <Typography sx={{color:'#616161'}}>
                            {props.cardContent.description}
                        </Typography>
                    </div>
                    <div style={{width:'100%',display:'flex',flexDirection:'column',justifyContent:'start'}}>
                        <Typography variant="subtitle1" gutterBottom>
                            Confidence Level
                        </Typography>
                        <ConfidenceLevel value={Math.round(props.cardContent.Confidence*100)} />
                    </div>
                    <div style={{width:'100%'}}>
                        <Accordion>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1-content"
                                id="panel1-header"
                                style={{backgroundColor:'#eeeeee'}}
                                >
                                <div style={{display:'flex',gap:"20px"}}>
                                    <Activity/>
                                    <Typography component="span">Precautions</Typography>
                                </div>
                            </AccordionSummary>
                            <AccordionDetails>
                                {precautionList}
                            </AccordionDetails>
                        </Accordion>
                    </div>
                </CardContent>
            </Card>  
        </div>      
    )
}