import axios from "axios";

class AuthService {
  // This class deals with sending requests to the proxy API

  async login(username, password) {
    return await axios.post('/api/account/login', {username, password})
  }

  async logout() {
    return await axios.post('/api/account/logout')
  }

  async register(username, password, re_password) {
    return await axios.post('/api/account/register', {username, password, re_password});
  }

  async refresh() {
    return await axios.get('/api/account/refresh');
  }

  async getCurrentUser() {
    return await axios.get('/api/account/user')
  }
}

export default new AuthService();
