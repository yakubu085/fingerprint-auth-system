// Base API configuration
const API_BASE_URL = '/Projects/biometric-evoting/api';
const JAVA_API_BASE_URL = 'http://localhost:8080/api';

// Create a configurable API service
class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.javaBaseUrl = JAVA_API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const config = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, config);

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // File upload
  async upload(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
  }

  // Java API calls for fingerprint operations
  async javaRequest(endpoint, options = {}) {
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const url = `${this.javaBaseUrl}${endpoint}`;

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`Java API error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Java API request failed:', error);
      throw error;
    }
  }

  // Fingerprint scanning
  async scanFingerprint() {
    return this.javaRequest('/fingerprint/scan', { method: 'POST' });
  }

  // Fingerprint matching
  async matchFingerprints(template1, template2) {
    return this.javaRequest('/fingerprint/match', {
      method: 'POST',
      body: JSON.stringify({ template1, template2 })
    });
  }
}

// Create API service instance
const apiService = new ApiService();

// API endpoints for different modules
export const api = {
  // Authentication
  auth: {
    checkRole: () => apiService.get('/auth/check_role.php'),
    logout: () => apiService.post('/logout.php')
  },

  // User management
  users: {
    login: (credentials) => apiService.post('/user/login.php', credentials),
    register: (userData) => apiService.post('/user/register.php', userData),
    updateProfile: (userData) => apiService.post('/user/update_profile.php', userData),
    changePassword: (passwords) => apiService.post('/user/change_password.php', passwords),
    getVotingHistory: (params) => apiService.get('/user/get_voting_history.php', params),
    storeTemplate: (templateData) => apiService.post('/user/store_template.php', templateData)
  },

  // Elections management
  elections: {
    create: (electionData) => apiService.post('/elections/create_election.php', electionData),
    getAll: (params) => apiService.get('/elections/get_elections.php', params),
    update: (electionData) => apiService.post('/elections/update_election.php', electionData),
    delete: (electionId) => apiService.post('/elections/delete_election.php', { election_id: electionId }),
    addCandidate: (candidateData) => apiService.post('/elections/add_candidate.php', candidateData)
  },

  // Voting
  voting: {
    castVote: (voteData) => apiService.post('/voting/cast_vote.php', voteData),
    getResults: (electionId) => apiService.get(`/voting/get_results.php?election_id=${electionId}`),
    getElectionCandidates: (electionId) => apiService.get(`/voting/get_election_candidates.php?election_id=${electionId}`)
  },

  // Fingerprint operations
  fingerprint: {
    scan: () => apiService.scanFingerprint(),
    match: (template1, template2) => apiService.matchFingerprints(template1, template2)
  }
};

// Error handling utility
export const handleApiError = (error) => {
  if (error.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred. Please try again.';
};

// Loading states utility
export const createLoadingState = () => ({
  isLoading: false,
  error: null,
  data: null
});

export const setLoading = (state, loading = true) => ({
  ...state,
  isLoading: loading
});

export const setError = (state, error) => ({
  ...state,
  error,
  isLoading: false
});

export const setData = (state, data) => ({
  ...state,
  data,
  isLoading: false,
  error: null
});

export const resetState = () => ({
  isLoading: false,
  error: null,
  data: null
});

export default apiService;