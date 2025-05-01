document.addEventListener('DOMContentLoaded', function() {
  // Team comparison logic
  const team1Select = document.getElementById('team1Select');
  const team2Select = document.getElementById('team2Select');
  const teamComparisonResults = document.getElementById('teamComparisonResults');
  const noTeamsSelected = document.getElementById('noTeamsSelected');
  
  // Player analysis logic
  const playerSelect = document.getElementById('playerSelect');
  const playerAnalysisResults = document.getElementById('playerAnalysisResults');
  const noPlayerSelected = document.getElementById('noPlayerSelected');
  
  // Show/hide team comparison results based on selections
  function updateTeamComparison() {
    if (team1Select.value && team2Select.value) {
      teamComparisonResults.classList.remove('d-none');
      noTeamsSelected.classList.add('d-none');
      renderTeamRadarChart();
    } else {
      teamComparisonResults.classList.add('d-none');
      noTeamsSelected.classList.remove('d-none');
    }
  }
  
  // Show/hide player analysis results based on selection
  function updatePlayerAnalysis() {
    if (playerSelect.value) {
      playerAnalysisResults.classList.remove('d-none');
      noPlayerSelected.classList.add('d-none');
      renderPlayerPerformanceChart();
    } else {
      playerAnalysisResults.classList.add('d-none');
      noPlayerSelected.classList.remove('d-none');
    }
  }
  
  // Render team comparison radar chart
  function renderTeamRadarChart() {
    const ctx = document.getElementById('teamRadarChart').getContext('2d');
    
    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Points', 'Field Goal %', '3-Point %', 'Rebounds', 'Assists', 'Steals', 'Blocks'],
        datasets: [
          {
            label: 'Los Angeles Lakers',
            data: [116.3, 46.5, 38.2, 44.8, 25.4, 7.8, 5.2],
            backgroundColor: 'rgba(85, 37, 130, 0.2)',
            borderColor: 'rgba(85, 37, 130, 1)',
            pointBackgroundColor: 'rgba(85, 37, 130, 1)'
          },
          {
            label: 'Boston Celtics',
            data: [110.5, 47.7, 35.5, 42.7, 29.2, 8.1, 4.8],
            backgroundColor: 'rgba(0, 122, 51, 0.2)',
            borderColor: 'rgba(0, 122, 51, 1)',
            pointBackgroundColor: 'rgba(0, 122, 51, 1)'
          }
        ]
      },
      options: {
        scale: {
          ticks: {
            beginAtZero: true,
            max: 120
          }
        }
      }
    });
  }
  
  // Render player performance chart
  function renderPlayerPerformanceChart() {
    const ctx = document.getElementById('playerPerformanceChart').getContext('2d');
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
        datasets: [
          {
            label: 'Points Per Game',
            data: [25.4, 28.7, 30.1, 29.8, 27.5, 32.3],
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            fill: true
          },
          {
            label: 'Assists Per Game',
            data: [6.1, 5.8, 7.2, 8.5, 6.4, 7.9],
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            fill: true
          },
          {
            label: 'Rebounds Per Game',
            data: [7.5, 8.2, 9.0, 8.7, 8.1, 8.5],
            borderColor: 'rgba(255, 206, 86, 1)',
            backgroundColor: 'rgba(255, 206, 86, 0.1)',
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        title: {
          display: true,
          text: 'Season Performance Trends'
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: false
            }
          }]
        }
      }
    });
  }
  
  // Event listeners
  if (team1Select && team2Select) {
    team1Select.addEventListener('change', updateTeamComparison);
    team2Select.addEventListener('change', updateTeamComparison);
  }
  
  if (playerSelect) {
    playerSelect.addEventListener('change', updatePlayerAnalysis);
  }
}); 