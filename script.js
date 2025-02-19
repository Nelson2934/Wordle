updateBoard();
}

// Submit current guess
function submitGuess() {
    const currentWord = getCurrentInputWord();
    
    // Check if word is complete
    if (currentWord.length !== WORD_LENGTH) {
        showMessage('Please enter a 5-letter word');
        shakeCurrentRow();
        return;
    }
    
    // Check if word is in list (optional for simplicity)
    if (!WORD_LIST.includes(currentWord)) {
        showMessage('Word not in list');
        shakeCurrentRow();
        return;
    }
    
    // Process the guess
    currentGuesses.push(currentWord);
    
    // Update keyboard statuses
    for (let i = 0; i < currentWord.length; i++) {
        const letter = currentWord[i];
        
        if (secretWord[i] === letter) {
            keyboardStatus[letter] = 'correct';
        } else if (secretWord.includes(letter) && keyboardStatus[letter] !== 'correct') {
            keyboardStatus[letter] = 'present';
        } else if (keyboardStatus[letter] === 'unused') {
            keyboardStatus[letter] = 'absent';
        }
    }
    
    // Check win/lose conditions
    if (currentWord === secretWord) {
        gameStatus = 'won';
        showMessage(`You won! The word was ${secretWord}`);
        gameControls.style.display = 'block';
        showScoreModal();
    } else if (currentAttempt >= MAX_ATTEMPTS - 1) {
        gameStatus = 'lost';
        showMessage(`Game over! The word was ${secretWord}`);
        gameControls.style.display = 'block';
    } else {
        currentAttempt++;
        currentPosition = 0;
        showMessage('');
    }
    
    updateBoard();
}

// Show message to user
function showMessage(text) {
    messageEl.textContent = text;
}

// Shake current row to indicate error
function shakeCurrentRow() {
    for (let col = 0; col < WORD_LENGTH; col++) {
        const tile = getTileElement(currentAttempt, col);
        tile.classList.add('shake');
        setTimeout(() => {
            tile.classList.remove('shake');
        }, 500);
    }
}

// Auth functions
function loadFromLocalStorage() {
    // Load users
    const savedUsers = localStorage.getItem('wordleUsers');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    }
    
    // Load leaderboard
    const savedLeaderboard = localStorage.getItem('wordleLeaderboard');
    if (savedLeaderboard) {
        leaderboard = JSON.parse(savedLeaderboard);
    }
    
    // Check if user is logged in
    const loggedInUser = localStorage.getItem('wordleCurrentUser');
    if (loggedInUser) {
        isLoggedIn = true;
        currentUser = loggedInUser;
        updateAuthUI();
    }
}

function updateAuthUI() {
    if (isLoggedIn) {
        loginBtn.style.display = 'none';
        userInfo.style.display = 'flex';
        welcomeMessage.textContent = `Welcome, ${currentUser}!`;
    } else {
        loginBtn.style.display = 'block';
        userInfo.style.display = 'none';
    }
}

function login() {
    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();
    
    if (!username || !password) {
        showLoginError('Please enter both username and password');
        return;
    }
    
    const user = users.find(u => u.username === username);
    if (!user) {
        showLoginError('User not found');
        return;
    }
    
    if (user.password !== password) {
        showLoginError('Incorrect password');
        return;
    }
    
    isLoggedIn = true;
    currentUser = username;
    updateAuthUI();
    
    // Save login state
    localStorage.setItem('wordleCurrentUser', username);
    
    // Clear login form and close modal
    loginUsername.value = '';
    loginPassword.value = '';
    hideLoginModal();
}
function register() {
    const username = registerUsername.value.trim();
    const password = registerPassword.value.trim();
    
    if (!username || !password) {
        showRegisterError('Please enter both username and password');
        return;
    }
    
    if (username.length < 3) {
        showRegisterError('Username must be at least 3 characters');
        return;
    }
    
    if (password.length < 4) {
        showRegisterError('Password must be at least 4 characters');
        return;
    }
    
    // Check if username already exists
    if (users.some(u => u.username === username)) {
        showRegisterError('Username already taken');
        return;
    }
    
    const newUser = { username, password };
    users.push(newUser);
    localStorage.setItem('wordleUsers', JSON.stringify(users));
    
    // Auto-login after registration
    isLoggedIn = true;
    currentUser = username;
    updateAuthUI();
    
    // Save login state
    localStorage.setItem('wordleCurrentUser', username);
    
    // Clear registration form and close modal
    registerUsername.value = '';
    registerPassword.value = '';
    hideRegisterModal();
}

function logout() {
    isLoggedIn = false;
    currentUser = '';
    localStorage.removeItem('wordleCurrentUser');
    updateAuthUI();
}

function showLoginError(message) {
    loginError.textContent = message;
    loginError.style.display = 'block';
}

function showRegisterError(message) {
    registerError.textContent = message;
    registerError.style.display = 'block';
}

