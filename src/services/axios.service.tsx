import axios from 'axios';

// Créer une instance Axios de base
const axiosService = axios.create({
    baseURL: 'http://localhost:8080',
});

// Ajouter un intercepteur pour les requêtes sortantes
axiosService.interceptors.request.use(
    config => {
        // Récupérer le token JWT depuis localStorage
        const token = localStorage.getItem('accessToken');

        // Ajouter le token aux en-têtes de la requête
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default axiosService;
