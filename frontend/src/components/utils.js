import { toast } from 'react-toastify';

export const handleSuccess = (msg) => {
    toast.success(msg, {
        position: 'top-right' // Notification de succès reste en bas à droite
    });
}

export const handleError = (msg) => {
    toast.error(msg, {
        position: 'top-center' // Notification d'erreur sera affichée en bas à gauche
    });
}
