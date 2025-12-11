const elements = {
    div: {
        angle: document.getElementById('angle'),
        missileTimer: document.getElementById('missile-timer'),
        droneTimer: document.getElementById('drone-timer'),
        droneX: document.getElementById('drone-x'),
        droneY: document.getElementById('drone-y'),
        missileX: document.getElementById('missile-x'),
        missileY: document.getElementById('missile-y'),
        hitX: document.getElementById('hit-x'),
        hitY: document.getElementById('hit-y'),
        timers: document.getElementById('timers'),
        overlay: document.getElementById('overlay'),
        positions: document.getElementById('positions'),
        eta: document.getElementById('eta'),
    },
    button: {
        /** @type {HTMLButtonElement} */
        start: document.getElementById('start'),
        /** @type {HTMLButtonElement} */
        launch: document.getElementById('launch')
    },
    img: {
        drone: document.getElementById('drone-image'),
        key: document.getElementById('key')
    }
}

let droneTimer;
let missileTimer;

function main() {
    elements.button.launch.disabled = true;
    elements.button.start.disabled = true;
    elements.button.start.addEventListener('mousedown', startDrone);
    elements.button.launch.addEventListener('mousedown', launch);
    elements.img.key.addEventListener('mousedown', () => {
        elements.img.key.src = 'images/key2.png';
        elements.button.start.disabled = false;
    }, { once: true });
    
    startDroneMovement();
}

function startDroneMovement() {
    setInterval(() => {
        elements.img.drone.style.transform = 'translateY(30px)';
    }, 2000);
    setTimeout(() => {
        setInterval(() => {
            elements.img.drone.style.transform = 'translateY(0px)';
        }, 2000);
    }, 1000);
}

function startDrone() {
    droneTimer = new Timer(elements.div.droneTimer);
    droneTimer.start();

    // Stops the user from launching the missile at an impossible angle. 
    // Anything below 6.63 seconds will yield impossible results.
    setTimeout(() => {
        elements.button.launch.disabled = false;
        elements.button.launch.className = 'launch-enabled';
    }, 6.63 * 1000);
    elements.div.timers.classList.add('down');
    elements.button.start.disabled = true;
}

function launch() {
    droneTimer.stop();
    missileTimer = new Timer(elements.div.missileTimer);
    missileTimer.start();
    elements.button.launch.disabled = true;

    const droneSpeed = Math.sqrt(8) / droneTimer.elapsedTime * 1000;
    const droneAngle = 45;
    const droneX = 7;
    const droneY = 8;
    const droneXDiv = elements.div.droneX;
    const droneYDiv = elements.div.droneY;
    const drone = new FlyingObject(
        droneSpeed,
        droneAngle,
        droneX,
        droneY,
        droneXDiv,
        droneYDiv,
    );

    drone.start();

    const missileSpeed = 768 * 2 / 3600;
    const missileAngle = Math.acos(droneSpeed * Math.cos(Math.PI / 4) / missileSpeed) * 180 / Math.PI;
    const missileX = 7;
    const missileY = 0;
    const missileXDiv = elements.div.missileX;
    const missileYDiv = elements.div.missileY;
    const missile = new FlyingObject(
        missileSpeed,
        missileAngle,
        missileX,
        missileY,
        missileXDiv,
        missileYDiv,
    );
    missile.start();

    const hitTime = 8 / (missileSpeed * Math.sin(missileAngle * Math.PI / 180) - droneSpeed * Math.sin(Math.PI / 4));

    setTimeout(() => {
        missile.stop();
        drone.stop();
        missileTimer.stop();
        elements.img.drone.src = 'images/explosion.gif';
        setTimeout(() => {
            elements.img.drone.remove();
        }, 510);
        // setTimeout(() => {
        //     elements.div.overlay.style.zIndex = '1';
        //     elements.div.overlay.style.opacity = '1';
        // }, 6000);
    }, hitTime * 1000);

    const hitHeight = missileSpeed * Math.sin(missileAngle * Math.PI / 180) * hitTime;
    const hitDisplacement = missileSpeed * Math.cos(missileAngle * Math.PI / 180) * hitTime + 7;

    elements.div.hitX.textContent = hitDisplacement.toFixed(2);
    elements.div.hitY.textContent = hitHeight.toFixed(2);

    elements.div.angle.textContent = `${missileAngle.toFixed(2)}\u00B0`;
    elements.div.angle.classList.add('enabled');

    elements.div.positions.classList.add('enabled');

    const spanMin = document.createElement('span');
    spanMin.textContent = Math.floor(hitTime / 60);

    const spanSec = document.createElement('span');
    spanSec.textContent = (hitTime % 60).toFixed(1);

    elements.div.eta.textContent = 'ETA: ';
    elements.div.eta.append(spanMin);
    elements.div.eta.textContent += ' MIN ';
    elements.div.eta.append(spanSec);
    elements.div.eta.textContent += ' SEC';
}

class Timer {
    constructor(
        div
    ) {
        this.div = div;
        this.elapsedTime;
        this.intervalId;
        this.startTime = performance.now();
    }
    start() {
        this.intervalId = setInterval(() => {
            this.elapsedTime = performance.now() - this.startTime;
            const minutes = Math.floor(this.elapsedTime / 60000);
            const seconds = Math.floor((this.elapsedTime / 1000) % 60);
            const milliseconds = Math.floor(this.elapsedTime % 1000);
            this.div.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;
        }, 40);
    }
    stop() {
        clearInterval(this.intervalId);
    }
}

class FlyingObject {
    constructor(
        speed,
        angle,
        positionX,
        positionY,
        divX,
        divY,
        name
    ) {
        this.speed = speed;
        this.angle = angle;
        this.positionX = positionX;
        this.initialPositionX = positionX;
        this.positionY = positionY;
        this.initialPositionY = positionY;
        this.intervalId;
        this.divX = divX;
        this.divY = divY;
        this.name = name;
        this.startTime = performance.now();
        this.elapsedTime;
    }
    start() {
        const angleRadians = this.angle * Math.PI / 180;
        this.intervalId = setInterval(() => {
            this.elapsedTime = performance.now() - this.startTime;

            const calculatedX = this.speed * Math.cos(angleRadians) * this.elapsedTime / 1000 + this.initialPositionX;
            const calculatedY = this.speed * Math.sin(angleRadians) * this.elapsedTime / 1000 + this.initialPositionY;

            this.positionX = calculatedX.toFixed(2).padStart(5, '0');
            this.positionY = calculatedY.toFixed(2).padStart(5, '0');

            this.divX.textContent = this.positionX;
            this.divY.textContent = this.positionY;
        }, 10);
    }
    stop() {
        clearInterval(this.intervalId);
    }
}

main();