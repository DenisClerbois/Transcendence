// //cette fonction permet de trigger l'api en backend, avec comme information les 2 user Ids

// async function getChatRoom() {
//     const response = await fetch(`/api/chat/getRoom/${window.routeParams.userId.toString()}/`, {
//         method: 'POST',
//         headers: {
//             'X-CSRFToken': getCsrfToken(),
//         }
//     })
//     if (!response.ok) {
//         console.error('Error fetching chatRoom');
//     }
//     console.log(await response.json())
//     return response.status;
// }

// getChatRoom();

//LORENZO