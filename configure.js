document.addEventListener('DOMContentLoaded', () => {
    // Number Inputs
    const repsInput = document.getElementById('reps_input');
    const seriesInput = document.getElementById('series_input');
    const weightInput = document.getElementById('weight_input');
    const upInput = document.getElementById('up_input');
    const pauseUpInput = document.getElementById('pause_up_input');
    const downInput = document.getElementById('down_input');
    const pauseDownInput = document.getElementById('pause_down_input');
    const restInput = document.getElementById('rest_input');
    
    // RIR/RPE Select
    const RIRRPESelect = document.getElementById("rir_rpe_select");
    const RIRRPEInput = document.getElementById("rir_rpe_input");
    RIRRPESelect.addEventListener("change", (e) => {
        switch (e.target.value) {
            case "NONE":
                RIRRPEInput.setAttribute("disabled", "true");
                RIRRPEInput.value = "";
                RIRRPEInput.placeholder = "";
            return;
            case "RIR":
            case "RPE":
                RIRRPEInput.removeAttribute("disabled");
                RIRRPEInput.value = "";
                RIRRPEInput.placeholder = e.target.value;
            return;
        }
    });

    function getQueryParams() {
        const urlParams = new URLSearchParams();
        urlParams.set('ex_id', excerciseId);
        if(repsInput.value != "") urlParams.set('nr', repsInput.value);
        if(seriesInput.value != "") urlParams.set('ns', seriesInput.value);
        if(weightInput.value != "") urlParams.set('w', weightInput.value);
        if(upInput.value != "") urlParams.set('tr', upInput.value);
        if(pauseUpInput.value != "") urlParams.set('tu', pauseUpInput.value);
        if(downInput.value != "") urlParams.set('tf', downInput.value);
        if(pauseDownInput.value != "") urlParams.set('td', pauseDownInput.value);
        if(restInput.value != "") urlParams.set('tw', restInput.value);
        if(RIRRPESelect.value != "NONE" && RIRRPEInput.value != "") urlParams.set(RIRRPESelect.value.toLowerCase(), RIRRPEInput.value);
        return urlParams;
    }
    // Loading
    const params = new URLSearchParams(window.location.search);
    // Find our desired exercise
    if (!params.has('ex_id')) {
        console.error('Error: Exersie ID not specified! Aborting');
        return;
    }
    const excerciseId = params.get('ex_id');

    fetch('./exercises.json').then(res => res.json()).then(res => {
        // Get our list of exercises from the data.
        const exercises = res.categories.reduce((acc, cat) => acc.concat(cat.exercises), []);    
        const exercise = exercises.find(ex => ex.id == excerciseId);
        if (!exercise) {
            console.error('Error: Exercise ID not found! Aborting');
            return;
        }
        loadModelViewer(exercise);
    });

    // Generate Button
    document.querySelector('.generate').addEventListener('click', () => {
        const urlParams = getQueryParams();
        const shareTextContent = 'Copiá el link o escaneá el QR';
        const successCopyText = 'Copiado!';
        // Otherwhise modal with a link + QR
        // If user cannot use AR here, we prompt them to view in mobile device
        launchModal(
            'Ejercicio Configurado!',
            `<div class="share-container">
                <p class="share-text">${shareTextContent}</p>
                <div class="share-link"><a href="#">${window.location.origin}/?${urlParams.toString()}</a><i class="bi bi-clipboard"></i></div>
                <div id="qr-code"></div>
            </div>`,
            'share-modal'
        );
    
        const shareLink = document.querySelector('.share-link');
        const shareText = document.querySelector('.share-text');
    
        shareLink.addEventListener('click', () => {
            navigator.clipboard.writeText(`${window.location.origin}/?${urlParams.toString()}`);
            const bi = shareLink.querySelector('.bi');
            bi.classList.remove('bi-clipboard');
            bi.classList.add('bi-clipboard-check');
            shareText.innerText = successCopyText;
            // Reset back after a while
            setTimeout(() => {
                shareText.innerText = shareTextContent;
                bi.classList.remove('bi-clipboard-check');
                bi.classList.add('bi-clipboard');
            }, 2000)
        });
    
        new QRCode(document.getElementById('qr-code'), {
            text: `${window.location.origin}/?${urlParams.toString()}`,
            width: 256,
            height: 256,
            colorDark: "#04ac9c",
            correctLevel : QRCode.CorrectLevel.H
        });
    });

    // Preview Buttons 
    document.querySelectorAll('.btn.preview').forEach(e => 
        e.addEventListener('click', () => window.open(`${window.location.origin}/?${getQueryParams().toString()}`, "_blank")));

    // Arrow Back Button 
    document.querySelector('.navbar-brand > .material-symbols-outlined').addEventListener('click', () => window.close());
});

// Page Setup
function loadModelViewer(exercise) {
    document.querySelector('model-viewer').src = exercise.model_url;
    document.querySelector('.exercise-name').innerText = exercise.name;
}

function launchModal(title, html, container) {
    Swal.fire({
        title,
        html,
        confirmButtonText: 'OK!',
        customClass: {container, title: 'cy-swal2-title', confirmButton: 'cy-swal2-confirm'},
    })
}