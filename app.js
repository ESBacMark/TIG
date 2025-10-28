// app.js
// Import the functions you need from the SDKs you need

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXjGVxLAweg3iZYuhLsmNsmYidRNKBzgw",
  authDomain: "tig-algebra-options-data.firebaseapp.com",
  projectId: "tig-algebra-options-data",
  storageBucket: "tig-algebra-options-data.firebasestorage.app",
  messagingSenderId: "104889443005",
  appId: "1:104889443005:web:d29e860ba55de332378dd4",
  measurementId: "G-5KES7VC65J"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const sessionID = Date.now().toString() + Math.floor(Math.random() * 1000).toString();
console.log("Session ID:", sessionID);
// Get references to HTML elements
const questionTextElement = document.getElementById('question-text');
const optionsContainerElement = document.getElementById('options-container');
const feedbackMessageElement = document.getElementById('feedback-message');
const scoreDisplayElement = document.getElementById('score-display');
const healthDisplayElement = document.getElementById('health-display');
const levelSelectElement = document.getElementById('level-select'); // For Level Selector
const jumpToLevelBtn = document.getElementById('jump-to-level-btn'); // For Level Selector
const showLevelsBtn = document.getElementById('show-levels-btn'); // <-- ADD THIS
const levelListModal = document.getElementById('level-list-modal'); // <-- ADD THIS
const modalCloseBtn = document.querySelector('.modal-close-btn'); // <-- ADD THIS
const levelListContent = document.getElementById('level-list-content'); // <-- ADD THIS

let currentQuestion = null;
let questionStartTime = 0; // To store the timestamp when question appears

// Player State
const player = {
    score: 0,
    health: 100,
    skillLevel: 1,
    maxHealth: 100,
    currentDifficultyLevel: 1
};

// Game Settings
const scorePerCorrect = 10;
const healthLossPerIncorrect = 20;
const FAST_THRESHOLD_MS = 3000; // Time limit for "Fast" answer in milliseconds
const MAX_IMPLEMENTED_LEVEL = 63; // The highest level we have implemented
// --- LEVEL DESCRIPTIONS ---
// --- LEVEL DESCRIPTIONS ---
const LEVEL_DESCRIPTIONS = [
    "1-12: Combining Like Terms<br>ax + bx",
    "13-14: Combining Terms & Constants<br> ax + b + cx",
    "15-16: Combining Terms with Exponents<br> ax<sup>n</sup> + bx<sup>m</sup>",
    "17-19: Combining Multi-Variable Terms<br> ax + by + cx",
    "20-21: Multiplication<br> a &times; bx",
    "22-25: Multiplication with Exponents<br> ax<sup>n</sup> &times; bx<sup>m</sup>",
    "26-27: Simple Division<br> ax / b",
    "28-30: Division with Exponents<br>ax<sup>n</sup> / bx<sup>m</sup>",
    "31-34: Power Rules<br>(ax<sup>n</sup>)<sup>m</sup> ",
    "35-37: Combined Operations<br>Multiplication & Division",
    "38-40: Distributive Property<br>a(bx+c) ",
    "41-44: Distributive Property<br> ax<sup>n</sup>(bx<sup>m</sup>+c) ",
    "45-47: Advanced Multiplication<br>ax<sup>n</sup> &times; by<sup>m</sup> &times; cx<sup>k</sup>",
    "48: Difference of Squares<br>(x+a)(x-a)",
    "49-51: Square of a Sum/Difference <br>(x &pm; a)<sup>2</sup>",
    "52: Difference of Squares<br>(ax+b)(ax-b)",
    "53-55: Square of a Sum/Difference<br> (ax &pm; b)<sup>2</sup> ",
    "56: General Binomial Multiplication<br>(ax+b)(cx+d)",
    "57: Simple Polynomial Division<br> (ax+b )/ c",
    "58: Polynomial / Monomial Division<br> (ax<sup>k</sup>+bx<sup>m</sup>) / cx<sup>n</sup>",
    "59: Factoring<br> (x<sup>2</sup> - a<sup>2</sup>) / (x &pm; a)",
    "60-61: Factoring<br> (ax<sup>2</sup> &pm;2abx+b<sup>2</sup>) / (x &pm; 1/b)",
    "62-63: Factoring<br>n(ax+b)(cx+d) /(ex+f)"
];
/** Updates player stats display */
function updatePlayerStatsDisplay() {
    scoreDisplayElement.textContent = `Score: ${player.score}`;
    healthDisplayElement.textContent = `Health: ${player.health}%`;
    if (player.health <= 20) {
        healthDisplayElement.style.color = 'darkred';
    } else if (player.health <= 50) {
        healthDisplayElement.style.color = 'orange';
    } else {
        healthDisplayElement.style.color = '#e74c3c'; // Default red
    }
}

