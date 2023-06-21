document.addEventListener('DOMContentLoaded', () => {
    let modelViewer;
    const splash = document.querySelector('.subpage.splash');
    const list = document.querySelector('.subpage.list');
    const model = document.querySelector('.subpage.model');
    const modelPageContent =  document.querySelector('.subpage.model > .content');
    const modelPageTab = modelPageContent.querySelector('.tab')
    const tipDisplayToggle = modelPageContent.querySelector('.tip-display-toggle');
    const exerciseDescription = modelPageContent.querySelector('.description');
    const exerciseVideoContainer = modelPageContent.querySelector('.video-container');
    const exerciseVideoEmbed = exerciseVideoContainer.querySelector('#video_embed')
    const exerciseVideoLink = exerciseVideoContainer.querySelector('#video_link');
    const exerciseTips = modelPageContent.querySelector('.tip-list');
    const exerciseTipsTitle = modelPageContent.querySelector('.tip-title');
    const backButton = document.querySelector('button.back');
    const helpButton = document.querySelector('button.help');
    const modelTitle = document.querySelector('h1.model-title');

    function isDesktop() {
        return window.innerWidth >= 992;
    }


    modelViewer = document.querySelector('model-viewer');
    const modelViewerBase = modelViewer.cloneNode(true);
    function reloadModelViewer(exercise) {
        const parentElement = modelViewer.parentElement;
        parentElement.removeChild(modelViewer);
        modelViewer = modelViewerBase.cloneNode(true);
        modelViewer.src = '../' + exercise.model_url; // Add one level up
        modelViewer.cameraOrbit = exercise.orbit ?? "0deg 90deg 0.5m";
        exercise.tips.forEach((tip, idx) => {
            if (typeof tip.coordinates !== "string") return; // Not defined, abort
            const hotspot = document.createElement('button');
            hotspot.classList.add('model-hotspot');
            hotspot.slot = 'hotspot-' + idx;
            hotspot.dataset.surface = tip.coordinates;
            hotspot.addEventListener('click', () =>  Swal.fire({
                    title: 'Tip',
                    text: tip.name,
                    color: '#04ac9c',
                    icon: 'info',
                    iconColor: '#04ac9c',
                    customClass: {title: 'cy-swal2-title', confirmButton: 'cy-swal2-confirm'},
                    confirmButtonText: 'OK!'
                })
            );
            const infoIcon = document.createElement('span');
            infoIcon.classList.add('material-symbols-outlined');
            infoIcon.innerText = 'tips_and_updates';
            hotspot.appendChild(infoIcon);
            modelViewer.appendChild(hotspot);
            if (tipDisplayToggle.classList.contains('active')) modelViewer.classList.add('show-hotspots');
        })
        parentElement.appendChild(modelViewer);
    }
    
    // Splash screen starts on, get data
    fetch('../exercises.json').then(res => res.json()).then(res => {
        // create category
        const categoryClass = isDesktop() ? 'category expanded' : 'category';
        const createCategory = (category) =>  {
            return `<section class="${categoryClass}">
                        <div class="name">
                            <div>
                                <span class="material-symbols-outlined icon">${category.icon ?? ''}</span class="name-text">${category.name}
                            </div>    
                            <span class="material-symbols-outlined control"></span>
                        </div>
                        <div class="exercise-list">` +
                        category.exercises.reduce((acc, ex) =>{
                            return acc + `<div class="exercise">
                                            <button data-exercise="${ex.id}">
                                                <span>${ex.name}</span><span class="material-symbols-outlined">chevron_right</span>
                                            </button>
                                        </div>`;
                        }, '') + 
                    `   </div>
                    </section>`;
        };
        const listContainer = document.querySelector('.list-container');
        listContainer.innerHTML = res.categories.reduce((acc, cat) => acc + createCategory(cat), '');
        
        // Get our list of exercises from the data in a hash id -> exercise
        const exercises = res.categories.reduce((acc, cat) => acc.concat(cat.exercises), []).reduce((acc, ex) => {
            acc[ex.id] = ex;
            return acc;
        }, {});

        // Category expansion (only for mobile)
        listContainer.querySelectorAll('.category > .name').forEach(catName => {
            const categoryElement = catName.parentElement;
            const exerciseList = categoryElement.querySelector('.exercise-list');
            if (!isDesktop()) collapseSection(exerciseList, false); // Do not collapse on desktop
            catName.addEventListener('click', () => {
                if (isDesktop()) return; // Do nothing on desktop
                // Close other expanded category if present
                const other = listContainer.querySelector('.category.expanded')
                if (other !== null && other !== categoryElement) {
                    other.classList.remove('expanded');
                    collapseSection(other.querySelector('.exercise-list'));
                } 
                // Toggle myself
                const isCollapsed = !categoryElement.classList.contains('expanded');
                categoryElement.classList.toggle('expanded');
                if(isCollapsed) {
                    expandSection(exerciseList)
                } else {
                    collapseSection(exerciseList)
                }
                
                
            })
        });


        let currentViewportIsDesktop = isDesktop();
        // Handles switching over to Mobile 
        window.addEventListener('resize', () => {
            if ((isDesktop() && currentViewportIsDesktop) || (!isDesktop() && !currentViewportIsDesktop)) return; // No change

            if (isDesktop()) {
                console.log("Switching to Desktop");
                listContainer.querySelectorAll('.category:not(.expanded)').forEach(c => { 
                    console.log("Expanding");
                    c.classList.add('expanded');
                    expandSection(c.querySelector('.exercise-list'));
                });
            } else {
                console.log("Switching to Mobile");
                listContainer.querySelectorAll('.category.expanded').forEach(c => {
                    console.log("Collapsing");
                    c.classList.remove('expanded')
                    collapseSection(c.querySelector('.exercise-list'));
                });
            }
            
            currentViewportIsDesktop = isDesktop();
        })
        
        // Exercise selection 
        listContainer.querySelectorAll('button').forEach(btn => {
            const exercise = exercises[btn.dataset.exercise];
            if (!exercise) return;
            btn.addEventListener('click', e => {
                reloadModelViewer(exercise);
                modelTitle.innerText = exercise.name;
                exerciseDescription.innerText = exercise.description;
                if (exercise.video_url) {
                    if (exercise.embed_video) { // Link or Embed
                        // Try parsing the URL and getting the v argument, if it fails, default to videoLink.
                        try {
                            const url = new URL(exercise.video_url);
                            const videoID = url.searchParams.get('v');
                            if(!videoID) throw new Error('Youtube VideoID (v param) not found!');
                            configureVideoEmbed(videoID);
                        } catch (err) {
                            console.error('ERROR! Could not set up YouTube embed!')
                            console.error(err);
                            configureVideoLink(exercise.video_url); // Default to video link if set up failed
                        }
                    } else {
                        configureVideoLink(exercise.video_url);
                    }
                   
                    exerciseVideoContainer.classList.remove('hide');
                } else {
                    exerciseVideoContainer.classList.add('hide');
                }
                if (exercise.tips.length > 0){ 
                    exerciseTips.innerHTML = exercise.tips.reduce((acc, tip) => acc + `<li>${tip.name}</li>`, '');
                    exerciseTipsTitle.classList.remove('hide');
                } else {
                    exerciseTipsTitle.classList.add('hide');
                }
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
        modelPageContent.classList.remove('expanded');
        modelPageContent.classList.remove('no-embed');
        model.classList.remove('open');
        list.classList.add('open');
    });

    helpButton.addEventListener('click', () => {
        Swal.fire({
            title: 'Ayuda',
            html: '<p>Elegí el ejercicio que quieras ver. Podés interactuar con el modelo 3D desde el navegador o verlo en realidad aumentada a través de tu cámara tocando el botón con el ícono <span class="material-symbols-outlined">view_in_ar</span>!</p>' + 
                '<p>Podés activar los tips sobre la animación tocando el ícono <span class="material-symbols-outlined">tips_and_updates</span> y ver los consejos tocando los tips!</p>',
            color: '#04ac9c',
            icon: 'question',
            iconColor: '#04ac9c',
            customClass: {title: 'cy-swal2-title', confirmButton: 'cy-swal2-confirm'},
            confirmButtonText: 'OK!'
          });
    })

    modelPageTab.addEventListener('click', () => modelPageContent.classList.toggle('expanded'));
    tipDisplayToggle.addEventListener('click', () => {
        tipDisplayToggle.classList.toggle('active');
        modelViewer.classList.toggle('show-hotspots');
    })


    function collapseSection(element, animate = true) {
        if (!animate) {
            element.style.height = 0 + 'px';
            return;
        }
        // get the height of the element's inner content, regardless of its actual size
        var sectionHeight = element.scrollHeight;
        
        // temporarily disable all css transitions
        var elementTransition = element.style.transition;
        element.style.transition = '';
        
        // on the next frame (as soon as the previous style change has taken effect),
        // explicitly set the element's height to its current pixel height, so we 
        // aren't transitioning out of 'auto'
        requestAnimationFrame(function() {
            element.style.height = sectionHeight + 'px';
            element.style.transition = elementTransition;
            
            // on the next frame (as soon as the previous style change has taken effect),
            // have the element transition to height: 0
            requestAnimationFrame(function() {
                element.style.height = 0 + 'px';
            });
        });
        
        // mark the section as "currently collapsed"
        element.setAttribute('data-collapsed', 'true');
    }
  
    function expandSection(element) {
        // get the height of the element's inner content, regardless of its actual size
        var sectionHeight = element.scrollHeight;
        
        // have the element transition to the height of its inner content
        element.style.height = sectionHeight + 'px';
    
        // when the next css transition finishes (which should be the one we just triggered)
        element.addEventListener('transitionend', function(e) {
            // remove this event listener so it only gets triggered once
            element.removeEventListener('transitionend', arguments.callee);
            
            // remove "height" from the element's inline styles, so it can return to its initial value
            element.style.height = null;
        });
        
        // mark the section as "currently not collapsed"
        element.setAttribute('data-collapsed', 'false');
    }
    

    function configureVideoLink(videoURL) {
        exerciseVideoLink.href = videoURL;
        exerciseVideoEmbed.classList.add('hide');
        exerciseVideoLink.classList.remove('hide');
        modelPageContent.classList.add('no-embed');
    }

    function configureVideoEmbed(videoID) {
        exerciseVideoEmbed.src  = `https://www.youtube.com/embed/${videoID}`;
        exerciseVideoLink.classList.add('hide');
        exerciseVideoEmbed.classList.remove('hide');
        modelPageContent.classList.remove('no-embed');
    }
});