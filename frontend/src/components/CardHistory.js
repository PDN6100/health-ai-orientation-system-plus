import React, {useContext} from "react";
import { Calendar } from "lucide-react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { historyData } from "../contexts/historyDataContext";



export default function CardHistory({layout}) {
const {currentData}=useContext(historyData);
    const diseaseList = currentData.map((element, index) => (
        <tr key={index}>
            <td>
                <Calendar style={{ marginRight: "3px", height: "16px", width: "16px" }} />
                {element.createdAt}
            </td>
            <td style={{width:"40%",display:"flex",gap:"4px",flexWrap:"wrap",alignItems:"center",justifyContent:"start",padding:"0"}}>
                {element.Symptomes.map((s, i) => (
                    <div
                        key={i}
                        style={{
                            width: "fit-content",
                            padding: "5px 8px",
                            backgroundColor: "hsl(189 100% 42% / 0.1)",
                            borderRadius: "20px",
                            color:"hsl(189 100% 42%)",
                            fontSize:"14px",
                        }}
                    >
                        {s}
                    </div>
                ))}
            </td>
            <td>{element.disease}</td>
            {/* <td>{element.description}</td> */}
            <td
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:"center",
                    gap:"7px",
                    
                }}
            >
                <div
                    style={{
                        position: "relative",
                        width: "90px",
                        height: "8px",
                        borderRadius: "60px",
                        backgroundColor: "#e0f7fa",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            width: `${Math.round(element.Confidence*100)}%`,
                            height: "100%",
                            borderRadius: "60px",
                            backgroundColor: "#00bcd4",
                        }}
                    ></div>
                </div>
                <h5 style={{ margin: "0 0 0 5px", fontSize: "14px" }}>{Math.round(element.Confidence*100)}%</h5>
            </td>
        </tr>
    ));

    // Custom MUI Theme
    const theme = createTheme({
        components: {
            MuiPaginationItem: {
                styleOverrides: {
                    root: {
                        "&.Mui-selected": {
                            backgroundColor: "hsl(189, 100%, 42%, 0.1)",
                            color: "hsl(189, 100%, 42%)",
                        },
                    },
                },
            },
        },
    });
    const diseaseListCard=currentData.map((element, index) => (
        
        <div className="grid-card" style={{display:"flex",width:"30%",flexDirection:"column",padding:"20px 18px",borderRadius:"16px",gap:"15px",backgroundColor:"white", boxShadow: "0 8px 30px #0000000f"}}>
            <div className="date" style={{justifyContent:"end",display:"flex",alignItems:"center",color:"hsl(215.4 16.3% 46.9%)"}}><Calendar style={{height:"18px",color:"green",fontWeight:"900",marginRight:"3px"}}/> {element.createdAt}</div>
            <div className="disease" style={{fontSize:"20px",fontWeight:"600"}}>{element.disease }</div>
            <h5 style={{marginTop:"12px",fontWeight:"500",fontSize:"16px",color:"hsl(215.4 16.3% 46.9%)"}}>Symptoms</h5>
            <div className="symptoms" style={{display:"flex",gap:"20px",flexWrap:"wrap"}}> {element.Symptomes.map((s, i) => (
                    <div
                        key={i}
                        style={{
                            fontWeight:"700",
                            width: "fit-content",
                            padding: "5px 8px",
                            backgroundColor: "hsl(189 100% 42% / 0.1)",
                            borderRadius: "20px",
                            color:"hsl(189 100% 42%)",
                            fontSize:"12px",
                        }}
                    >
                        {s}
                    </div>
                    ))}
                </div>
            <div className="confidence" style={{display:"flex",gap:"20px",alignItems:"center",justifyContent:"start"}}><div
                    style={{
                        position: "relative",
                        width: "60%",
                        height: "8px",
                        borderRadius: "60px",
                        backgroundColor: "#e0f7fa",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            width: `${Math.round(element.Confidence*100)}%`,
                            height: "100%",
                            borderRadius: "60px",
                            backgroundColor: "#00bcd4",
                        }}
                    ></div>
                </div>
                <h5 style={{ margin: "0 0 0 5px", fontSize: "14px" }}>{Math.round(element.Confidence*100)}%</h5></div>
        </div>
      ));
    
const responsiveList = currentData.map((element, index) => (
  <div key={index} className="item">
    <div>
      <strong>Date:</strong> 
      {element.createdAt}
    </div>
    <div>
      <strong>Symptoms:</strong>{" "}
      {element.Symptomes.map((s, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            padding: "5px 8px",
            backgroundColor: "hsl(189 100% 42% / 0.1)",
            borderRadius: "20px",
            color: "hsl(189 100% 42%)",
            fontSize: "14px",
            marginRight: "4px",
          }}
        >
          {s}
        </span>
      ))}
    </div>
    <div>
      <strong>Disease:</strong> {element.disease}
    </div>
    <div>
      <strong>Confidence:</strong>
      <div className="confidence-bar">
        <div
          className="fill"
          style={{
            width: `${element.Confidence}%`,
          }}
        ></div>
      </div>
      <span>{element.Confidence}%</span>
    </div>
  </div>
));

      return (
        layout === 'list' ? (
            <ThemeProvider theme={theme}>
                <table className="table" style={{}}>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th style={{ width: "20%" }}>Symptoms</th>
                            <th>Disease</th>
                            <th style={{}}>Confidence</th>
                        </tr>
                    </thead>
                    <tbody>{diseaseList}</tbody>
                </table>
                <div className="responsive-list" style={{display:"none"}}>{responsiveList}</div>

            </ThemeProvider>
        ) : (
            <div
                className="all-grid-card"
                style={{
                    gap: "20px",
                    justifyContent: "center",
                    display: "flex",
                    flexWrap: "wrap",
                    width:"100%"
                }}
            >
                {diseaseListCard}
            </div>
        )
    );
}