/** Adjusts difficulty based on skill level */
function adjustDifficulty() {
    let minCoeff = 1;
    let maxCoeff = 10;

    // Mapping skillLevel -> difficultyLevel (1-63)
    // Levels 1-30
    if (player.skillLevel <= 2) { player.currentDifficultyLevel = 1; maxCoeff = 5; } // Skill 1-2 -> Level 1
    else if (player.skillLevel <= 4) { player.currentDifficultyLevel = 2; maxCoeff = 15; } // Skill 3-4 -> Level 2
    else if (player.skillLevel <= 6) { player.currentDifficultyLevel = 3; maxCoeff = 10; } // Skill 5-6 -> Level 3
    else if (player.skillLevel <= 8) { player.currentDifficultyLevel = 4; maxCoeff = 20; } // Skill 7-8 -> Level 4
    else if (player.skillLevel <= 10) { player.currentDifficultyLevel = 5; maxCoeff = 10; } // Skill 9-10 -> Level 5
    else if (player.skillLevel <= 12) { player.currentDifficultyLevel = 6; maxCoeff = 20; } // Skill 11-12 -> Level 6
    else if (player.skillLevel <= 14) { player.currentDifficultyLevel = 7; maxCoeff = 10; } // Skill 13-14 -> Level 7
    else if (player.skillLevel <= 16) { player.currentDifficultyLevel = 8; maxCoeff = 10; } // Skill 15-16 -> Level 8
    else if (player.skillLevel <= 18) { player.currentDifficultyLevel = 9; maxCoeff = 20; } // Skill 17-18 -> Level 9
    else if (player.skillLevel <= 20) { player.currentDifficultyLevel = 10; maxCoeff = 15; } // Skill 19-20 -> Level 10
    else if (player.skillLevel <= 22) { player.currentDifficultyLevel = 11; maxCoeff = 10; } // Skill 21-22 -> Level 11
    else if (player.skillLevel <= 24) { player.currentDifficultyLevel = 12; maxCoeff = 20; } // Skill 23-24 -> Level 12
    else if (player.skillLevel <= 26) { player.currentDifficultyLevel = 13; maxCoeff = 10; } // Skill 25-26 -> Level 13
    else if (player.skillLevel <= 28) { player.currentDifficultyLevel = 14; maxCoeff = 15; } // Skill 27-28 -> Level 14
    else if (player.skillLevel <= 30) { player.currentDifficultyLevel = 15; maxCoeff = 10; } // Skill 29-30 -> Level 15
    else if (player.skillLevel <= 32) { player.currentDifficultyLevel = 16; maxCoeff = 10; } // Skill 31-32 -> Level 16
    else if (player.skillLevel <= 34) { player.currentDifficultyLevel = 17; maxCoeff = 10; } // Skill 33-34 -> Level 17
    else if (player.skillLevel <= 36) { player.currentDifficultyLevel = 18; maxCoeff = 10; } // Skill 35-36 -> Level 18
    else if (player.skillLevel <= 38) { player.currentDifficultyLevel = 19; maxCoeff = 10; } // Skill 37-38 -> Level 19
    else if (player.skillLevel <= 40) { player.currentDifficultyLevel = 20; maxCoeff = 10; } // Skill 39-40 -> Level 20
    else if (player.skillLevel <= 42) { player.currentDifficultyLevel = 21; maxCoeff = 10; } // Skill 41-42 -> Level 21
    else if (player.skillLevel <= 44) { player.currentDifficultyLevel = 22; maxCoeff = 8; }  // Skill 43-44 -> Level 22
    else if (player.skillLevel <= 46) { player.currentDifficultyLevel = 23; maxCoeff = 5; }  // Skill 45-46 -> Level 23
    else if (player.skillLevel <= 48) { player.currentDifficultyLevel = 24; maxCoeff = 8; }  // Skill 47-48 -> Level 24
    else if (player.skillLevel <= 50) { player.currentDifficultyLevel = 25; maxCoeff = 8; }  // Skill 49-50 -> Level 25
    else if (player.skillLevel <= 52) { player.currentDifficultyLevel = 26; maxCoeff = 15; } // Skill 51-52 -> Level 26
    else if (player.skillLevel <= 54) { player.currentDifficultyLevel = 27; maxCoeff = 15; } // Skill 53-54 -> Level 27
    else if (player.skillLevel <= 56) { player.currentDifficultyLevel = 28; maxCoeff = 10; } // Skill 55-56 -> Level 28
    else if (player.skillLevel <= 58) { player.currentDifficultyLevel = 29; maxCoeff = 10; } // Skill 57-58 -> Level 29
    else if (player.skillLevel <= 60) { player.currentDifficultyLevel = 30; maxCoeff = 10; } // Skill 59-60 -> Level 30
    // Levels 31-37
    else if (player.skillLevel <= 62) { player.currentDifficultyLevel = 31; maxCoeff = 5; } // Skill 61-62 -> Level 31
    else if (player.skillLevel <= 64) { player.currentDifficultyLevel = 32; maxCoeff = 5; minCoeff = 2; } // Skill 63-64 -> Level 32
    else if (player.skillLevel <= 66) { player.currentDifficultyLevel = 33; maxCoeff = 5; minCoeff = 2; } // Skill 65-66 -> Level 33
    else if (player.skillLevel <= 68) { player.currentDifficultyLevel = 34; maxCoeff = 5; minCoeff = 2; } // Skill 67-68 -> Level 34
    else if (player.skillLevel <= 70) { player.currentDifficultyLevel = 35; maxCoeff = 5; } // Skill 69-70 -> Level 35
    else if (player.skillLevel <= 72) { player.currentDifficultyLevel = 36; maxCoeff = 8; } // Skill 71-72 -> Level 36
    else if (player.skillLevel <= 74) { player.currentDifficultyLevel = 37; maxCoeff = 8; } // Skill 73-74 -> Level 37
	else if (player.skillLevel <= 76) { player.currentDifficultyLevel = 38; maxCoeff = 8; minCoeff = 2; } // Skill 75-76 -> Level 38
    else if (player.skillLevel <= 78) { player.currentDifficultyLevel = 39; maxCoeff = 8; minCoeff = 2; } // Skill 77-78 -> Level 39
    else if (player.skillLevel <= 80) { player.currentDifficultyLevel = 40; maxCoeff = 10; minCoeff = 2; } // Skill 79-80 -> Level 40
	else if (player.skillLevel <= 82) { player.currentDifficultyLevel = 41; maxCoeff = 10; minCoeff = 2; } // Skill 81-82 -> Level 41
	else if (player.skillLevel <= 84) { player.currentDifficultyLevel = 42; maxCoeff = 8; minCoeff = 2; } // Skill 83-84 -> Level 42
	else if (player.skillLevel <= 86) { player.currentDifficultyLevel = 43; maxCoeff = 8; minCoeff = 2; } // Skill 85-86 -> Level 43
    else if (player.skillLevel <= 88) { player.currentDifficultyLevel = 44; maxCoeff = 8; minCoeff = 2; } // Skill 87-88 -> Level 44
	else if (player.skillLevel <= 90) { player.currentDifficultyLevel = 45; maxCoeff = 5; } // Skill 89-90 -> Level 45
    else if (player.skillLevel <= 92) { player.currentDifficultyLevel = 46; maxCoeff = 8; minCoeff = 1; } // Skill 91-92 -> Level 46
    else if (player.skillLevel <= 94) { player.currentDifficultyLevel = 47; maxCoeff = 8; minCoeff = 1; } // Skill 93-94 -> Level 47
    else if (player.skillLevel <= 96) { player.currentDifficultyLevel = 48; maxCoeff = 12; minCoeff = 2; } // Skill 95-96 -> Level 48
    else if (player.skillLevel <= 98) { player.currentDifficultyLevel = 49; maxCoeff = 12; minCoeff = 2; } // Skill 97-98 -> Level 49
    else if (player.skillLevel <= 100) { player.currentDifficultyLevel = 50; maxCoeff = 12; minCoeff = 2; } // Skill 99-100 -> Level 50
    else if (player.skillLevel <= 102) { player.currentDifficultyLevel = 51; maxCoeff = 12; minCoeff = 2; } // Skill 101-102 -> Level 51
    else if (player.skillLevel <= 104) { player.currentDifficultyLevel = 52; maxCoeff = 8; minCoeff = 2; } // Skill 103-104 -> Level 52
    else if (player.skillLevel <= 106) { player.currentDifficultyLevel = 53; maxCoeff = 8; minCoeff = 2; } // Skill 105-106 -> Level 53
    else if (player.skillLevel <= 108) { player.currentDifficultyLevel = 54; maxCoeff = 8; minCoeff = 2; } // Skill 107-108 -> Level 54
    else if (player.skillLevel <= 110) { player.currentDifficultyLevel = 55; maxCoeff = 8; minCoeff = 2; } // Skill 109-110 -> Level 55
    else if (player.skillLevel <= 112) { player.currentDifficultyLevel = 56; maxCoeff = 10; minCoeff = 2; } // Skill 111-112 -> Level 56
    else if (player.skillLevel <= 114) { player.currentDifficultyLevel = 57; maxCoeff = 10; minCoeff = 2; } // Skill 113-114 -> Level 57
    else if (player.skillLevel <= 116) { player.currentDifficultyLevel = 58; maxCoeff = 8; minCoeff = 2; } // Skill 115-116 -> Level 58
    else if (player.skillLevel <= 118) { player.currentDifficultyLevel = 59; maxCoeff = 12; minCoeff = 2; } // Skill 117-118 -> Level 59
    else if (player.skillLevel <= 120) { player.currentDifficultyLevel = 60; maxCoeff = 12; minCoeff = 2; } // Skill 119-120 -> Level 60
    else if (player.skillLevel <= 122) { player.currentDifficultyLevel = 61; maxCoeff = 8; minCoeff = 2; } // Skill 121-122 -> Level 61
    else if (player.skillLevel <= 124) { player.currentDifficultyLevel = 62; maxCoeff = 10; minCoeff = 2; } // Skill 123-124 -> Level 62
    else if (player.skillLevel <= 126) { player.currentDifficultyLevel = 63; maxCoeff = 8; minCoeff = 2; } // Skill 125-126 -> Level 63
    else {
        player.currentDifficultyLevel = MAX_IMPLEMENTED_LEVEL; // Default to max implemented
        maxCoeff = 10;
    }

    // ** CRITICAL LOG **
    console.log(`adjustDifficulty - Input Skill: ${player.skillLevel}, Output Difficulty: ${player.currentDifficultyLevel}`);
    return { minCoeff, maxCoeff };
}

