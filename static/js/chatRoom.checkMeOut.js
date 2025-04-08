//cette fonction permet de trigger l'api en backend, avec comme information les 2 user Ids





// async function getChatRoom() {
//     const urlParams = new URLSearchParams(window.location.search);
//     const targetUserId = urlParams.get('targetUserId');  // ou toute autre méthode pour récupérer l'ID
//     console.log(targetUserId); 
//     const urlPath = window.location.pathname;
//     const targetUserId = urlPath.split('/')[2];
//     console.log(targetUserId); 

//     console.log("test");
//     const res = await fetch(`/api/chat/getRoom/${targetUserId}/`);
//     if (!res.ok) {
//         console.error('Error fetching chat room');
//         return;
//     }
//     console.log("test2");
//     const data = await res.json();
//     console.log(data);
//     console.log("test3");

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