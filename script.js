// Initial Game Variables with Default Values
let totalResources = 0;
let productionRate = 1;
let upgradeLevel = 1;
let upgradeCost = 10;
let totalMinerals = 0;
let totalISK = 0;
let maxStorage = 100; // Initial storage capacity

// Ship and Mining Variables
const ships = {
    basic: { yieldMultiplier: 1, timeMultiplier: 1 },
    advanced: { yieldMultiplier: 2, timeMultiplier: 0.75 },
    elite: { yieldMultiplier: 3, timeMultiplier: 0.5 }
};
let selectedShip = ships.basic;

// Mineral Prices (per unit in ISK)
const mineralPrices = {
    Veldspar: 5,
    Scordite: 10,
    Pyroxeres: 15,
    Plagioclase: 20,
    Omber: 25,
    Kernite: 30,
    Jaspet: 35,
    Hemorphite: 40,
    Hedbergite: 45,
    Gneiss: 50,
    DarkOchre: 55,
    Crokite: 60,
    Bistot: 65,
    Arkonor: 70,
    Spodumain: 75,
    Mercoxit: 80
};

// HTML Elements
const totalResourcesElement = document.getElementById('total-resources');
const productionRateElement = document.getElementById('production-rate');
const upgradeLevelElement = document.getElementById('upgrade-level');
const upgradeCostElement = document.getElementById('upgrade-cost');
const logElement = document.getElementById('log');
const upgradeBtn = document.getElementById('upgrade-btn');
const totalMineralsElement = document.getElementById('total-minerals');
const totalISKElement = document.getElementById('total-isk');
const maxStorageElement = document.getElementById('max-storage');
const mineButtons = document.querySelectorAll('.mine-btn');
const shipSelect = document.getElementById('ship-select');
const eventLog = document.getElementById('event-log');
const disclaimerModal = document.getElementById('disclaimer-modal');
const acceptDisclaimerButton = document.getElementById('accept-disclaimer');

