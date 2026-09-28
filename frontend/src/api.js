const API_URL = 'http://127.0.0.1:8000';

export async function  getJobs() {
    const response = await fetch(`${API_URL}/jobs`);
    
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
    }

    return await response.json();

}