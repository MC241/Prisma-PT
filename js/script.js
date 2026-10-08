document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    const page = path.split("/").pop().replace(".html", "");

    if (page === "index" || page === ""){
        initIntroAnimation();
    }else if (page === "perfil"){
        initProfileSliders();
    }else if (page === "destaque"){
        initAudioPlay();
    }
});


//Animation for app opening 
function initIntroAnimation(){

    let ctaPulse;

    gsap.set('#tri-green, #tri-yellow, #tri-red, #tri-darkred',{
        opacity:0,
        transformOrigin: "44px 134px"
    });

    gsap.set("#tri-blue", {opacity:0});

    gsap.timeline({
        onComplete: () => {
            ctaPulse = gsap.to("#cta", {
                scale:1.1,
                duration:0.8,
                repeat:-1,
                yoyo:true,
                ease:"power1.inOut"
            });
        }
    })
    .fromTo("#box", {y: "100vh"}, {y: 0, duration: 1, ease: "back.out(0.7)"})
    .fromTo("#box", {scale: 1}, {scale: 2, duration: 1, ease: "power2.out"})
    .to("#box", {rotate: -45},"<")
    .to("#box", {y:"-6vh", opacity:1})
    .to("#tri-blue", {opacity:1, duration:0.5, ease: "power1"}, "+=0.2")
    .to("#tri-green", {opacity:1, duration:0.5, ease: "power1"}, "-=0.2")
    .to("#tri-yellow", {opacity:1, duration:0.5, ease: "power1"}, "-=0.2")
    .to("#tri-red", {opacity:1, duration:0.5, ease: "power1"}, "-=0.2")
    .to("#tri-darkred", {opacity:1, duration:0.5, ease: "power1"}, "-=0.2")
    .fromTo("#title", {y: "3vh", opacity:0}, {opacity:1})
    .fromTo("#welcome", {y: "3vh", opacity:0}, {opacity:1})
    .fromTo("#slogan", {y: "5vh", opacity:0}, {opacity:1})
    .fromTo("#cta", {y: "20vh", opacity:0}, {opacity:1});

    document.addEventListener("click", () => {
        if(ctaPulse) ctaPulse.kill();
        gsap.to(".main-container-anim", {
            y: "-100vh",
            duration:0.5,
            ease:"power2.inOut",
            onComplete: () => {
                window.location.href = "home.html";
            }
        });
    }, {once:true});
}

//Animation for audio news
function initAudioPlay(){
    const audio = document.getElementById("destaqueAudio");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const playIcon = document.getElementById("playIcon");
    const skipStartBtn = document.getElementById("skipStart");
    const skipEndBtn = document.getElementById("skipEnd");
    const volumeBtn = document.getElementById("volume");
    const progressContainer = document.getElementById("audioProgress");
    const progressBar = document.getElementById("audioProgressBar");

    const playIconSrc = "./assets/icons/play_btn_circle.svg";
    const pauseIconSrc = "./assets/icons/pause_btn_circle.svg";

    //Play/pause audio
    playPauseBtn.addEventListener("click", () => {
        if (audio.paused) {
            audio.play();
        }else{
        audio.pause();
        }
    });

    //When audio starts playing - show pause icon
    audio.addEventListener("play", () => {
        playIcon.src = pauseIconSrc;
        playPauseBtn.setAttribute("aria-label", "Pausar");
    });

    //When audio is paused- show play icon
    audio.addEventListener("pause", () => {
        playIcon.src = playIconSrc;
        playPauseBtn.setAttribute("aria-label", "Reproduzir");
    });

    //Skip button, skips 10 seconds behind in the audio
    skipStartBtn.addEventListener("click", () => {
        audio.currentTime = Math.max(0, audio.currentTime - 10);
    });

    //Skip button, skips ten seconds ahead in the audio
    skipEndBtn.addEventListener("click", () => {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
    });

    //Muting and unmuting the audio + changing volume icon to mute or unmuted depending on the state
    volumeBtn.addEventListener("click", () => {
        //Toggle the muted state
        audio.muted = !audio.muted;
        const volumeIcon = volumeBtn.querySelector("i");
        if(audio.muted){
            volumeIcon.className="bi bi-volume-mute fs-4";
            volumeBtn.setAttribute("aria-label", "Ativar som");
        }else{
            volumeIcon.className="bi bi-volume-up fs-4";
            volumeBtn.setAttribute("aria-label", "Silenciar");
        }
    });

    // Updating progress bar as audio plays
    audio.addEventListener("timeupdate", () => {
        if(audio.duration){
            const percent = (audio.currentTime/audio.duration)*100;
            //Buils a string by inserting the value of percent variable into it
            progressBar.style.width = `${percent}%`;
            progressContainer.setAttribute("aria-valuenow", Math.round(audio.currentTime));
        }
    });

    //Setting the aria-valuemax once the audio's duration is known
    audio.addEventListener("loadedmetadata", () => {
        progressContainer.setAttribute("aria-valuemax", Math.round(audio.duration));
    });

    //Allowing user to click at a specific point in the progress bar to skip to that part of the audio
    progressContainer.addEventListener("click", (event) => {
        if (audio.duration){
            //getBoundingClientRect(): build in method that returns an object describing the element's size and position on the screen
            const rect = progressContainer.getBoundingClientRect();
            //event.clickX: horizontal position of the click, measured from left edge of the browser window
            //rect.left: bar's left edge, also measured from the left edge of the window
            //subtraction: how far the click is from tge bar's own left edge
            const clickX = event.clientX - rect.left;
            //Converting pixels to percentage
            const percent = clickX / rect.width;
            //Converting percentage into actual time in seconds
            audio.currentTime = percent * audio.duration;
        }
    });

    //When the audio ends, resetting the progress bar, the audio time and the play button
    audio.addEventListener("ended", () => {
        playIcon.src = playIconSrc;
        playPauseBtn.setAttribute("aria-label", "Reproduzir");
        progressBar.style.width = "0%";
        audio.currentTime = 0;
    });
}

