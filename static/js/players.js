document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("playersTableBody");
  const playerSearch = document.getElementById("playerSearch");
  const teamFilter = document.getElementById("teamFilter");
  const positionFilter = document.getElementById("positionFilter");
  const leagueFilter = document.getElementById("leagueFilter");
  let allPlayers = [];
  
  // Show loading spinner
  tableBody.innerHTML = `
    <tr>
      <td colspan="14" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
        <p class="mt-2">Loading player data...</p>
      </td>
    </tr>
  `;
  
  // Fetch player data
  fetch("/api/playoff_players")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch player data");
      return res.json();
    })
    .then((players) => {
      allPlayers = players;
      
      if (!Array.isArray(players) || players.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="14" class="text-center">No player data available.</td></tr>`;
        return;
      }
      
      // Populate team filter dropdown
      populateTeamFilter(players);
      
      // Render players initially
      renderPlayers(players);
      
      // Setup event listeners for filters
      setupCategoryTabs();
setupFilters();
      setupCategoryTabs();
    })
    .catch((err) => {
      console.error("Error fetching playoff player stats:", err);
      tableBody.innerHTML = `
        <tr><td colspan="14" class="text-center text-danger">
          <i class="fas fa-exclamation-circle mr-2"></i>Failed to load player data. Please try again later.
        </td></tr>
      `;
    });
    
  // Function to populate team filter dropdown
  function populateTeamFilter(players) {
    const teams = [...new Set(players.map(player => player.team).filter(Boolean))].sort();
    teamFilter.innerHTML = '<option value="all">All Teams</option>';
    
    teams.forEach(team => {
      const option = document.createElement('option');
      option.value = team;
      option.textContent = team;
      teamFilter.appendChild(option);
    });
  }
  
  // Function to render players based on current filters
  function renderPlayers(players) {
    tableBody.innerHTML = "";
    
    if (!players.length) {
      tableBody.innerHTML = `<tr><td colspan="14" class="text-center">No players match your current filters.</td></tr>`;
      return;
    }
    
    // Sort by Points Per Game
    players.sort((a, b) => b.stats.ppg - a.stats.ppg);
    
    players.forEach((player, index) => {
      const { stats = {} } = player;
      
      const row = document.createElement("tr");
      row.classList.add("player-row");
      row.dataset.playerId = player.id;
      
      row.innerHTML = `
        <td>${index + 1}</td>
        <td class="player-name">
          <img src="${player.image || ''}" alt="${player.name || 'Player'}" onerror="this.src='static/img/player_placeholder.png'">
          <span>${player.name || 'N/A'}</span>
        </td>
        <td>${player.team || 'N/A'}</td>
        <td>${stats.gp || 0}</td>
        <td>${(stats.mpg || 0).toFixed(1)}</td>
        <td>${(stats.ppg || 0).toFixed(1)}</td>
        <td>${(stats.rpg || 0).toFixed(1)}</td>
        <td>${(stats.apg || 0).toFixed(1)}</td>
        <td>${(stats.spg || 0).toFixed(1)}</td>
        <td>${(stats.bpg || 0).toFixed(1)}</td>
        <td>${((stats.fgp || 0) * 100).toFixed(1)}</td>
        <td>${((stats.tpp || 0) * 100).toFixed(1)}</td>
        <td>${((stats.ftp || 0) * 100).toFixed(1)}</td>
        <td><button class="btn btn-sm btn-primary player-details-btn">Details</button></td>
      `;
      
      tableBody.appendChild(row);
    });
    
    // Add event listeners to player rows and detail buttons
    addPlayerRowEventListeners();
  }
  
  // Setup event listeners for filters
  function setupFilters() {
    const filterElements = [playerSearch, teamFilter, positionFilter, leagueFilter];
    
    filterElements.forEach(element => {
      element.addEventListener("input", applyFilters);
      element.addEventListener("change", applyFilters);
    });
  }
  
// Apply all filters to player data
function applyFilters() {
  const searchTerm = playerSearch.value.toLowerCase().trim();
  const team = teamFilter.value;
  const position = positionFilter.value;
  const league = leagueFilter.value;

  const filteredPlayers = allPlayers.filter(player => {
    const nameMatch = player.name && player.name.toLowerCase().includes(searchTerm);
    const teamMatch = team === "all" || player.team === team;
    const positionMap = {
      pg: ["pg", "point guard", "g", "guard"],
      sg: ["sg", "shooting guard", "g", "guard"],
      sf: ["sf", "small forward", "f", "forward"],
      pf: ["pf", "power forward", "f", "forward"],
      c: ["c", "center"]
    };

    const positionMatch =
      position === "all" ||
      (
        player.position &&
        positionMap[position] &&
        positionMap[position].some(
          pos => player.position.toLowerCase().includes(pos)
        )
      );
    const leagueMatch = league === "all" || league === "nba";

    return nameMatch && teamMatch && positionMatch && leagueMatch;
  });

  renderPlayers(filteredPlayers);
}

  
  // Add event listeners to player rows and detail buttons
  function addPlayerRowEventListeners() {
    // Detail buttons
    document.querySelectorAll('.player-details-btn').forEach(button => {
      button.addEventListener('click', showPlayerDetails);
    });
    
    // Make entire rows clickable for details
    document.querySelectorAll('.player-row').forEach(row => {
      row.addEventListener('click', (e) => {
        // Only trigger if click wasn't on the button itself
        if (!e.target.classList.contains('player-details-btn')) {
          const button = row.querySelector('.player-details-btn');
          if (button) button.click();
        }
      });
    });
  }
  
  // Show player details in modal
  function showPlayerDetails(e) {
    e.stopPropagation();
    
    const playerId = e.target.closest('.player-row').dataset.playerId;
    const player = allPlayers.find(p => p.id == playerId);
    
    if (!player) return;
    
    // Populate modal with player data
    document.getElementById('modalPlayerImg').src = player.image || 'static/img/player_placeholder.png';
    document.getElementById('modalPlayerImg').alt = player.name;
    document.getElementById('modalPlayerName').textContent = player.name;
    document.getElementById('modalPlayerTeam').textContent = player.teamFull || player.team;
    document.getElementById('modalPlayerPosition').textContent = player.position || 'N/A';
    document.getElementById('modalPlayerHeight').textContent = player.height || 'N/A';
    document.getElementById('modalPlayerWeight').textContent = player.weight || 'N/A';
    document.getElementById('modalPlayerAge').textContent = player.age || 'N/A';
    
    // Calculate stats for different time periods
    updatePlayerStats(player);
    
    // Setup Game Log tab
    setupGameLogTab(player);
    
    // Remove the splits tab since it's not implemented
    const splitsTab = document.getElementById('splits-tab');
    const splitsPane = document.getElementById('splits');
    if (splitsTab) splitsTab.style.display = 'none';
    if (splitsPane) splitsPane.style.display = 'none';
    
    // Make sure the stats tab is active
    const statsTab = document.getElementById('stats-tab');
    if (statsTab) statsTab.click();
    
    // Show modal
    $('#playerDetailModal').modal('show');
  }
  
  // Function to set up the Game Log tab
  function setupGameLogTab(player) {
    const gameLogContainer = document.querySelector('#game-log .game-log-container');
    
    // Add loading indicator
    gameLogContainer.innerHTML = `
      <div class="text-center my-4">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
        <p class="mt-2">Loading game log...</p>
      </div>
    `;
    
    // Fetch game logs
    fetch(`/api/player/${player.id}/game_logs`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch game logs");
        return res.json();
      })
      .then(games => {
        if (!games || !games.length) {
          gameLogContainer.innerHTML = '<p class="text-center">No game data available</p>';
          return;
        }
        
        // Create game log table
        gameLogContainer.innerHTML = createGameLogTable(games, true);
      })
      .catch(err => {
        console.error("Error fetching game logs:", err);
        gameLogContainer.innerHTML = `
          <div class="alert alert-danger" role="alert">
            Failed to load game log data. Please try again later.
          </div>
        `;
      });
  }
  
  // Function to update player stats in the modal
  function updatePlayerStats(player) {
    const { stats = {} } = player;
    const statsContainer = document.querySelector('#stats .stats-container');
    
    // Add loading indicator
    statsContainer.innerHTML = `
      <div class="text-center my-4">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
        <p class="mt-2">Loading statistics...</p>
      </div>
    `;
    
    // Update stats based on selected period
    const updateStatsByPeriod = () => {
      const selectedPeriod = document.getElementById('statPeriodSelector')?.value || 'season';
      const viewType = document.querySelector('input[name="viewType"]:checked')?.value || 'average';
      
      console.log("Updating stats:", { period: selectedPeriod, viewType });
      
      // Show loading indicator while fetching data
      statsContainer.innerHTML = createStatsControlsHTML(selectedPeriod, viewType) + `
        <div class="text-center my-4">
          <div class="spinner-border text-primary" role="status">
            <span class="sr-only">Loading...</span>
          </div>
          <p class="mt-2">Loading ${selectedPeriod} statistics...</p>
        </div>
      `;
      
      // Add event listeners for the controls
      setupControlListeners();
      
      // Fetch the appropriate data based on the selected period
      switch(selectedPeriod) {
        case 'season':
          if (viewType === 'average') {
            displayAverageStats(stats, selectedPeriod);
          } else {
            fetchTotalStats(player.id);
          }
          break;
          
        case 'last10':
          // Fetch last 10 games stats from API
          fetch(`/api/player/${player.id}/last10`)
            .then(res => {
              if (!res.ok) throw new Error("Failed to fetch last 10 games data");
              return res.json();
            })
            .then(data => {
              console.log("Last 10 games data:", data);
              if (viewType === 'average') {
                displayAverageStats(data.stats, selectedPeriod);
              } else {
                displayTotalStats({
                  points: data.stats.total_points,
                  rebounds: data.stats.total_rebounds,
                  assists: data.stats.total_assists,
                  steals: data.stats.total_steals,
                  blocks: data.stats.total_blocks,
                  minutes: data.stats.total_minutes,
                  games: data.stats.gp,
                  fgp: data.stats.fgp * 100,
                  tpp: data.stats.tpp * 100,
                  ftp: data.stats.ftp * 100
                }, selectedPeriod);
              }
              
              // Add game log table below the stats
              const gameLogHTML = createGameLogTable(data.games);
              document.querySelector('#stats .stats-container').insertAdjacentHTML('beforeend', 
                `<h5 class="mt-4">Last ${data.games.length} Games</h5>${gameLogHTML}`
              );
            })
            .catch(err => {
              console.error("Error fetching last 10 games:", err);
              displayAverageStats(stats, 'season'); // Fall back to season stats
            });
          break;
          
        case 'lastGame':
          // Fetch last game stats from API
          fetch(`/api/player/${player.id}/last_game`)
            .then(res => {
              if (!res.ok) throw new Error("Failed to fetch last game data");
              return res.json();
            })
            .then(data => {
              console.log("Last game data:", data);
              if (viewType === 'average') {
                displayAverageStats(data.stats, selectedPeriod);
              } else {
                displayTotalStats({
                  points: data.stats.total_points,
                  rebounds: data.stats.total_rebounds,
                  assists: data.stats.total_assists,
                  steals: data.stats.total_steals,
                  blocks: data.stats.total_blocks,
                  minutes: data.stats.total_minutes,
                  games: 1,
                  fgp: data.stats.fgp * 100,
                  tpp: data.stats.tpp * 100,
                  ftp: data.stats.ftp * 100
                }, selectedPeriod);
              }
              
              // Add game details below the stats
              const gameDetails = data.game;
              const gameDetailsHTML = `
                <div class="last-game-details mt-4">
                  <h5>Game Details - ${gameDetails.date}</h5>
                  <div class="game-result mb-3">
                    <strong>${player.team}</strong> vs <strong>${gameDetails.opponent}</strong>: ${gameDetails.result}
                  </div>
                </div>
              `;
              document.querySelector('#stats .stats-container').insertAdjacentHTML('beforeend', gameDetailsHTML);
            })
            .catch(err => {
              console.error("Error fetching last game:", err);
              displayAverageStats(stats, 'season'); // Fall back to season stats
            });
          break;
      }
    };
    
    // Helper function to set up control listeners
    function setupControlListeners() {
      // Add event listener to the period selector
      const periodSelector = document.getElementById('statPeriodSelector');
      if (periodSelector) {
        console.log("Setting up event listener for period selector");
        periodSelector.removeEventListener('change', updateStatsByPeriod); // Remove any existing listeners
        periodSelector.addEventListener('change', updateStatsByPeriod);
      }
      
      // Add event listeners to the view type radio buttons
      document.querySelectorAll('input[name="viewType"]').forEach(radio => {
        console.log("Setting up event listener for radio button", radio.id);
        radio.removeEventListener('change', updateStatsByPeriod); // Remove any existing listeners
        radio.addEventListener('change', updateStatsByPeriod);
      });
    }
    
    // Helper function to create stats controls HTML
    function createStatsControlsHTML(period, viewType) {
      return `
        <div class="stat-controls mb-3 d-flex flex-wrap align-items-center">
          <div class="stat-period-selector d-flex align-items-center mr-4">
            <label for="statPeriodSelector" class="mr-2">Time period:</label>
            <select id="statPeriodSelector" class="form-control form-control-sm">
              <option value="season" ${period === 'season' ? 'selected' : ''}>Season</option>
              <option value="last10" ${period === 'last10' ? 'selected' : ''}>Last 10 Games</option>
              <option value="lastGame" ${period === 'lastGame' ? 'selected' : ''}>Last Game</option>
            </select>
          </div>
          <div class="view-type-selector d-flex align-items-center">
            <label class="mr-2">View:</label>
            <div class="custom-control custom-radio custom-control-inline">
              <input type="radio" id="averageStats" name="viewType" value="average" class="custom-control-input" ${viewType === 'average' ? 'checked' : ''}>
              <label class="custom-control-label" for="averageStats">Averages</label>
            </div>
            <div class="custom-control custom-radio custom-control-inline">
              <input type="radio" id="totalStats" name="viewType" value="total" class="custom-control-input" ${viewType === 'total' ? 'checked' : ''}>
              <label class="custom-control-label" for="totalStats">Totals</label>
            </div>
          </div>
        </div>
      `;
    }
    
    // Helper function to fetch and display total stats
    function fetchTotalStats(playerId) {
      if ('total_points' in stats) {
        // Use total stats directly from player object
        displayTotalStats({
          points: stats.total_points,
          rebounds: stats.total_rebounds,
          assists: stats.total_assists,
          steals: stats.total_steals,
          blocks: stats.total_blocks,
          minutes: stats.total_minutes,
          games: stats.gp,
          fgp: stats.fgp * 100,
          tpp: stats.tpp * 100,
          ftp: stats.ftp * 100
        }, 'season');
      } else {
        // Fetch from API
        fetch(`/api/player/${playerId}/total_stats`)
          .then(res => {
            if (!res.ok) throw new Error("Failed to fetch total stats");
            return res.json();
          })
          .then(data => {
            console.log("Total stats data:", data);
            displayTotalStats(data, 'season');
          })
          .catch(err => {
            console.error("Error fetching total stats:", err);
            
            // Fallback: calculate from game averages
            const totalStats = {
              points: Math.round(stats.ppg * stats.gp),
              rebounds: Math.round(stats.rpg * stats.gp),
              assists: Math.round(stats.apg * stats.gp),
              steals: Math.round(stats.spg * stats.gp),
              blocks: Math.round(stats.bpg * stats.gp),
              minutes: Math.round(stats.mpg * stats.gp),
              games: stats.gp,
              fgp: stats.fgp * 100,
              tpp: stats.tpp * 100,
              ftp: stats.ftp * 100
            };
            
            displayTotalStats(totalStats, 'season');
          });
      }
    }
    
    // Helper function to display average stats in the container
    function displayAverageStats(statsData, period) {
      let statsHTML = createStatsGridHTML({
        'Points': (statsData.ppg || 0).toFixed(1),
        'Rebounds': (statsData.rpg || 0).toFixed(1),
        'Assists': (statsData.apg || 0).toFixed(1),
        'Steals': (statsData.spg || 0).toFixed(1),
        'Blocks': (statsData.bpg || 0).toFixed(1),
        'Minutes': (statsData.mpg || 0).toFixed(1),
        'Games': statsData.gp || 0,
        'FG%': ((statsData.fgp || 0) * 100).toFixed(1) + '%',
        '3P%': ((statsData.tpp || 0) * 100).toFixed(1) + '%',
        'FT%': ((statsData.ftp || 0) * 100).toFixed(1) + '%'
      });
      
      // Get period text for notice
      let periodText = '';
      switch(period) {
        case 'season': periodText = `the entire season (${statsData.gp} games)`; break;
        case 'last10': periodText = `the last ${statsData.gp} games`; break;
        case 'lastGame': periodText = 'the most recent game'; break;
      }
      
      // Add explanatory text for per-game averages
      const averageNoticeHTML = `
        <div class="alert alert-info mt-3">
          <small><i class="fas fa-info-circle mr-2"></i> Stats shown are per-game averages over ${periodText}.</small>
        </div>
      `;
      
      const controlsHTML = createStatsControlsHTML(period, 'average');
      
      statsContainer.innerHTML = controlsHTML + statsHTML + averageNoticeHTML;
      
      // Setup control listeners
      setupControlListeners();
    }
    
    // Helper function to display total stats
    function displayTotalStats(totalStats, period) {
      const statsHTML = createStatsGridHTML({
        'Points': Math.round(totalStats.points),
        'Rebounds': Math.round(totalStats.rebounds),
        'Assists': Math.round(totalStats.assists),
        'Steals': Math.round(totalStats.steals),
        'Blocks': Math.round(totalStats.blocks),
        'Minutes': Math.round(totalStats.minutes),
        'Games': totalStats.games,
        'FG%': totalStats.fgp.toFixed(1) + '%',
        '3P%': totalStats.tpp.toFixed(1) + '%',
        'FT%': totalStats.ftp.toFixed(1) + '%'
      });
      
      // Get period text for notice
      let periodText = '';
      switch(period) {
        case 'season': periodText = `the entire season (${totalStats.games} games)`; break;
        case 'last10': periodText = `the last ${totalStats.games} games`; break;
        case 'lastGame': periodText = 'the most recent game'; break;
      }
      
      // Add explanatory text for total stats
      const totalNoticeHTML = `
        <div class="alert alert-info mt-3">
          <small><i class="fas fa-info-circle mr-2"></i> Stats shown are cumulative totals over ${periodText}.</small>
        </div>
      `;
      
      const controlsHTML = createStatsControlsHTML(period, 'total');
      
      statsContainer.innerHTML = controlsHTML + statsHTML + totalNoticeHTML;
      
      // Setup control listeners
      setupControlListeners();
    }
    
    // Initial update
    updateStatsByPeriod();
  }
  
  // Helper function to create stats grid HTML
  function createStatsGridHTML(statsObj) {
    let html = '<div class="stats-grid">';
    
    Object.entries(statsObj).forEach(([label, value]) => {
      html += `
        <div class="stat-item">
          <span class="stat-value">${value}</span>
          <span class="stat-label">${label}</span>
        </div>
      `;
    });
    
    html += '</div>';
    return html;
  }
  
  // Helper function to create a game log table
  function createGameLogTable(games, fullTable = false) {
    if (!games || !games.length) return '<p>No game data available</p>';
    
    let html = `
      <div class="table-responsive">
        <table class="table table-sm table-hover">
          <thead>
            <tr>
              <th>Date</th>
              <th>OPP</th>
              <th>Result</th>
              <th>MIN</th>
              <th>PTS</th>
              <th>REB</th>
              <th>AST</th>
              <th>STL</th>
              <th>BLK</th>
              <th>FG%</th>
              <th>3P%</th>
              ${fullTable ? '<th>FT%</th>' : ''}
            </tr>
          </thead>
          <tbody>
    `;
    
    games.forEach(game => {
      html += `
        <tr>
          <td>${game.date}</td>
          <td>${game.opponent}</td>
          <td>${game.result}</td>
          <td>${game.minutes}</td>
          <td>${game.points}</td>
          <td>${game.rebounds}</td>
          <td>${game.assists}</td>
          <td>${game.steals}</td>
          <td>${game.blocks}</td>
          <td>${game.fg_pct}%</td>
          <td>${game.tp_pct}%</td>
          ${fullTable ? `<td>${game.ft_pct}%</td>` : ''}
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
    
    return html;
  }
  
  
  function setupCategoryTabs() {
    document.querySelectorAll('.stat-tab').forEach(tab => {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.stat-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        const category = this.dataset.category;
        let sortedPlayers = [...allPlayers];

        switch (category) {
          case 'offense':
            sortedPlayers.sort((a, b) => (b.stats.ppg || 0) - (a.stats.ppg || 0));
            break;
          case 'defense':
            sortedPlayers.sort((a, b) => {
              const defA = (a.stats.rpg || 0) + (a.stats.spg || 0) + (a.stats.bpg || 0);
              const defB = (b.stats.rpg || 0) + (b.stats.spg || 0) + (b.stats.bpg || 0);
              return defB - defA;
            });
            break;
          case 'shooting':
            sortedPlayers.sort((a, b) => (b.stats.tpp || 0) - (a.stats.tpp || 0));
            break;
          case 'advanced':
            sortedPlayers.sort((a, b) => {
              const advA = (a.stats.ppg || 0) + (a.stats.apg || 0) + (a.stats.rpg || 0) + (a.stats.spg || 0) + (a.stats.bpg || 0);
              const advB = (b.stats.ppg || 0) + (b.stats.apg || 0) + (b.stats.rpg || 0) + (b.stats.spg || 0) + (b.stats.bpg || 0);
              return advB - advA;
            });
            break;
          default:
            sortedPlayers.sort((a, b) => (b.stats.ppg || 0) - (a.stats.ppg || 0));
        }

        renderPlayers(sortedPlayers);
      });
    });
  }


  // Remove the splits tab handler since we're removing the feature
  document.getElementById('splits-tab')?.removeEventListener('click', function() {});

  // Category tabs functionality (must be inside DOMContentLoaded to access allPlayers)
  document.querySelectorAll('.stat-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      // Toggle active tab UI
      document.querySelectorAll('.stat-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      const category = this.dataset.category;
      let sortedPlayers = [...allPlayers];

      switch (category) {
        case 'offense':
          sortedPlayers.sort((a, b) => (b.stats.ppg || 0) - (a.stats.ppg || 0));
          break;
        case 'defense':
          sortedPlayers.sort((a, b) => {
            const defA = (a.stats.rpg || 0) + (a.stats.spg || 0) + (a.stats.bpg || 0);
            const defB = (b.stats.rpg || 0) + (b.stats.spg || 0) + (b.stats.bpg || 0);
            return defB - defA;
          });
          break;
        case 'shooting':
          sortedPlayers.sort((a, b) => (b.stats.tpp || 0) - (a.stats.tpp || 0));
          break;
        case 'advanced':
          sortedPlayers.sort((a, b) => {
            const advA = (a.stats.ppg || 0) + (a.stats.apg || 0) + (a.stats.rpg || 0) + (a.stats.spg || 0) + (a.stats.bpg || 0);
            const advB = (b.stats.ppg || 0) + (b.stats.apg || 0) + (b.stats.rpg || 0) + (b.stats.spg || 0) + (b.stats.bpg || 0);
            return defB - defA;
          });
          break;
        default:
          sortedPlayers.sort((a, b) => (b.stats.ppg || 0) - (a.stats.ppg || 0));
      }

      renderPlayers(sortedPlayers);
    });
  });
});