/** Handles game over */
function gameOver() {
    feedbackMessageElement.innerHTML = `Game Over! Final score: ${player.score}`;
    feedbackMessageElement.style.color = 'white';
    questionTextElement.innerHTML = "Thank you!";
    optionsContainerElement.innerHTML = '';
}

/** Displays a new question */
function displayNewQuestion() {
    console.log("Entering displayNewQuestion. Current health:", player.health);
    if (player.health <= 0) { console.log("Player health <= 0, calling gameOver."); gameOver(); return; }
    feedbackMessageElement.innerHTML = '';

    console.log("Adjusting difficulty...");
    const { minCoeff, maxCoeff } = adjustDifficulty();
    let currentMaxLevel = player.currentDifficultyLevel;

    // Sync the dropdown menu
    if (levelSelectElement) { // Check if it exists first
        levelSelectElement.value = currentMaxLevel;
    }

    console.log(`Calling generateQuestion with level ${currentMaxLevel}, min ${minCoeff}, max ${maxCoeff}`);
    try {
        currentQuestion = generateQuestion(currentMaxLevel, minCoeff, maxCoeff);
        console.log("generateQuestion returned:", currentQuestion);
    } catch (error) {
        console.error("Error during generateQuestion:", error);
        questionTextElement.innerHTML = "Error generating question.";
        return;
    }

    if (!currentQuestion || !currentQuestion.question || !currentQuestion.options) {
        console.error("generateQuestion did not return a valid question object:", currentQuestion);
        questionTextElement.innerHTML = "Failed to load question data.";
        return;
    }

    console.log("Updating HTML with question:", currentQuestion.question);
    questionTextElement.innerHTML = currentQuestion.question;
    optionsContainerElement.innerHTML = '';

    currentQuestion.options.forEach(option => {
        const button = document.createElement('button');
        button.innerHTML = option;
        button.classList.add('option-button');
        button.addEventListener('click', () => handleAnswer(button, option));
        optionsContainerElement.appendChild(button);
    });

    Array.from(optionsContainerElement.children).forEach(button => {
        button.disabled = false;
        button.classList.remove('correct', 'incorrect');
    });

    questionStartTime = performance.now();
    console.log("displayNewQuestion finished.");
}
// --- NEW DATABASE FUNCTION ---

