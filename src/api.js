const BASE_URL = "https://684f05bbf0c9c9848d29e1e6.mockapi.io/api"

// Helper for all fetch requests
async function send({ method, path, data }) {
    const options = { method, headers: {}};

    if(data) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}/${path}`, options);
    const text = await response.text();

    if(response.ok) {
        // Handle empty responses like delete requests
        return text ? JSON.parse(text) : {};
    }

    throw new Error(`API Error: ${response.status} (${response.status}) - ${text}`);
}

// CRUD operations for notes
export function getNotes({ search = ''}) {
    // path no longer includes page or limit, rather refetches everything
    let path = `notes`;
    if(search) {
        path += `?title=${encodeURIComponent(search)}`; // search by title
    }
    return send({ method: 'GET', path });
}

export function createNote(note) {
    return send({ method: 'POST', path: 'notes', data: note });
}

export function updateNote(id, note) {
    return send({ method: 'PUT', path: `notes/${id}`, data: note });
}

export function deleteNote(id) {
    return send({ method: 'DELETE', path: `notes/${id}`});
}