// Date navigation
const prevDayBtn = document.getElementById('prevDay');
const nextDayBtn = document.getElementById('nextDay');
const currentDateDisplay = document.getElementById('currentDate');

// League filter buttons
const leagueButtons = document.querySelectorAll('.league-btn');

// Game containers
const liveGamesContainer = document.getElementById('liveGamesContainer');
const upcomingGamesContainer = document.getElementById('upcomingGamesContainer');
const completedGamesContainer = document.getElementById('completedGamesContainer');

// Current date (used for date navigation)
let currentDate = new Date();

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  // Display current date
  updateDateDisplay();
  
  // Set up date navigation
  prevDayBtn.addEventListener('click', navigateToPreviousDay);
  nextDayBtn.addEventListener('click', navigateToNextDay);
  
  // Set up league filters
  leagueButtons.forEach(button => {
    button.addEventListener('click', filterGamesByLeague);
  });
  
  // Set up game card click handlers
  setupGameCardInteractions();
  
  // Simulate live updates (in a real app, this would be WebSocket or polling)
  startLiveUpdates();
});

// Update date display
function updateDateDisplay() {
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  currentDateDisplay.textContent = currentDate.toLocaleDateString('en-US', options);
  
  // In a real app, you would fetch games for the selected date here
  fetchGamesForDate(currentDate);
}

// Navigate to previous day
function navigateToPreviousDay() {
  currentDate.setDate(currentDate.getDate() - 1);
  updateDateDisplay();
}

// Navigate to next day
function navigateToNextDay() {
  currentDate.setDate(currentDate.getDate() + 1);
  updateDateDisplay();
}

// Filter games by league
function filterGamesByLeague() {
  // Remove active class from all buttons
  leagueButtons.forEach(btn => btn.classList.remove('active'));
  
  // Add active class to clicked button
  this.classList.add('active');
  
  const selectedLeague = this.dataset.league;
  
  // Filter game cards based on selected league
  const allGameCards = document.querySelectorAll('.game-card');
  
  allGameCards.forEach(card => {
    const cardWrapper = card.parentElement;
    
    if (selectedLeague === 'all') {
      cardWrapper.style.display = 'block';
    } else if (selectedLeague === 'ncaa' && card.classList.contains('ncaa')) {
      cardWrapper.style.display = 'block';
    } else if (selectedLeague === 'nba' && !card.classList.contains('ncaa')) {
      cardWrapper.style.display = 'block';
    } else {
      cardWrapper.style.display = 'none';
    }
  });
}

// Setup game card interactions
function setupGameCardInteractions() {
  // Watch live buttons
  const watchButtons = document.querySelectorAll('.watch-btn');
  watchButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      alert('Redirecting to live game stream...');
      // In a real app, redirect to the live game stream or show embedded player
    });
  });
  
  // Set reminder buttons
  const reminderButtons = document.querySelectorAll('.set-reminder-btn');
  reminderButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      this.textContent = 'Reminder Set';
      this.classList.remove('btn-primary');
      this.classList.add('btn-success');
      // In a real app, set a reminder in the database and notify the user
    });
  });
  
  // Recap buttons
  const recapButtons = document.querySelectorAll('.recap-btn');
  recapButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get game details from the card
      const gameCard = this.closest('.game-card');
      const teams = gameCard.querySelectorAll('.team');
      
      // Show game details in modal
      showGameDetails(teams[0], teams[1]);
    });
  });
  
  // Make entire game card clickable to show details
  const gameCards = document.querySelectorAll('.game-card');
  gameCards.forEach(card => {
    card.addEventListener('click', function(e) {
      // Don't trigger if clicking on a button
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
        return;
      }
      
      const teams = this.querySelectorAll('.team');
      showGameDetails(teams[0], teams[1]);
    });
  });
}

// Show game details in modal
function showGameDetails(team1Element, team2Element) {
  // Get team information from the DOM elements
  const team1Logo = team1Element.querySelector('.team-logo img').src;
  const team1Name = team1Element.querySelector('.team-name').textContent;
  const team1Score = team1Element.querySelector('.team-score')?.textContent || '0';
  
  const team2Logo = team2Element.querySelector('.team-logo img').src;
  const team2Name = team2Element.querySelector('.team-name').textContent;
  const team2Score = team2Element.querySelector('.team-score')?.textContent || '0';
  
  // Set modal content
  document.getElementById('team1Logo').src = team1Logo;
  document.getElementById('team1Name').textContent = team1Name;
  document.getElementById('team1Record').textContent = '42-33'; // This would come from API
  document.getElementById('team1Score').textContent = team1Score;
  
  document.getElementById('team2Logo').src = team2Logo;
  document.getElementById('team2Name').textContent = team2Name;
  document.getElementById('team2Record').textContent = '47-28'; // This would come from API
  document.getElementById('team2Score').textContent = team2Score;
  
  // Show the modal
  $('#gameDetailModal').modal('show');
  
  // Load box score data (simulated, would be an API call in real app)
  loadBoxScoreData(team1Name, team2Name);
  
  // Load play-by-play data (simulated, would be an API call in real app)
  loadPlayByPlayData();
  
  // Load team stats data (simulated, would be an API call in real app)
  loadTeamStatsData(team1Name, team2Name);
}