//Animations for screen time and reminder sliders
function initProfileSliders() {

    //Placeholder for current daily usage for example purposes
    const currentUsage = 30;
    //Getting all the elements
    const usageMinutes = document.getElementById("usageMinutes");
    const usageProgressBar = document.getElementById("usageProgressBar");
    const dailyLimitValue = document.getElementById("dailyLimitValue");
    const dailyLimitSlider = document.getElementById("dailyLimitSlider");
    const reminderValue = document.getElementById("reminderValue");
    const reminderSlider = document.getElementById("reminderSlider");
    const reminderDisplay = document.getElementById("reminderDisplay");
    const snapToFive = gsap.utils.snap(5);


    //Updating progress bar of today's time usage based on how much of the daily usage limit has been consumed
    function updateUsageProgress(){
        const dailyLimit = parseInt(dailyLimitSlider.value);
        const percentage = Math.min((currentUsage / dailyLimit) * 100, 100);
        gsap.to(usageProgressBar, {
            width: `${percentage}%`,
            duration: 0.4,
            ease: "power2.out",
        });
        //Changing the color of time usage bar depending on the use's time consumption that is left
        if (percentage>=100) {
            usageProgressBar.className = "progress-bar bg-danger";
        }else if(percentage >=75){
            usageProgressBar.className = "progress-bar bg-warning";
        }else{
            usageProgressBar.className = "progress-bar bg-primary";
        }
        const progressContainer = usageProgressBar.parentElement;
        progressContainer.setAttribute("aria-valuenow", currentUsage);
        progressContainer.setAttribute("aria-valuemax", dailyLimit);
    }
    
    function animateNumber(element, newValue){
        const counter={value:parseInt(element.textContent)||0};
        gsap.to(counter, {
            value: newValue,
            duration: 0.3,
            snap: {value: 5},
            ease: "power2.out",
            onUpdate: () => {
                element.textContent = counter.value;
            }
        });
    }

    dailyLimitSlider.addEventListener("input", () => {
        const newValue = snapToFive(parseInt(dailyLimitSlider.value));
        animateNumber(dailyLimitValue, newValue);
        updateUsageProgress();
    });

    reminderSlider.addEventListener("input", () => {
        const newValue = snapToFive(parseInt(reminderSlider.value));
        animateNumber(reminderValue, newValue);
        animateNumber(reminderDisplay, newValue);
    });

    usageMinutes.textContent = `${currentUsage}m`;
    updateUsageProgress();

}
