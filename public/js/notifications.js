const socket = io();

// Écoute des nouvelles notifications en temps réel
socket.on('new_notification', function(data) {
    const notificationBadge = document.querySelector('.notification-icon .badge');
    if (notificationBadge) {
        let count = parseInt(notificationBadge.textContent, 10);
        count++;
        notificationBadge.textContent = count;
        notificationBadge.style.display = 'block'; // Afficher le badge
    } else {
        // Si le badge n'existe pas, on le crée
        const badge = document.createElement('span');
        badge.className = 'badge badge-danger';
        badge.textContent = 1;
        document.querySelector('.notification-icon').appendChild(badge);
    }
});
document.querySelector('.notification-icon').addEventListener('click', function() {
    // Masquer le badge après le clic
    const badge = document.querySelector('.notification-icon .badge');
    if (badge) {
        badge.style.display = 'none';
    }

    // Envoyer une requête pour marquer les notifications comme lues
    fetch('/mark-notifications-read', { method: 'POST' });
});
