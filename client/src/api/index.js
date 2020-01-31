export const getData = () => fetch('/api').then(response => response.json());

export const updateData = key => fetch('/api', {method: 'POST', body: JSON.stringify({key})})
    .then(response => response.json());