// Category tabs functionality
document.querySelectorAll('.stat-tab').forEach(tab => {
  tab.addEventListener('click', function () {
    // Toggle active tab UI
    document.querySelectorAll('.stat-tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');

    const category = this.dataset.category;
    let sortedPlayers = [...allPlayers];

    switch (category) {
      case 'offense':
        // Sort by Points Per Game (PPG)
        sortedPlayers.sort((a, b) => (b.stats.ppg || 0) - (a.stats.ppg || 0));
        break;
      case 'defense':
        // Sort by total of RPG + SPG + BPG
        sortedPlayers.sort((a, b) => {
          const defA = (a.stats.rpg || 0) + (a.stats.spg || 0) + (a.stats.bpg || 0);
          const defB = (b.stats.rpg || 0) + (b.stats.spg || 0) + (b.stats.bpg || 0);
          return defB - defA;
        });
        break;
      case 'shooting':
        // Sort by 3P% (Three Point Percentage)
        sortedPlayers.sort((a, b) => (b.stats.tpp || 0) - (a.stats.tpp || 0));
        break;
      case 'advanced':
        // Sort by total contribution (custom: PPG + RPG + APG + SPG + BPG)
        sortedPlayers.sort((a, b) => {
          const advA = (a.stats.ppg || 0) + (a.stats.apg || 0) + (a.stats.rpg || 0) + (a.stats.spg || 0) + (a.stats.bpg || 0);
          const advB = (b.stats.ppg || 0) + (b.stats.apg || 0) + (b.stats.rpg || 0) + (b.stats.spg || 0) + (b.stats.bpg || 0);
          return advB - advA;
        });
        break;
      default:
        // Default to sorting by PPG (Overall)
        sortedPlayers.sort((a, b) => (b.stats.ppg || 0) - (a.stats.ppg || 0));
    }

    renderPlayers(sortedPlayers);
  });
});



  // Category tabs functionality
  function setupCategoryTabs() {
    const statTabs = document.querySelectorAll(".stat-tab");
    statTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        statTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        const category = tab.dataset.category;
        let sortedPlayers = [...allPlayers];

        switch (category) {
          case "offense":
            sortedPlayers.sort((a, b) => (b.stats.ppg || 0) - (a.stats.ppg || 0));
            break;
          case "defense":
            sortedPlayers.sort((a, b) => {
              const defA = (a.stats.rpg || 0) + (a.stats.spg || 0) + (a.stats.bpg || 0);
              const defB = (b.stats.rpg || 0) + (b.stats.spg || 0) + (b.stats.bpg || 0);
              return defB - defA;
            });
            break;
          case "shooting":
            sortedPlayers.sort((a, b) => (b.stats.tpp || 0) - (a.stats.tpp || 0));
            break;
          case "advanced":
            sortedPlayers.sort((a, b) => {
              const advA = (a.stats.ppg || 0) + (a.stats.apg || 0) + (a.stats.rpg || 0) + (a.stats.spg || 0) + (a.stats.bpg || 0);
              const advB = (b.stats.ppg || 0) + (b.stats.apg || 0) + (b.stats.rpg || 0) + (b.stats.spg || 0) + (b.stats.bpg || 0);
              return advB - advA;
            });
            break;
          default:
            sortedPlayers.sort((a, b) => (b.stats.ppg || 0) - (a.stats.ppg || 0));
        }

        renderPlayers(sortedPlayers);
      });
    });
  }
