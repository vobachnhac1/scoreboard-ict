import axiosClient from './axiosClient'


// Champion
export const getAllChamp = () => axiosClient.get('/champion');
export const createChamp = (data) => axiosClient.post('/champion', data);
export const updateChamp = (id, data) => axiosClient.put('/champion/' + id, data);
export const deleteChamp = (id) => axiosClient.delete('/champion/' + id);