/**
 * Logs the result of an answer to the Firestore database.
 * @param {boolean} isCorrect - Was the answer correct?
 * @param {number} level - The difficulty level of the question.
 * @param {number} responseTimeMs - How long the user took to answer (in ms).
 */
function logAnswerToDatabase(isCorrect, level, responseTimeMs) {
    // Create a new "log" object with all the data
    const logEntry = {
        sessionID: sessionID,
        level: level,
        isCorrect: isCorrect,
        responseTime: responseTimeMs,
        timestamp: firebase.firestore.FieldValue.serverTimestamp() // Asks Firebase for the current time
    };

    // Send it to the database
    // We'll create a "collection" (like a table) called "answers"
    db.collection("answers").add(logEntry)
        .then(() => {
            console.log("Answer logged successfully!");
        })
        .catch((error) => {
            console.error("Error logging answer: ", error);
        });
}

/** Handles user's answer selection */
function handleAnswer(clickedButton, selectedOption) {
    if (!currentQuestion || player.health <= 0) return;
    const responseTime = performance.now() - questionStartTime;
    console.log(`Response time: ${(responseTime / 1000).toFixed(2)}s`);
    Array.from(optionsContainerElement.children).forEach(button => {
        button.disabled = true;
    });
    let skillChange = 0;
    if (selectedOption === currentQuestion.correctAnswer) {
        feedbackMessageElement.innerHTML = "Correct!";
        feedbackMessageElement.style.color = 'green';
        clickedButton.classList.add('correct');
        player.score += scorePerCorrect;
        if (responseTime <= FAST_THRESHOLD_MS) {
            skillChange = 2;
            feedbackMessageElement.innerHTML += " (Fast!)";
            console.log("Fast correct answer!");
        } else {
            skillChange = 1;
            console.log("Slow correct answer.");
        }
        player.skillLevel += skillChange;
		logAnswerToDatabase(true, player.currentDifficultyLevel, responseTime);
        console.log(`Correct! Score: ${player.score}, Skill: ${player.skillLevel} (+${skillChange})`);
    } else {
        feedbackMessageElement.innerHTML = `Wrong! Correct: ${currentQuestion.correctAnswer}`;
        feedbackMessageElement.style.color = 'red';
        clickedButton.classList.add('incorrect');
        player.health -= healthLossPerIncorrect;
        skillChange = -1;
        if (player.skillLevel > 1) {
            player.skillLevel = Math.max(1, Math.floor(player.skillLevel + skillChange));
        } else {
            skillChange = 0;
        }
        console.log(`Wrong! Health: ${player.health}, Skill: ${player.skillLevel} (${skillChange})`);
        Array.from(optionsContainerElement.children).forEach(button => {
            if (button.innerHTML === currentQuestion.correctAnswer) button.classList.add('correct');
        });
    }
    updatePlayerStatsDisplay();
    if (player.health > 0) {
        setTimeout(displayNewQuestion, 400);
    } else {
        gameOver();
    }
}