// Auto-Save Function
function saveGame() {
    const gameState = {
        totalResources,
        productionRate,
        upgradeLevel,
        upgradeCost,
        totalMinerals,
        totalISK,
        maxStorage,
        selectedShip: shipSelect.value
    };
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

// Auto-Load Function
function loadGame() {
    const savedGameState = JSON.parse(localStorage.getItem('gameState'));
    if (savedGameState) {
        totalResources = savedGameState.totalResources || 0;
        productionRate = savedGameState.productionRate || 1;
        upgradeLevel = savedGameState.upgradeLevel || 1;
        upgradeCost = savedGameState.upgradeCost || 10;
        totalMinerals = savedGameState.totalMinerals || 0;
        totalISK = savedGameState.totalISK || 0;
        maxStorage = savedGameState.maxStorage || 100;
        selectedShip = ships[savedGameState.selectedShip] || ships.basic;

        // Update UI with loaded values
        updateUI();
    } else {
        // Initialize with default values
        updateUI();
    }
}

// Function to Update UI Elements
function updateUI() {
    totalResourcesElement.innerText = totalResources;
    productionRateElement.innerText = productionRate;
    upgradeLevelElement.innerText = upgradeLevel;
    upgradeCostElement.innerText = upgradeCost;
    totalMineralsElement.innerText = totalMinerals;
    totalISKElement.innerText = totalISK;
    maxStorageElement.innerText = maxStorage;
    shipSelect.value = Object.keys(ships).find(key => ships[key] === selectedShip);
}

// Function to Update Resource Count
function updateResources() {
    totalResources += productionRate;
    totalResourcesElement.innerText = totalResources;
    log(`Produced ${productionRate} resources. Total: ${totalResources}`);
    saveGame(); // Save game state after updating resources
}

// Function to Log Messages in the Game
function log(message) {
    const logMessage = document.createElement('p');
    logMessage.innerText = message;
    logElement.appendChild(logMessage);
    logElement.scrollTop = logElement.scrollHeight; // Auto-scroll to the bottom
}

// Upgrade Function
function upgradeFacility() {
    if (totalResources >= upgradeCost) {
        totalResources -= upgradeCost;
        upgradeLevel++;
        productionRate++;
        upgradeCost = Math.floor(upgradeCost * 1.5);
        maxStorage += 50; // Increase storage with each upgrade

        updateUI(); // Update UI after changes
        log(`Upgraded to level ${upgradeLevel}. New production rate: ${productionRate} per second. Storage increased to ${maxStorage}.`);
        saveGame(); // Save game state after upgrading
    } else {
        log(`Not enough resources to upgrade! Need ${upgradeCost - totalResources} more.`);
    }
}

// Mining Function
function mineAsteroid(asteroidType) {
    const timeMultiplier = selectedShip.timeMultiplier;
    const yieldMultiplier = selectedShip.yieldMultiplier;
    const miningTime = 2000 * timeMultiplier; // Base mining time adjusted by ship

    setTimeout(() => {
        const mineralAmount = Math.floor((Math.random() * 10 + 1) * yieldMultiplier); // Random amount adjusted by ship
        if (totalMinerals + mineralAmount <= maxStorage) {
            totalMinerals += mineralAmount;
            totalISK += mineralAmount * mineralPrices[asteroidType];
            updateUI(); // Update UI after mining
            log(`Mined ${mineralAmount} units of ${asteroidType}. Earned ${mineralAmount * mineralPrices[asteroidType]} ISK.`);
            saveGame(); // Save game state after mining
        } else {
            log("Storage is full! Upgrade storage or sell minerals.");
        }
    }, miningTime);
}

// Handle Ship Selection
shipSelect.addEventListener('change', (event) => {
    selectedShip = ships[event.target.value];
    log(`Selected ${event.target.options[event.target.selectedIndex].text}`);
    saveGame(); // Save game state after selecting a ship
});

// Event Listener for Upgrade Button
upgradeBtn.addEventListener('click', upgradeFacility);

// Event Listeners for Mining Buttons
mineButtons.forEach(button => {
    button.addEventListener('click', () => {
        mineAsteroid(button.getAttribute('data-asteroid'));
    });
});

// Asteroid Events (Random Events)
function triggerAsteroidEvent() {
    const events = ["Asteroid Storm", "Asteroid Depletion", "Rare Mineral Find"];
    const randomEvent = events[Math.floor(Math.random() * events.length)];

    switch (randomEvent) {
        case "Asteroid Storm":
            eventLog.innerText = "An asteroid storm has reduced mining efficiency by 50%!";
            selectedShip.timeMultiplier *= 1.5; // Increase time to mine
            setTimeout(() => {
                eventLog.innerText = "The asteroid storm has passed.";
                selectedShip.timeMultiplier /= 1.5;
            }, 10000); // Event lasts for 10 seconds
            break;

        case "Asteroid Depletion":
            eventLog.innerText = "An asteroid belt has depleted. Mining is halted temporarily!";
            mineButtons.forEach(button => button.disabled = true);
            setTimeout(() => {
                eventLog.innerText = "Asteroid belt replenished.";
                mineButtons.forEach(button => button.disabled = false);
            }, 10000); // Event lasts for 10 seconds
            break;

        case "Rare Mineral Find":
            eventLog.innerText = "A rare mineral find has increased mining yield by 200%!";
            selectedShip.yieldMultiplier *= 2;
            setTimeout(() => {
                eventLog.innerText = "Rare mineral find depleted.";
                selectedShip.yieldMultiplier /= 2;
            }, 10000); // Event lasts for 10 seconds
            break;
    }
}

// Trigger an asteroid event every 30 seconds
setInterval(triggerAsteroidEvent, 30000);

// Resource Production Interval
setInterval(updateResources, 1000);

// Disclaimer Modal Logic
function showDisclaimer() {
    if (!localStorage.getItem('disclaimerAccepted')) {
        disclaimerModal.style.display = 'block';
    }
}

function acceptDisclaimer() {
    localStorage.setItem('disclaimerAccepted', 'true');
    disclaimerModal.style.display = 'none';
}

acceptDisclaimerButton.addEventListener('click', acceptDisclaimer);

// Show disclaimer on page load
showDisclaimer();

// Load saved game state on page load
window.onload = loadGame;