function showLoginModal() {
    loginModal.style.display = 'flex';
    loginError.style.display = 'none';
    loginUsername.value = '';
    loginPassword.value = '';
}

function hideLoginModal() {
    loginModal.style.display = 'none';
}

function showRegisterModal() {
    registerModal.style.display = 'flex';
    registerError.style.display = 'none';
    registerUsername.value = '';
    registerPassword.value = '';
}

function hideRegisterModal() {
    registerModal.style.display = 'none';
}

function showScoreModal() {
    scoreModal.style.display = 'flex';
    if (isLoggedIn) {
        scoreLoggedIn.style.display = 'block';
        scoreGuest.style.display = 'none';
    } else {
        scoreLoggedIn.style.display = 'none';
        scoreGuest.style.display = 'block';
        playerNameInput.value = '';
    }
}

function hideScoreModal() {
    scoreModal.style.display = 'none';
}
// Leaderboard functions
function toggleLeaderboard() {
    showingLeaderboard = !showingLeaderboard;
    
    if (showingLeaderboard) {
        leaderboardEl.style.display = 'block';
        leaderboardBtn.textContent = 'Hide Leaderboard';
        updateLeaderboardUI();
    } else {
        leaderboardEl.style.display = 'none';
        leaderboardBtn.textContent = 'Show Leaderboard';
    }
}

function updateLeaderboardUI() {
    if (leaderboard.length === 0) {
        leaderboardContent.innerHTML = '<div class="empty-leaderboard">No scores yet. Be the first!</div>';
        return;
    }
    
    // Sort leaderboard by score (descending)
    const sortedLeaderboard = [...leaderboard].sort((a, b) => b.score - a.score);
    
    let html = `
        <table class="leaderboard-table">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Word</th>
                    <th>Attempts</th>
                    <th>Score</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    sortedLeaderboard.forEach((entry, index) => {
        const rowClass = index % 2 === 0 ? '' : 'class="even-row"';
        html += `
            <tr ${rowClass}>
                <td>${index + 1}</td>
                <td>${entry.name}</td>
                <td>${entry.word}</td>
                <td>${entry.attempts}</td>
                <td>${entry.score}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    leaderboardContent.innerHTML = html;
}

function addScore(name) {
    if (!name.trim()) return;
    
    const score = MAX_ATTEMPTS - currentGuesses.length + 1; // More points for fewer attempts
    const newEntry = {
        name: name,
        word: secretWord,
        attempts: currentGuesses.length,
        score: score,
        date: new Date().toLocaleDateString()
    };
    
    leaderboard.push(newEntry);
    
    // Keep only top 10 scores
    leaderboard.sort((a, b) => b.score - a.score);
    if (leaderboard.length > 10) {
        leaderboard = leaderboard.slice(0, 10);
    }
    
    localStorage.setItem('wordleLeaderboard', JSON.stringify(leaderboard));
    
    // Update leaderboard UI if it's visible
    if (showingLeaderboard) {
        updateLeaderboardUI();
    }
    
    hideScoreModal();
}
// Event listeners
window.addEventListener('DOMContentLoaded', () => {
    // Load data from localStorage
    loadFromLocalStorage();
    
    // Initialize game
    initGame();
    
    // Event listeners for keyboard
    window.addEventListener('keydown', handleKeyDown);
    
    // Auth buttons
    loginBtn.addEventListener('click', showLoginModal);
    logoutBtn.addEventListener('click', logout);
    loginSubmitBtn.addEventListener('click', login);
    registerSubmitBtn.addEventListener('click', register);
    showRegisterBtn.addEventListener('click', () => {
        hideLoginModal();
        showRegisterModal();
    });
    backToLoginBtn.addEventListener('click', () => {
        hideRegisterModal();
        showLoginModal();
    });
    guestBtn.addEventListener('click', hideLoginModal);
    
    // Leaderboard
    leaderboardBtn.addEventListener('click', toggleLeaderboard);
    
    // Score modal
    saveScoreUserBtn.addEventListener('click', () => addScore(currentUser));
    saveScoreGuestBtn.addEventListener('click', () => addScore(playerNameInput.value));
    skipScoreBtn.addEventListener('click', hideScoreModal);
    
    // Game controls
    playAgainBtn.addEventListener('click', () => {
        resetGame();
    });
});

// Utility function to reset game
function resetGame() {
    // Select a new random word
    secretWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    console.log('New secret word:', secretWord); // For debugging
    
    // Reset game state
    currentAttempt = 0;
    currentPosition = 0;
    currentGuesses = [];
    gameStatus = 'playing';
    gameControls.style.display = 'none';
    
    // Reset keyboard status
    keyboardStatus = {};
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
        keyboardStatus[letter] = 'unused';
    });
    
    // Clear message
    showMessage('');
    
    // Update UI
    updateBoard();
    updateKeyboardUI();
}
