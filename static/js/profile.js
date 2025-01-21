async function apiUser(event){
    event.preventDefault();
    try {
        const response = await fetch('/api/userProfile', {
            method: 'GET',
            credentials: 'same-origin',
        });
    } catch (error) {
        console.log(error);
    }
}