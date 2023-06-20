document.addEventListener('DOMContentLoaded', () => {
    const modelViewer = document.querySelector('model-viewer');
    const modelPageContent =  document.querySelector('.subpage.model > .content');
    const modelPageTab = modelPageContent.querySelector('.tab')
    const tipDisplayToggle = modelPageContent.querySelector('.tip-display-toggle');
    const exerciseDescription = modelPageContent.querySelector('.description');
    const exerciseVideoContainer = modelPageContent.querySelector('.video-container');
    const exerciseVideoEmbed = exerciseVideoContainer.querySelector('#video_embed')
    const exerciseVideoLink = exerciseVideoContainer.querySelector('#video_link');
    const exerciseTips = modelPageContent.querySelector('.tip-list');
    const exerciseTipsTitle = modelPageContent.querySelector('.tip-title');
    const modelTitle = document.querySelector('h1.model-title');

    function loadModelViewer(exercise) {
        modelViewer.src = exercise.model_url;
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
        });
    }
    
    // Splash screen starts on, get data
    fetch('./exercises.json').then(res => res.json()).then(res => {
        // Get our list of exercises from the data.
        const exercises = res.categories.reduce((acc, cat) => acc.concat(cat.exercises), []);
        // Find our desired exercise
        const exercise = exercises[3];
        loadModelViewer(exercise);
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
    });

    modelPageTab.addEventListener('click', () => modelPageContent.classList.toggle('expanded'));
    tipDisplayToggle.addEventListener('click', () => {
        tipDisplayToggle.classList.toggle('active');
        modelViewer.classList.toggle('show-hotspots');
    });
    
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