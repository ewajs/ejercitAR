document.addEventListener('DOMContentLoaded', () => {
    const splash = document.querySelector('.subpage.splash');
    const model = document.querySelector('.subpage.model');
    const params = new URLSearchParams(window.location.search);
    // Find our desired exercise
    if (!params.has('ex_id')) {
        console.error('Error: Exersie ID not specified! Aborting');
        return;
    }
   
    fetch('./exercises.json').then(res => res.json()).then(res => {
        // Get our list of exercises from the data.
        const exercises = res.categories.reduce((acc, cat) => acc.concat(cat.exercises), []);    
        const exercise = exercises.find(ex => ex.id == params.get('ex_id'));
        if (!exercise) {
            console.error('Error: Exercise ID not found! Aborting');
            return;
        }
        setUpPage(exercise);
        trackLoad(exercise);
        console.log("Load");
        // Show the list screen & lift the splash screen
        splash.classList.remove('open');
        model.classList.add('open');
    });
});

function launchTimer(config) {
    const INTERVAL_PERIOD = 1000;
    const {phases, repetitions} = config;
    const timer = document.querySelector('.timer-overlay');
    const phaseName = timer.querySelector('.phase > .phase-name');
    const phaseTime = timer.querySelector('.phase > .phase-time')
    const tick = new Audio('/audio/tick.mp3');
    const phaseEnd = new Audio('/audio/phase_end.mp3');
    const repetitionEnd = new Audio('/audio/repetition_end.mp3');
    const seriesEnd = new Audio('/audio/series_end.mp3');
    timer.classList.add('active', 'pulse');
    let currentRep = 0;
    let currentPhase = 0;
    let currentTick = 0;

    function setPhase() {
        phaseName.innerText = phases[currentPhase].name;
        phaseTime.innerText = phases[currentPhase].duration - currentTick;
    }

    setPhase();

    let interval = setInterval(() => {
        currentTick += 1;
        // Check for events in order of priority
        // Phase End
        if(phases[currentPhase].duration === currentTick) {
            currentTick = 0;
            currentPhase += 1;
            // Repetition End
            if (currentPhase === phases.length) {
                currentPhase = 0;
                currentRep += 1;
                // Series end, stop the timer
                if (currentRep === repetitions) {
                    clearInterval(interval);
                    timer.classList.remove('active', 'pulse');
                    console.log("Series End!");
                    seriesEnd.play();
                    return;
                }
                console.log("Repetition End!");
                repetitionEnd.play();
                return;
            }
            console.log("Phase End!");
            phaseEnd.play();
            return;
        }
        switch(phases[currentPhase].style) {
            default:
            case "all":
                timer.classList.remove('child-pulse');
                timer.classList.toggle('pulse');
                break;
            case "children":
                timer.classList.add('child-pulse');
                timer.querySelectorAll('.phase, .stop').forEach(child => child.classList.toggle('pulse'));
                break;
        }
        console.log("Tick!");
        setPhase();
        tick.play();
    }, INTERVAL_PERIOD);
    
}

// Page Setup
function loadModelViewer(exercise) {
    const modelViewer = document.querySelector('model-viewer');
    modelViewer.src = exercise.model_url;
    modelViewer.cameraOrbit = exercise.orbit ?? "0deg 90deg 0.5m";
    exercise.tips.forEach((tip, idx) => {
        if (typeof tip.coordinates !== "string") return; // Not defined, abort
        const hotspot = document.createElement('button');
        hotspot.classList.add('model-hotspot');
        hotspot.slot = 'hotspot-' + idx;
        hotspot.dataset.surface = tip.coordinates;
        hotspot.addEventListener('click', () =>  {
            // Fire Tip Info Modal and Track
            Swal.fire({
                title: 'Tip',
                text: tip.name,
                color: '#04ac9c',
                icon: 'info',
                iconColor: '#04ac9c',
                customClass: {title: 'cy-swal2-title', confirmButton: 'cy-swal2-confirm'},
                confirmButtonText: 'OK!'
            });
            trackTipView(exercise, tip);
            console.log("Tip View");
        });
        const infoIcon = document.createElement('span');
        infoIcon.classList.add('material-symbols-outlined');
        infoIcon.innerText = 'tips_and_updates';
        hotspot.appendChild(infoIcon);
        modelViewer.appendChild(hotspot);
    });
}

function setUpComponents(exercise) {
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
    const modelViewer = document.querySelector('model-viewer');

    function configureVideoLink() {
        exerciseVideoLink.href = exercise.video_url;
        exerciseVideoEmbed.classList.add('hide');
        exerciseVideoLink.classList.remove('hide');
        modelPageContent.classList.add('no-embed');
    }

    function configureVideoEmbed() {
        const url = new URL(exercise.video_url);
        const videoID = url.searchParams.get('v');
        if(!videoID) throw new Error('Youtube VideoID (v param) not found!');

        exerciseVideoEmbed.src  = `https://www.youtube.com/embed/${videoID}`;
        exerciseVideoLink.classList.add('hide');
        exerciseVideoEmbed.classList.remove('hide');
        modelPageContent.classList.remove('no-embed');
    }

    modelTitle.innerText = exercise.name;
    exerciseDescription.innerText = exercise.description;
    if (exercise.video_url) {
        if (exercise.embed_video) { // Link or Embed
            // Try parsing the URL and getting the v argument, if it fails, default to videoLink.
            try {
                configureVideoEmbed();
            } catch (err) {
                console.error('ERROR! Could not set up YouTube embed!')
                console.error(err);
                configureVideoLink(); // Default to video link if set up failed
            }
        } else {
            configureVideoLink();
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
        tipDisplayToggle.classList.add('hide');
    }

    modelPageTab.addEventListener('click', () => {
        modelPageContent.classList.toggle('expanded');
        if (modelPageContent.classList.contains('expanded')) trackInfoView(exercise);
    });

    document.querySelector('.ar-button').addEventListener('click', () => trackARView(exercise));

    tipDisplayToggle.addEventListener('click', () => {
        tipDisplayToggle.classList.toggle('active');
        modelViewer.classList.toggle('show-hotspots');
    });
}

function setUpPage(exercise) {
    loadModelViewer(exercise);
    setUpComponents(exercise);
}

function trackLoad(exercise) {
    const {id, name} = exercise;
    trackGAEvent('exercise_load', {id, name});
}

function trackInfoView(exercise) {
    const {id, name} = exercise;
    trackGAEvent('info_view', {id, name});
}

function trackARView(exercise) {
    const {id, name} = exercise;
    trackGAEvent('ar_view', {id, name});
}

function trackTipView(exercise, tip) {
    const {id, name} = exercise;
    trackGAEvent('tip_view', {id, name, tip_name: tip.name});
}

function trackGAEvent(name, params) {
    console.log(`Tracking event: ${name} - with params: ${JSON.stringify(params)}`);
    gtag('event', name, params);
}