// Fetch games for a specific date (simulated, would be an API call in real app)
function fetchGamesForDate(date) {
  console.log(`Fetching games for: ${date.toDateString()}`);
  // In a real app, you would make an API call here to get games for the selected date
  // Then update the game containers with the new data
  
  // For now, we'll just log the action
  // This would be replaced with actual API calls and DOM updates
}

// Simulate live updates for games in progress
function startLiveUpdates() {
  // In a real app, this would use WebSockets or periodic polling
  // For demonstration, we'll just update the score every few seconds
  
  setInterval(() => {
    const liveGames = document.querySelectorAll('.game-card.live');
    
    liveGames.forEach(game => {
      // Get the current scores
      const teamScores = game.querySelectorAll('.team-score');
      
      // Randomly increment one of the scores (for demo purposes)
      const randomTeam = Math.floor(Math.random() * 2);
      const currentScore = parseInt(teamScores[randomTeam].textContent);
      
      // 30% chance of score update
      if (Math.random() < 0.3) {
        // Increment by 1, 2, or 3 points
        const pointsAdded = Math.floor(Math.random() * 3) + 1;
        teamScores[randomTeam].textContent = currentScore + pointsAdded;
        
        // Add a flash effect to indicate score change
        teamScores[randomTeam].classList.add('score-changed');
        setTimeout(() => {
          teamScores[randomTeam].classList.remove('score-changed');
        }, 1000);
      }
      
      // Update game time
      const gameTime = game.querySelector('.game-time');
      let currentTime = gameTime.textContent;
      
      // Parse the current quarter and time
      const [quarter, time] = currentTime.split(' - ');
      const [minutes, seconds] = time.split(':').map(Number);
      
      // Update time (decrement seconds)
      let newSeconds = seconds - 5;
      let newMinutes = minutes;
      
      if (newSeconds < 0) {
        newSeconds = 55;
        newMinutes--;
      }
      
      // Format the new time
      const newTime = `${quarter} - ${String(newMinutes).padStart(2, '0')}:${String(newSeconds).padStart(2, '0')}`;
      gameTime.textContent = newTime;
    });
  }, 5000); // Update every 5 seconds
}

