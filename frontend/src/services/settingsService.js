import api from './api';

const settingsService = {
  async getBanks() {
    const response = await api.get('/settings/banks');
    return response.data;
  },

  async getDefaultBank() {
    const response = await api.get('/settings/banks/default');
    return response.data;
  },

  async createBank(bankData) {
    const response = await api.post('/settings/banks', bankData);
    return response.data;
  },

  async updateBank(id, bankData) {
    const response = await api.put(`/settings/banks/${id}`, bankData);
    return response.data;
  },

  async deleteBank(id) {
    const response = await api.delete(`/settings/banks/${id}`);
    return response.data;
  },

  async setDefaultBank(id) {
    const response = await api.put(`/settings/banks/${id}/set-default`);
    return response.data;
  },
};

export default settingsService;