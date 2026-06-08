/* document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Impede o # de aparecer na URL
            
            const targetId = this.getAttribute('href');

            if (targetId === '#') {
                // Rola para o topo se for o link da logo
                window.scrollTo(0, 0);
            } else {
                // Deixa o seu CSS assumir a rolagem e o offset
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView();
                }
            }
        });
    });
}); */



document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DO MENU MOBILE ---
    const mobileBtn = document.querySelector('.mobile-btn');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu li a');

    // Abre e fecha o menu ao clicar no ícone Hamburguer
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Fecha o menu automaticamente após clicar em qualquer link (Sobre, Projetos, etc)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });

    // --- LÓGICA DE ROLAGEM SUAVE (mantida e otimizada) ---
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); 
            
            const targetId = this.getAttribute('href');

            if (targetId === '#') {
                window.scrollTo(0, 0); // Volta pro topo se for a Logo
            } else {
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView();
                }
            }
        });
    });
});