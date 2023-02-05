document.addEventListener('DOMContentLoaded', () => {
    const splash = document.querySelector('.subpage.splash');
    const list = document.querySelector('.subpage.list');
    const model = document.querySelector('.subpage.model');
    const modelViewerNoHotspots = document.querySelector('model-viewer[data-hotspots="false"]');
    const modelViewerHotspots = document.querySelector('model-viewer[data-hotspots="true"]');
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
            if (btn.dataset.hotspots === "true") {
                modelViewerHotspots.src = btn.dataset.modelSrc;
                modelViewerNoHotspots.classList.add('hide');
                modelViewerHotspots.classList.remove('hide');
            } else {
                modelViewerNoHotspots.src = btn.dataset.modelSrc;
                modelViewerHotspots.classList.add('hide');
                modelViewerNoHotspots.classList.remove('hide');
            }
            list.classList.remove('open');
            model.classList.add('open');
        });
    });

});