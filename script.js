document.addEventListener('DOMContentLoaded', () => {
    const splash = document.querySelector('.subpage.splash');
    const list = document.querySelector('.subpage.list');
    const model = document.querySelector('.subpage.model');
    const modelViewer = document.getElementById('viewer');
    const backButton = document.getElementById('back');

    setTimeout(() => {
        splash.classList.remove('open');
        list.classList.add('open');
    }, 2000);

    backButton.addEventListener('click', () => {
        model.classList.remove('open');
        list.classList.add('open');
    });

    document.querySelectorAll('.subpage.list button').forEach(btn => {
        btn.addEventListener('click', () => {
            modelViewer.src = btn.dataset.modelSrc;
            if (btn.dataset.hotspots === "true") modelViewer.classList.remove('no-hotspots');
            else modelViewer.classList.add('no-hotspots');
            list.classList.remove('open');
            model.classList.add('open');
        });
    });

});