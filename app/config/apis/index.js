import axiosClient from './axiosClient'

// ================== CHAMPION ==================
export const getAllChamp = (params) => axiosClient.get('/champion', { params });
export const createChamp = (data) => axiosClient.post('/champion', data);
export const updateChamp = (id, data) => axiosClient.put(`/champion/${id}`, data);
export const deleteChamp = (id) => axiosClient.delete(`/champion/${id}`);

// ================== CHAMPION GROUP ==================
export const getAllChampGroups = () => axiosClient.get('/champion-grp');
export const getChampGroupDetail = (id) => axiosClient.get(`/champion-grp/detail?id=${id}`);
export const getChampGroupsByChampId = (champId) => axiosClient.get(`/champion-grp/${champId}`);
export const createChampGroup = (data) => axiosClient.post('/champion-grp', data);
export const updateChampGroup = (id, data) => axiosClient.put(`/champion-grp/${id}`, data);
export const deleteChampGroup = (id) => axiosClient.delete(`/champion-grp/${id}`);

// ================== CHAMPION CATEGORY (HÌNH THỨC) ==================
export const getAllChampCategories = (params) => axiosClient.get('/champion-category', { params });
export const createChampCategory = (data) => axiosClient.post('/champion-category', data);
export const updateChampCategory = (id, data) => axiosClient.put(`/champion-category/${id}`, data);
export const deleteChampCategory = (id) => axiosClient.delete(`/champion-category/${id}`);

// ================== CHAMPION EVENT (NỘI DUNG THI THEO HÌNH THỨC) ==================
export const getAllChampEvents = () => axiosClient.get('/champion-event');
export const createChampEvent = (data) => axiosClient.post('/champion-event', data);
export const updateChampEvent = (id, data) => axiosClient.put(`/champion-event/${id}`, data);
export const deleteChampEvent = (id) => axiosClient.delete(`/champion-event/${id}`);

// ================== CHAMPION GROUP EVENT (NỘI DUNG THI THEO NHÓM) ==================
export const getChampGrpEvents = (params) => axiosClient.get('/champion-grp-event', { params });
export const createChampGrpEvent = (data) => axiosClient.post('/champion-grp-event', data);
export const updateChampGrpEvent = (id, data) => axiosClient.put(`/champion-grp-event/${id}`, data);
export const deleteChampGrpEvent = (id) => axiosClient.delete(`/champion-grp-event/${id}`);

// ================== COMMON ==================
export const getAllCommonCategoryKeys = () => axiosClient.get('/common/category-all');
export const getCommonCategoryByKey = (key) => axiosClient.get(`/common/category?category_key=${key}`);

// ================== SYSTEM ==================
export const getConfigSystem = () => axiosClient.post('/config/get-config-system');
export const updateConfigSystem = (data) => axiosClient.post('/config/update-config-system', data);
