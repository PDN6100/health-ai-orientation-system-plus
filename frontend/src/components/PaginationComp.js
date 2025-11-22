import {useContext}  from 'react';
import Pagination from "@mui/material/Pagination";
import { historyData } from "../contexts/historyDataContext";

export default function PaginationComp({currentPage, setCurrentPage,handlePageChange,itemsPerPage}){
let {data}=useContext(historyData);
    // Gestion du changement de page
    return(
        <Pagination
        count={Math.ceil(data.length / itemsPerPage)}
        page={currentPage}
        onChange={handlePageChange}
        variant="outlined"
        shape="rectangular"
        style={{ marginTop: "16px", justifyContent: "center", display: "flex"
            ,bottom:"20px"
        }}
    />
    )
}