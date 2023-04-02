document.addEventListener('DOMContentLoaded', () => {
    const splash = document.querySelector('.subpage.splash');
    const list = document.querySelector('.subpage.list');
    const model = document.querySelector('.subpage.model');
    const modelViewer = document.querySelector('model-viewer');
    const backButton = document.querySelector('button.back');
    const helpButton = document.querySelector('button.help');
    const modelTitle = document.querySelector('h1.model-title');
    
    // Splash screen starts on, get data
    fetch('/exercises.json').then(res => res.json()).then(res => {
        // create category
        const createCategory = (category) =>  {
            return `<section class="category">
                        <div class="name"><span class="material-symbols-outlined">${category.icon ?? ''}</span class="name-text">${category.name}</div>` +
                        category.exercises.reduce((acc, ex) =>{
                            return acc + `<div class="exercise">
                                            <button data-exercise="${ex.id}">
                                                <span>${ex.name}</span><span class="material-symbols-outlined">chevron_right</span>
                                            </button>
                                        </div>`;
                        }, '') + 
                    `</section>`;
        };
        const listContainer = document.querySelector('.list-container');
        listContainer.innerHTML = res.categories.reduce((acc, cat) => acc + createCategory(cat), '');
        
        // Get our list of exercises from the data in a hash id -> exercise
        const exercises = res.categories.reduce((acc, cat) => acc.concat(cat.exercises), []).reduce((acc, ex) => {
            acc[ex.id] = ex;
            return acc;
        }, {});
        
        listContainer.querySelectorAll('button').forEach(btn => {
            const exercise = exercises[btn.dataset.exercise];
            if (!exercise) return;
            btn.addEventListener('click', e => {
                modelViewer.src = exercise.model_url;
                modelTitle.innerText = exercise.name;
                list.classList.remove('open');
                model.classList.add('open');
            });
        });
        // Show the list screen & lift the splash screen
        splash.classList.remove('open');
        list.classList.add('open');
    });

    // Back button
    backButton.addEventListener('click', () => {
        model.classList.remove('open');
        list.classList.add('open');
    });

    helpButton.addEventListener('click', () => {
        Swal.fire({
            title: 'Ayuda',
            text: 'Elegí el ejercicio que quieras ver. Podés interactuar con el modelo 3D desde el navegador o verlo en realidad aumentada a través de tu cámara tocando el botón!',
            icon: 'question',
            iconColor: '#04ac9c',
            customClass: {title: 'cy-swal2-title', confirmButton: 'cy-swal2-confirm'},
            confirmButtonText: 'OK!'
          });
    })

    // Model selection
    // document.querySelectorAll('.subpage.list button.item').forEach(btn => {
    //     btn.addEventListener('click', () => {
    //         if (btn.dataset.hotspots === "true") {
    //             modelViewerHotspots.src = btn.dataset.modelSrc;
    //             modelViewerNoHotspots.classList.add('hide');
    //             modelViewerHotspots.classList.remove('hide');
    //         } else {
    //             modelViewerNoHotspots.src = btn.dataset.modelSrc;
    //             modelViewerHotspots.classList.add('hide');
    //             modelViewerNoHotspots.classList.remove('hide');
    //         }
    //         // Override title in a very unprofessional way
    //         modelTitle.innerHTML = btn.innerHTML;
    //         list.classList.remove('open');
    //         model.classList.add('open');
    //     });
    // });

    // Hotspot listeners
    // const hotspotClicked = (hotspot) => {
    //     const hotspotData = modelViewerHotspots.queryHotspot(hotspot.slot);
    //     console.log(hotspotData);
    //     modelViewerHotspots.cameraTarget = `${hotspotData.position.x}m ${hotspotData.position.y}m ${hotspotData.position.z}m`;
    //     Swal.fire({
    //         title: hotspot.dataset.title,
    //         text: hotspot.dataset.message,
    //         icon: 'info',
    //         iconColor: '#04ac9c',
    //         customClass: {title: 'cy-swal2-title', confirmButton: 'cy-swal2-confirm'},
    //         confirmButtonText: 'Entendido!'
    //       });
    //   }
    
    // modelViewerHotspots.querySelectorAll('button.Hotspot').forEach((hotspot) => {
    //     console.log("Configuring hotspot: ", hotspot);
    //     hotspot.addEventListener('click', () => hotspotClicked(hotspot));
    // });
});