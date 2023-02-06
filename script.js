document.addEventListener('DOMContentLoaded', () => {
    const splash = document.querySelector('.subpage.splash');
    const list = document.querySelector('.subpage.list');
    const model = document.querySelector('.subpage.model');
    const modelViewerNoHotspots = document.querySelector('model-viewer[data-hotspots="false"]');
    const modelViewerHotspots = document.querySelector('model-viewer[data-hotspots="true"]');
    const backButton = document.getElementById('back');
    const helpButton = document.querySelector('button.help');
    const modelTitle = document.querySelector('h1.model-title');
    
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

    helpButton.addEventListener('click', () => {
        Swal.fire({
            title: 'Ayuda',
            text: 'Elegí el ejercicio que quieras ver. Podés interactuar con el modelo 3D desde el navegador o verlo en realidad aumentada a través de tu cámara tocando el botón!',
            icon: 'info',
            iconColor: '#04ac9c',
            customClass: {title: 'cy-swal2-title', confirmButton: 'cy-swal2-confirm'},
            confirmButtonText: 'OK!'
          });
    })

    // Model selection
    document.querySelectorAll('.subpage.list button.item').forEach(btn => {
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
            // Override title in a very unprofessional way
            modelTitle.innerHTML = btn.innerHTML;
            list.classList.remove('open');
            model.classList.add('open');
        });
    });

    // Hotspot listeners
    const hotspotClicked = (hotspot) => {
        const hotspotData = modelViewerHotspots.queryHotspot(hotspot.slot);
        console.log(hotspotData);
        modelViewerHotspots.cameraTarget = `${hotspotData.position.x}m ${hotspotData.position.y}m ${hotspotData.position.z}m`;
        Swal.fire({
            title: hotspot.dataset.title,
            text: hotspot.dataset.message,
            icon: 'info',
            iconColor: '#04ac9c',
            customClass: {title: 'cy-swal2-title', confirmButton: 'cy-swal2-confirm'},
            confirmButtonText: 'Entendido!'
          });
      }
    
    modelViewerHotspots.querySelectorAll('button.Hotspot').forEach((hotspot) => {
        console.log("Configuring hotspot: ", hotspot);
        hotspot.addEventListener('click', () => hotspotClicked(hotspot));
    });
});