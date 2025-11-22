export function reducerHistory(currentState, action) {
    let type = action.type;
    let data = action.payload.data;
    // Fonction pour convertir la date en un format ISO standard
    const parseDate = (dateString) => {
        const [day, month, year] = dateString.split('/'); // Séparer jour, mois, année
        return new Date(`${year}-${month}-${day}`); // Format ISO: YYYY-MM-DD
    };

    switch (type) {
        case 'ascending':
            return [...currentState].sort((a, b) => parseDate(a.createdAt) - parseDate(b.createdAt));
        case 'descending':
            return [...currentState].sort((a, b) => parseDate(b.createdAt) - parseDate(a.createdAt));
        case 'search': {
                const keyword = action.payload?.keyword?.toLowerCase() || '';
                if (keyword === '') {
                   // If search is cleared, return the original data
                    return action.payload?.originalData || [];
                }
                return [...action.payload.originalData.filter(item =>
                    item.disease && item.disease.toLowerCase().includes(keyword)
                )];} 
        case 'SET_DATA':
            console.log(action.payload|| [])
            return action.payload|| [];
        default:
            return { data };
    }
}
