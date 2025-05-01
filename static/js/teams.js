// DOM elements
const leagueFilter = document.getElementById('leagueFilter');
const conferenceFilter = document.getElementById('conferenceFilter');
const teamSearch = document.getElementById('teamSearch');
const teamsContainer = document.getElementById('teamsContainer');

let teamsData = { nba: [] };

// Load data on page load
document.addEventListener('DOMContentLoaded', function () {
  leagueFilter.value = "nba";

  fetch('/api/teams')
    .then(res => res.json())
    .then(data => {
      teamsData = data;
      populateConferences();
      renderTeams();
    })
    .catch(err => {
      console.error("Failed to fetch team data:", err);
      teamsContainer.innerHTML = '<div class="col-12 text-center text-danger"><h3>Failed to load team data</h3></div>';
    });

  leagueFilter.addEventListener('change', filterTeams);
  conferenceFilter.addEventListener('change', filterTeams);
  teamSearch.addEventListener('input', filterTeams);
});

// Populate conference dropdown
function populateConferences() {
  const conferenceSet = new Set();
  const selectedLeague = leagueFilter.value === 'all'
    ? Object.keys(teamsData)
    : [leagueFilter.value];

  while (conferenceFilter.options.length > 1) {
    conferenceFilter.remove(1);
  }

  selectedLeague.forEach(league => {
    teamsData[league]?.forEach(team => {
      if (team.conference) {
        conferenceSet.add(team.conference);
      }
    });
  });

  conferenceSet.forEach(conf => {
    const option = document.createElement('option');
    option.value = conf.toLowerCase();
    option.textContent = conf;
    conferenceFilter.appendChild(option);
  });
}

// Filter teams
function filterTeams() {
  const league = leagueFilter.value;
  const conference = conferenceFilter.value;
  const search = teamSearch.value.toLowerCase();

  if (this === leagueFilter) populateConferences();

  let filtered = [];
  if (league === 'all') {
    Object.values(teamsData).forEach(group => {
      filtered = filtered.concat(group);
    });
  } else {
    filtered = teamsData[league] || [];
  }

  if (conference !== 'all') {
    filtered = filtered.filter(team =>
      (team.conference || '').toLowerCase() === conference
    );
  }

  if (search) {
    filtered = filtered.filter(team =>
      team.name.toLowerCase().includes(search)
    );
  }

  renderTeams(filtered);
}

// Render team cards
function renderTeams(teams) {
  teamsContainer.innerHTML = '';

  if (!teams || teams.length === 0) {
    teamsContainer.innerHTML = `
      <div class="col-12 text-center">
        <h3>No teams found matching your criteria</h3>
      </div>
    `;
    return;
  }

  teams.forEach(team => {
    const card = document.createElement('div');
    card.className = 'col-md-4 team-card';
    card.innerHTML = `
      <div class="card">
        <img src="${team.logo}" class="card-img-top" alt="${team.name}">
        <div class="card-body">
          <h5 class="card-title">${team.name}</h5>
          <p class="team-conference">${team.conference}</p>
          <div class="team-info">
            <div class="team-stat">
              <div class="stat-label">Wins</div>
              <div class="stat-value">${team.wins}</div>
            </div>
            <div class="team-stat">
              <div class="stat-label">Losses</div>
              <div class="stat-value">${team.losses}</div>
            </div>
            <div class="team-stat">
              <div class="stat-label">PCT</div>
              <div class="stat-value">${team.winPct.toFixed(3)}</div>
            </div>
          </div>
          <button class="btn btn-primary btn-block" onclick="viewTeamDetails(${team.id})">View Details</button>
        </div>
      </div>
    `;
    teamsContainer.appendChild(card);
  });
}

// Show team modal
function viewTeamDetails(teamId) {
  const allTeams = [].concat(...Object.values(teamsData));
  const team = allTeams.find(t => t.id === teamId);
  if (!team) return;

  const html = `
    <img src="${team.logo}" class="img-fluid mb-3" style="max-height: 100px;">
    <h4>${team.name}</h4>
    <p><strong>Conference:</strong> ${team.conference}</p>
    <p><strong>Division:</strong> ${team.division}</p>
    <p><strong>Wins:</strong> ${team.wins}</p>
    <p><strong>Losses:</strong> ${team.losses}</p>
    <p><strong>Win %:</strong> ${team.winPct.toFixed(3)}</p>
  `;
  document.getElementById('teamModalBody').innerHTML = html;
  $('#teamModal').modal('show');
}