// Load box score data (simulated)
function loadBoxScoreData(team1Name, team2Name) {
  setTimeout(() => {
    // Simulate loading box score data
    document.querySelector('.boxscore-container').innerHTML = `
      <div class="box-score-table">
        <h4>${team1Name}</h4>
        <div class="table-responsive">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Player</th>
                <th>MIN</th>
                <th>PTS</th>
                <th>REB</th>
                <th>AST</th>
                <th>STL</th>
                <th>BLK</th>
                <th>FG</th>
                <th>3PT</th>
                <th>FT</th>
                <th>+/-</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>J. Tatum</td>
                <td>36</td>
                <td>28</td>
                <td>10</td>
                <td>8</td>
                <td>2</td>
                <td>1</td>
                <td>10-18</td>
                <td>4-9</td>
                <td>4-4</td>
                <td>+12</td>
              </tr>
              <tr>
                <td>J. Brown</td>
                <td>34</td>
                <td>22</td>
                <td>6</td>
                <td>5</td>
                <td>1</td>
                <td>0</td>
                <td>8-15</td>
                <td>3-7</td>
                <td>3-3</td>
                <td>+10</td>
              </tr>
              <tr>
                <td>K. Porzingis</td>
                <td>28</td>
                <td>16</td>
                <td>8</td>
                <td>2</td>
                <td>0</td>
                <td>3</td>
                <td>7-12</td>
                <td>0-2</td>
                <td>2-2</td>
                <td>+8</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <h4 class="mt-4">${team2Name}</h4>
        <div class="table-responsive">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Player</th>
                <th>MIN</th>
                <th>PTS</th>
                <th>REB</th>
                <th>AST</th>
                <th>STL</th>
                <th>BLK</th>
                <th>FG</th>
                <th>3PT</th>
                <th>FT</th>
                <th>+/-</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>T. Young</td>
                <td>38</td>
                <td>24</td>
                <td>3</td>
                <td>12</td>
                <td>1</td>
                <td>0</td>
                <td>8-22</td>
                <td>2-8</td>
                <td>6-6</td>
                <td>-8</td>
              </tr>
              <tr>
                <td>D. Murray</td>
                <td>36</td>
                <td>18</td>
                <td>5</td>
                <td>7</td>
                <td>2</td>
                <td>0</td>
                <td>7-16</td>
                <td>2-5</td>
                <td>2-2</td>
                <td>-6</td>
              </tr>
              <tr>
                <td>C. Capela</td>
                <td>26</td>
                <td>10</td>
                <td>12</td>
                <td>1</td>
                <td>0</td>
                <td>2</td>
                <td>5-8</td>
                <td>0-0</td>
                <td>0-2</td>
                <td>-4</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }, 500);
}

// Load play-by-play data (simulated)
function loadPlayByPlayData() {
  setTimeout(() => {
    // Simulate loading play-by-play data
    document.querySelector('.play-by-play-container').innerHTML = `
      <div class="play-by-play-list">
        <div class="play-item">
          <div class="play-time">Q3 - 04:27</div>
          <div class="play-description">J. Tatum makes 26-foot three point jumper (J. Brown assists)</div>
        </div>
        <div class="play-item">
          <div class="play-time">Q3 - 04:55</div>
          <div class="play-description">T. Young misses 22-foot jumper</div>
        </div>
        <div class="play-item">
          <div class="play-time">Q3 - 05:10</div>
          <div class="play-description">K. Porzingis blocks C. Capela's layup</div>
        </div>
        <div class="play-item">
          <div class="play-time">Q3 - 05:23</div>
          <div class="play-description">J. Brown makes driving layup</div>
        </div>
        <div class="play-item">
          <div class="play-time">Q3 - 05:45</div>
          <div class="play-description">D. Murray makes 19-foot pull-up jump shot</div>
        </div>
        <div class="play-item">
          <div class="play-time">Q3 - 06:02</div>
          <div class="play-description">J. Tatum defensive rebound</div>
        </div>
        <div class="play-item">
          <div class="play-time">Q3 - 06:05</div>
          <div class="play-description">T. Young misses floating jump shot</div>
        </div>
        <div class="play-item">
          <div class="play-time">Q3 - 06:24</div>
          <div class="play-description">Celtics full timeout</div>
        </div>
      </div>
    `;
  }, 500);
}

// Load team stats data (simulated)
function loadTeamStatsData(team1Name, team2Name) {
  setTimeout(() => {
    // Simulate loading team stats data
    document.querySelector('.team-stats-container').innerHTML = `
      <div class="team-comparison">
        <div class="stat-comparison-row header">
          <div class="team-column">${team1Name}</div>
          <div class="stat-name">STAT</div>
          <div class="team-column">${team2Name}</div>
        </div>
        <div class="stat-comparison-row">
          <div class="team-column">76</div>
          <div class="stat-name">POINTS</div>
          <div class="team-column">64</div>
        </div>
        <div class="stat-comparison-row">
          <div class="team-column">42.5%</div>
          <div class="stat-name">FG%</div>
          <div class="team-column">38.8%</div>
        </div>
        <div class="stat-comparison-row">
          <div class="team-column">35.7%</div>
          <div class="stat-name">3PT%</div>
          <div class="team-column">28.6%</div>
        </div>
        <div class="stat-comparison-row">
          <div class="team-column">90.0%</div>
          <div class="stat-name">FT%</div>
          <div class="team-column">80.0%</div>
        </div>
        <div class="stat-comparison-row">
          <div class="team-column">41</div>
          <div class="stat-name">REBOUNDS</div>
          <div class="team-column">36</div>
        </div>
        <div class="stat-comparison-row">
          <div class="team-column">20</div>
          <div class="stat-name">ASSISTS</div>
          <div class="team-column">22</div>
        </div>
        <div class="stat-comparison-row">
          <div class="team-column">6</div>
          <div class="stat-name">STEALS</div>
          <div class="team-column">4</div>
        </div>
        <div class="stat-comparison-row">
          <div class="team-column">5</div>
          <div class="stat-name">BLOCKS</div>
          <div class="team-column">2</div>
        </div>
        <div class="stat-comparison-row">
          <div class="team-column">9</div>
          <div class="stat-name">TURNOVERS</div>
          <div class="team-column">12</div>
        </div>
      </div>
    `;
  }, 500);
}

// Add CSS for score changes
const style = document.createElement('style');
style.textContent = `
  .score-changed {
    animation: score-flash 1s ease;
  }
  
  @keyframes score-flash {
    0%, 100% {
      color: #212529;
    }
    50% {
      color: #28a745;
      transform: scale(1.2);
    }
  }
`;
document.head.appendChild(style); 