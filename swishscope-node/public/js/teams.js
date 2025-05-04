document.addEventListener('DOMContentLoaded', () => {
  const leagueFilter = document.getElementById('leagueFilter');
  const conferenceFilter = document.getElementById('conferenceFilter');
  const teamSearch = document.getElementById('teamSearch');
  const teamsContainer = document.getElementById('teamsContainer');
  let teamsData = {};

  // Fetch and initialize
  fetch('/api/teams')
    .then(res => res.json())
    .then(data => {
      teamsData = data;
      leagueFilter.value = 'nba';
      populateConferences();
      renderTeams(getFilteredTeams());
    })
    .catch(err => {
      console.error("Failed to fetch team data:", err);
      teamsContainer.innerHTML = '<div class="col-12 text-center text-danger"><h3>Failed to load team data</h3></div>';
    });

  // Event listeners
  leagueFilter.addEventListener('change', () => {
    populateConferences();
    renderTeams(getFilteredTeams());
  });
  conferenceFilter.addEventListener('change', () => renderTeams(getFilteredTeams()));
  teamSearch.addEventListener('input', () => renderTeams(getFilteredTeams()));

  // Filter and return teams based on inputs
  function getFilteredTeams() {
    const league = leagueFilter.value;
    const conference = conferenceFilter.value.toLowerCase();
    const search = teamSearch.value.toLowerCase();

    let teams = league === 'all'
      ? Object.values(teamsData).flat()
      : teamsData[league] || [];

    if (conference !== 'all') {
      teams = teams.filter(team => (team.conference || '').toLowerCase() === conference);
    }

    if (search) {
      teams = teams.filter(team => (team.name || '').toLowerCase().includes(search));
    }

    return teams;
  }

  // Populate conference dropdown based on selected league
  function populateConferences() {
    const league = leagueFilter.value;
    const selectedTeams = league === 'all'
      ? Object.values(teamsData).flat()
      : teamsData[league] || [];

    const conferences = [...new Set(selectedTeams.map(t => t.conference).filter(Boolean))].sort();

    conferenceFilter.innerHTML = '<option value="all">All Conferences</option>';
    conferences.forEach(conf => {
      const option = document.createElement('option');
      option.value = conf.toLowerCase();
      option.textContent = conf;
      conferenceFilter.appendChild(option);
    });
  }

  // Render all team cards
  function renderTeams(teams) {
    teamsContainer.innerHTML = '';

    if (!teams.length) {
      teamsContainer.innerHTML = `
        <div class="col-12 text-center">
          <h3>No teams found matching your criteria</h3>
        </div>`;
      return;
    }

    teams.forEach(team => {
      const card = document.createElement('div');
      card.className = 'col-md-4 team-card';
      card.innerHTML = `
        <div class="card h-100">
          <img src="${team.logo || 'static/img/team_placeholder.png'}" class="card-img-top" alt="${team.name}">
          <div class="card-body">
            <h5 class="card-title">${team.name}</h5>
            <p class="team-conference">${team.conference || 'N/A'}</p>
            <div class="team-info">
              <div class="team-stat"><div class="stat-label">Wins</div><div class="stat-value">${team.wins ?? '-'}</div></div>
              <div class="team-stat"><div class="stat-label">Losses</div><div class="stat-value">${team.losses ?? '-'}</div></div>
              <div class="team-stat"><div class="stat-label">PCT</div><div class="stat-value">${(team.winPct ?? 0).toFixed(3)}</div></div>
            </div>
            <button class="btn btn-primary btn-block" onclick="viewTeamDetails(${team.id})">View Details</button>
          </div>
        </div>`;
      teamsContainer.appendChild(card);
    });
  }

  // View team detail modal
  window.viewTeamDetails = function (teamId) {
    const allTeams = Object.values(teamsData).flat();
    const team = allTeams.find(t => t.id === teamId);
    if (!team) return;

    const html = `
      <img src="${team.logo || 'static/img/team_placeholder.png'}" class="img-fluid mb-3" style="max-height: 100px;">
      <h4>${team.name}</h4>
      <p><strong>Conference:</strong> ${team.conference || 'N/A'}</p>
      <p><strong>Division:</strong> ${team.division || 'N/A'}</p>
      <p><strong>Wins:</strong> ${team.wins ?? '-'}</p>
      <p><strong>Losses:</strong> ${team.losses ?? '-'}</p>
      <p><strong>Win %:</strong> ${(team.winPct ?? 0).toFixed(3)}</p>
    `;
    document.getElementById('teamModalBody').innerHTML = html;
    $('#teamModal').modal('show');
  };
});