// --- LEVEL SELECTOR LOGIC ---

/** Populates the level selector dropdown */
function populateLevelSelector() {
    if (!levelSelectElement) return;
	levelSelectElement.innerHTML = '';
    for (let i = 1; i <= MAX_IMPLEMENTED_LEVEL; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Level ${i}`;
        levelSelectElement.appendChild(option);
    }
}

/** Handles the "Go" button click for level selection */
function handleLevelJump() {
    const selectedLevel = parseInt(levelSelectElement.value, 10);
    if (!selectedLevel) return;

    console.log(`User manually jumping to level: ${selectedLevel}`);
    setDifficultyLevel(selectedLevel);
}

// Add event listener
if (jumpToLevelBtn) {
    jumpToLevelBtn.addEventListener('click', handleLevelJump);
}


// --- INITIALIZATION ---
updatePlayerStatsDisplay();
console.log("Initial call to displayNewQuestion.");
populateLevelSelector(); // Fill the dropdown
displayNewQuestion();

// --- DEBUG FUNCTIONS ---
function setSkillLevel(level) {
    if (typeof level !== 'number' || level < 1) {
        console.error("Invalid skill level.");
        return;
    }
    player.skillLevel = level;
    console.log(`Debug: Skill level set to ${player.skillLevel}`);
    displayNewQuestion();
}

/**
 * Helper function for development to jump to a specific *difficulty case* (1-63).
 * **CORRECTED REVERSE MAPPING LOGIC**
 */
function setDifficultyLevel(difficultyLevel) {
    if (typeof difficultyLevel !== 'number' || difficultyLevel < 1 || difficultyLevel > MAX_IMPLEMENTED_LEVEL) {
        console.error(`Invalid difficulty level (1-${MAX_IMPLEMENTED_LEVEL}).`);
        return;
    }
    let targetSkillLevel = 1;

    // Use the formula: SkillLevel = 1 + (DifficultyLevel - 1) * 2
    if (difficultyLevel <= MAX_IMPLEMENTED_LEVEL) {
        targetSkillLevel = 1 + (difficultyLevel - 1) * 2;
    } else {
        // Failsafe
        targetSkillLevel = 1 + (MAX_IMPLEMENTED_LEVEL - 1) * 2;
        console.warn(`Mapping for difficulty ${difficultyLevel} not implemented. Setting skill for level ${MAX_IMPLEMENTED_LEVEL}.`);
    }

    targetSkillLevel = Math.max(1, targetSkillLevel);
    player.skillLevel = targetSkillLevel;

    console.log(`setDifficultyLevel - Requested: ${difficultyLevel}, Calculated Target Skill: ${targetSkillLevel}`);
    displayNewQuestion();
}
// --- MODAL LOGIC ---

/** Populates the level list in the modal */
function populateLevelList() {
    if (!levelListContent) return;

    // Clear old list
    levelListContent.innerHTML = '';

    let currentLevel = 1;
    LEVEL_DESCRIPTIONS.forEach(desc => {
        const parts = desc.split(':'); // e.g., ["1-12", " Combining..."]
        const levelRange = parts[0].trim();
        const skill = parts[1].trim();

        const p = document.createElement('p');
        p.innerHTML = `<strong>Lvl ${levelRange}:</strong> ${skill}`;
        levelListContent.appendChild(p);
    });
}

/** Shows the level list modal */
function showModal() {
    if (levelListModal) levelListModal.style.display = "block";
}

/** Hides the level list modal */
function hideModal() {
    if (levelListModal) levelListModal.style.display = "none";
}

// Event Listeners for Modal
if (showLevelsBtn) showLevelsBtn.addEventListener('click', showModal);
if (modalCloseBtn) modalCloseBtn.addEventListener('click', hideModal);

// Also hide modal if user clicks on the dark overlay
window.addEventListener('click', (event) => {
    if (event.target == levelListModal) {
        hideModal();
    }
});

// --- INITIALIZATION ---
updatePlayerStatsDisplay();
console.log("Initial call to displayNewQuestion.");
populateLevelSelector(); // Fill the dropdown
populateLevelList(); // <-- ADD THIS LINE
displayNewQuestion();

// ... (your setDifficultyLevel function) ...


