import axios from "axios";

class AuthService {
  // This class deals with sending requests to the proxy API

  async login(username, password) {
    return await fetch('/api/account/login',
      {
        method: "post",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({username, password})
      }
    )
  }

  async logout() {
    return await axios.post('/api/account/logout')
  }

  async register(username, email, password1, password2, first_name, last_name) {
    return await fetch('/api/account/register',
      {
        method: "post",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({username, email, password1, password2, first_name, last_name})
      }
    );
  }

  async refresh() {
    return await axios.get('/api/account/refresh');
  }

  async getCurrentUser() {
    return await axios.get('/api/account/user')
  }
}

export default new AuthService();
