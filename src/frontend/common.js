export const fetchWithToken = async (path, options = {}) => {
  const token = localStorage.getItem('token');
  const api_root = await window.electron.getApiRoot();
  const headers = { ...options.headers, Authorization: `Bearer ${token}` };
  const updatedOptions = { ...options, headers };

  return await fetch(`${api_root}${path}`, updatedOptions);
};

module.exports = { fetchWithToken };
