const API_URL = 'http://127.0.0.1:8000';

export async function  getJobs() {
    const response = await fetch(`${API_URL}/jobs`);
    
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
    }

    return await response.json();

}

export async function createShift(shift) {
    const response = await fetch(`${API_URL}/shifts`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shift)
    });
    
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
    }

}

    export async function getShifts(start, end) {
    const response = await fetch(`${API_URL}/shifts?start=${start}&end=${end}`);

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
    }

    return await response.json();
}
