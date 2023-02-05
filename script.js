document.addEventListener('DOMContentLoaded', () => {
    const splash = document.querySelector('.subpage.splash');
    const list = document.querySelector('.subpage.list');
    const model = document.querySelector('.subpage.model');
    const modelViewerNoHotspots = document.querySelector('model-viewer[data-hotspots="false"]');
    const modelViewerHotspots = document.querySelector('model-viewer[data-hotspots="true"]');
    const backButton = document.getElementById('back');
    
    // Splash screen intro
    setTimeout(() => {
        splash.classList.remove('open');
        list.classList.add('open');
    }, 2000);

    // Back button
    backButton.addEventListener('click', () => {
        model.classList.remove('open');
        list.classList.add('open');
    });

    // Model selection
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

    // Hotspot listeners
    const hotspotClicked = (hotspot) => {
        const hotspotData = modelViewerHotspots.queryHotspot(hotspot.slot);
        console.log(hotspotData);
        modelViewerHotspots.cameraTarget = `${hotspotData.position.x}m ${hotspotData.position.y}m ${hotspotData.position.z}m`;
      }
    
    modelViewerHotspots.querySelectorAll('button.Hotspot').forEach((hotspot) => {
        console.log("Configuring hotspot: ", hotspot);
        hotspot.addEventListener('click', () => hotspotClicked(hotspot));
    });
});