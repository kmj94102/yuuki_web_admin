document.addEventListener("DOMContentLoaded", function() {


    const menuItems = document.querySelectorAll('.menu');
    const contentItems = document.querySelectorAll('.content');

    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            
            contentItems.forEach(content => {
                if (content.id === target) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
    
            menuItems.forEach(menu => {
                if (menu.getAttribute('data-target') === target) {
                    menu.classList.add('active');
                } else {
                    menu.classList.remove('active');
                }
            });
        });
    });
});