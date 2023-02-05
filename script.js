document.addEventListener('DOMContentLoaded', () => {
    const splash = document.querySelector('.subpage.splash');
    const list = document.querySelector('.subpage.list');
    const model = document.querySelector('.subpage.model');
    const modelViewer = document.getElementById('viewer');
    const backButton = document.getElementById('back');

    setTimeout(() => {
        splash.classList.remove('open');
        setTimeout(() => list.classList.add('open'), 1000);
    }, 2000);

    backButton.addEventListener('click', () => {
        model.classList.remove('open');
        setTimeout(() => list.classList.add('open'), 1000);
    });

    document.querySelectorAll('.subpage.list button').forEach(btn => {
        console.log({btn});
        btn.addEventListener('click', () => {
            modelViewer.src = btn.dataset.modelSrc;
            list.classList.remove('open');
            setTimeout(() => model.classList.add('open'), 1000);
        });
    });

});