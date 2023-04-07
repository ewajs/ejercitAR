let modelViewer;
document.addEventListener('DOMContentLoaded', () => {
    const splash = document.querySelector('.subpage.splash');
    const list = document.querySelector('.subpage.list');
    const model = document.querySelector('.subpage.model');
    const modelPageContent =  document.querySelector('.subpage.model > .content');
    const exerciseDescription = modelPageContent.querySelector('.description');
    const exerciseVideo = modelPageContent.querySelector('#video');
    const exerciseTips = modelPageContent.querySelector('.tip-list');
    const exerciseTipsTitle = modelPageContent.querySelector('.tip-title');
    const backButton = document.querySelector('button.back');
    const helpButton = document.querySelector('button.help');
    const modelTitle = document.querySelector('h1.model-title');


    modelViewer = document.querySelector('model-viewer');
    const modelViewerBase = modelViewer.cloneNode(true);
    function reloadModelViewer(exercise) {
        const parentElement = modelViewer.parentElement;
        parentElement.removeChild(modelViewer);
        modelViewer = modelViewerBase.cloneNode(true);
        modelViewer.src = exercise.model_url;
        modelViewer.cameraOrbit = exercise.orbit ?? "0deg 90deg 0.5m";
        parentElement.appendChild(modelViewer);
    }
    
    // Splash screen starts on, get data
    fetch('./exercises.json').then(res => res.json()).then(res => {
        // create category
        const createCategory = (category) =>  {
            return `<section class="category">
                        <div class="name">
                            <div>
                                <span class="material-symbols-outlined icon">${category.icon ?? ''}</span class="name-text">${category.name}
                            </div>    
                            <span class="material-symbols-outlined control"></span>
                        </div>
                        <div class="excercise-list">` +
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

        // Category expansion
        listContainer.querySelectorAll('.category > .name').forEach(catName => {
            const categoryElement = catName.parentElement;
            const excerciseList = categoryElement.querySelector('.excercise-list');
            collapseSection(excerciseList, false)
            catName.addEventListener('click', () => {
                // Close other expanded category if present
                const other = listContainer.querySelector('.category.expanded')
                if (other !== null && other !== categoryElement) {
                    other.classList.remove('expanded');
                    collapseSection(other.querySelector('.excercise-list'));
                } 
                // Toggle myself
                const isCollapsed = !categoryElement.classList.contains('expanded');
                categoryElement.classList.toggle('expanded');
                if(isCollapsed) {
                    expandSection(excerciseList)
                } else {
                    collapseSection(excerciseList)
                }
                
                
            })
        });
        
        // Exercise selection 
        listContainer.querySelectorAll('button').forEach(btn => {
            const exercise = exercises[btn.dataset.exercise];
            if (!exercise) return;
            btn.addEventListener('click', e => {
                reloadModelViewer(exercise);
                modelTitle.innerText = exercise.name;
                exerciseDescription.innerText = exercise.description;
                if (exercise.video_url) {
                    exerciseVideo.href = exercise.video_url;
                    exerciseVideo.classList.remove('hide');
                } else {
                    exerciseVideo.classList.add('hide');
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

    modelPageContent.querySelector('.tab').addEventListener('click', () => modelPageContent.classList.toggle('expanded'));


    // This is the important part!

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
  
});