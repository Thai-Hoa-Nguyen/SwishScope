document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("playersTableBody");
  const playerSearch = document.getElementById("playerSearch");
  const teamFilter = document.getElementById("teamFilter");
  const positionFilter = document.getElementById("positionFilter");
  const leagueFilter = document.getElementById("leagueFilter");
  let allPlayers = [];

  tableBody.innerHTML = `
    <tr>
      <td colspan="14" class="text-center">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2">Loading player data...</p>
      </td>
    </tr>
  `;

  fetch("/api/playoff_players")
    .then(res => res.json())
    .then(players => {
      allPlayers = players;
      populateTeamFilter(players);
      renderPlayers(players);
      setupFilters();
      setupCategoryTabs();
    })
    .catch(err => {
      console.error("Failed to load player data:", err);
      tableBody.innerHTML = `
        <tr><td colspan="14" class="text-danger text-center">Failed to load player data.</td></tr>
      `;
    });

  function populateTeamFilter(players) {
    const teams = [...new Set(players.map(p => p.team))].sort();
    teamFilter.innerHTML = `<option value="all">All Teams</option>`;
    teams.forEach(team => {
      const opt = document.createElement("option");
      opt.value = team;
      opt.textContent = team;
      teamFilter.appendChild(opt);
    });
  }

  function setupFilters() {
    [playerSearch, teamFilter, positionFilter, leagueFilter].forEach(el => {
      el.addEventListener("input", applyFilters);
      el.addEventListener("change", applyFilters);
    });
  }

  function applyFilters() {
    const name = playerSearch.value.toLowerCase().trim();
    const team = teamFilter.value;
    const pos = positionFilter.value;
    const league = leagueFilter.value;

    const positionMap = {
      pg: ["point guard", "pg", "g"],
      sg: ["shooting guard", "sg", "g"],
      sf: ["small forward", "sf", "f"],
      pf: ["power forward", "pf", "f"],
      c: ["center"]
    };

    const filtered = allPlayers.filter(player => {
      const matchesName = player.name?.toLowerCase().includes(name);
      const matchesTeam = team === "all" || player.team === team;
      const matchesPos = pos === "all" || positionMap[pos]?.some(p => player.position?.toLowerCase().includes(p));
      const matchesLeague = league === "all" || league === "nba";

      return matchesName && matchesTeam && matchesPos && matchesLeague;
    });

    renderPlayers(filtered);
  }

  function renderPlayers(players) {
    tableBody.innerHTML = "";

    if (players.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="14" class="text-center">No players found</td></tr>`;
      return;
    }

    players.sort((a, b) => (b.stats.ppg || 0) - (a.stats.ppg || 0));

    players.forEach((p, i) => {
      const stats = p.stats || {};
      const row = document.createElement("tr");
      row.className = "player-row";
      row.dataset.playerId = p.id;
      row.innerHTML = `
        <td>${i + 1}</td>
        <td class="player-name">
          <img src="${p.image}" alt="${p.name}" onerror="this.src='static/img/player_placeholder.png'">
          <span>${p.name}</span>
        </td>
        <td>${p.team}</td>
        <td>${stats.gp}</td>
        <td>${stats.mpg.toFixed(1)}</td>
        <td>${stats.ppg.toFixed(1)}</td>
        <td>${stats.rpg.toFixed(1)}</td>
        <td>${stats.apg.toFixed(1)}</td>
        <td>${stats.spg.toFixed(1)}</td>
        <td>${stats.bpg.toFixed(1)}</td>
        <td>${(stats.fgp * 100).toFixed(1)}</td>
        <td>${(stats.tpp * 100).toFixed(1)}</td>
        <td>${(stats.ftp * 100).toFixed(1)}</td>
        <td><button class="btn btn-sm btn-primary player-details-btn">Details</button></td>
      `;
      tableBody.appendChild(row);
    });

    addPlayerRowEventListeners();
  }

  function addPlayerRowEventListeners() {
    document.querySelectorAll('.player-details-btn').forEach(btn => {
      btn.addEventListener('click', showPlayerDetails);
    });

    document.querySelectorAll('.player-row').forEach(row => {
      row.addEventListener('click', e => {
        if (!e.target.classList.contains('player-details-btn')) {
          row.querySelector('.player-details-btn')?.click();
        }
      });
    });
  }

  async function showPlayerDetails(e) {
    e.stopPropagation();
    const playerId = e.target.closest(".player-row").dataset.playerId;
    const player = allPlayers.find(p => p.id == playerId);
    if (!player) return;

    // Basic Info
    document.getElementById("modalPlayerImg").src = player.image;
    document.getElementById("modalPlayerName").textContent = player.name;
    document.getElementById("modalPlayerTeam").textContent = player.teamFull || player.team;
    document.getElementById("modalPlayerPosition").textContent = player.position;
    document.getElementById("modalPlayerHeight").textContent = player.height;
    document.getElementById("modalPlayerWeight").textContent = player.weight;
    document.getElementById("modalPlayerAge").textContent = player.age;

    updatePlayerStats(player.stats);

    // Load Game Log
    const gameLogContainer = document.querySelector('#game-log .game-log-container');
    gameLogContainer.innerHTML = `<div class="text-center">Loading game log...</div>`;

    try {
      const res = await fetch(`/api/player/${playerId}/game_logs`);
      if (!res.ok) throw new Error("Failed to fetch game log");
      const games = await res.json();

      if (!games.length) {
        gameLogContainer.innerHTML = `<div class="text-center">No game log available</div>`;
        return;
      }

      gameLogContainer.innerHTML = createGameLogTable(games);
    } catch (err) {
      gameLogContainer.innerHTML = `<div class="text-danger text-center">Error loading game log</div>`;
    }

    $('#playerDetailModal').modal('show');
  }

  function updatePlayerStats(stats = {}) {
    const statsContainer = document.querySelector('#stats .stats-container');
    statsContainer.innerHTML = `
      <div class="stats-grid">
        <div class="stat-item"><span class="stat-value">${stats.ppg.toFixed(1)}</span><span class="stat-label">Points</span></div>
        <div class="stat-item"><span class="stat-value">${stats.rpg.toFixed(1)}</span><span class="stat-label">Rebounds</span></div>
        <div class="stat-item"><span class="stat-value">${stats.apg.toFixed(1)}</span><span class="stat-label">Assists</span></div>
        <div class="stat-item"><span class="stat-value">${stats.spg.toFixed(1)}</span><span class="stat-label">Steals</span></div>
        <div class="stat-item"><span class="stat-value">${stats.bpg.toFixed(1)}</span><span class="stat-label">Blocks</span></div>
        <div class="stat-item"><span class="stat-value">${stats.mpg.toFixed(1)}</span><span class="stat-label">Minutes</span></div>
        <div class="stat-item"><span class="stat-value">${stats.gp}</span><span class="stat-label">Games</span></div>
        <div class="stat-item"><span class="stat-value">${(stats.fgp * 100).toFixed(1)}%</span><span class="stat-label">FG%</span></div>
        <div class="stat-item"><span class="stat-value">${(stats.tpp * 100).toFixed(1)}%</span><span class="stat-label">3P%</span></div>
        <div class="stat-item"><span class="stat-value">${(stats.ftp * 100).toFixed(1)}%</span><span class="stat-label">FT%</span></div>
      </div>
    `;
  }

  function createGameLogTable(games) {
    let html = `
      <div class="table-responsive">
        <table class="table table-sm table-striped">
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
              <th>FT%</th>
            </tr>
          </thead>
          <tbody>
    `;

    games.forEach(g => {
      html += `
        <tr>
          <td>${g.date}</td>
          <td>${g.opponent}</td>
          <td>${g.result}</td>
          <td>${g.minutes}</td>
          <td>${g.points}</td>
          <td>${g.rebounds}</td>
          <td>${g.assists}</td>
          <td>${g.steals}</td>
          <td>${g.blocks}</td>
          <td>${g.fg_pct}%</td>
          <td>${g.tp_pct}%</td>
          <td>${g.ft_pct}%</td>
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
      tab.addEventListener('click', () => {
        document.querySelectorAll('.stat-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const cat = tab.dataset.category;
        let sorted = [...allPlayers];

        switch (cat) {
          case 'offense':
            sorted.sort((a, b) => (b.stats.ppg || 0) - (a.stats.ppg || 0));
            break;
          case 'defense':
            sorted.sort((a, b) => (
              (b.stats.rpg + b.stats.spg + b.stats.bpg) - 
              (a.stats.rpg + a.stats.spg + a.stats.bpg)
            ));
            break;
          case 'shooting':
            sorted.sort((a, b) => (b.stats.tpp || 0) - (a.stats.tpp || 0));
            break;
          case 'advanced':
            sorted.sort((a, b) => {
              const aScore = a.stats.ppg + a.stats.apg + a.stats.rpg + a.stats.spg + a.stats.bpg;
              const bScore = b.stats.ppg + b.stats.apg + b.stats.rpg + b.stats.spg + b.stats.bpg;
              return bScore - aScore;
            });
            break;
        }

        renderPlayers(sorted);
      });
    });
  }
});
