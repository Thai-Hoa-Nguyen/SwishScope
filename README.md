# SwishScope – NBA & NCAA Basketball Insights Platform

![Home Page](img_readme/jordan.png)

**SwishScope** is a full-featured, web-based platform that offers basketball enthusiasts a seamless experience to explore, analyze, and engage with NBA and NCAA teams, players, and matchups. From real-time statistics to advanced comparisons, this application brings fans closer to the game with precision stats and interactive visuals.

---

## Overview

![Overview Preview](img_readme/playerAnalyze.png)

SwishScope blends elite stats and modern analytics into an immersive platform that helps users:

- View detailed player and team statistics  
- Analyze matchups between teams and players  
- Predict outcomes and uncover hidden insights  

Whether you're a fantasy basketball fan, a data analyst, or a curious viewer, **SwishScope** provides a smart way to interact with the game.

---

## Key Features

### Team Stats & Filter

- Displays win/loss records, win percentages, and conference info  
- Filter by league (NBA, NCAA) or conference  
- Search for specific teams using a live search bar  

---

### Player Dashboard

![Player Stats](img_readme/steph.png)

- View sortable, searchable player tables with stats like PPG, RPG, APG, FG%, 3P%, and more  
- Filter by league, team, or position (PG, SG, SF, PF, C)  
- Tabs for Overall, Offense, Defense, Shooting, and Advanced categories  
- Detailed modal view for each player showing bio, trends, game logs, and advanced splits  

---

### Analyze & Predict

![Team Comparison](img_readme/teancompare.png)

- Compare two teams side-by-side using radar charts and stat comparisons  
- Visual win probability predictions based on key performance indicators  
- Player performance charts and strength/weakness breakdowns  

---

## Views

- `homepage.html`: Landing page with animated hero section and search bar  
- `teams.html`: Displays team cards and filters for browsing NBA/NCAA teams  
- `players.html`: Player stats table with filter options and modal details  
- `analyze.html`: Offers side-by-side team comparisons and player trend analysis  

---

## Data & Scripts

- **`app.py`**: Flask backend serving page routes and player API endpoints  
- **`players.js`**: Fetches and renders player stats and detail views  
- **`teams.js`**: Manages filtering and rendering of team cards  
- **`analyze.js`**: Handles team/player comparison logic and chart rendering  
- **`styles.css`**, `players.css`: Style sheets for visual presentation  

---

## Technologies

- **Backend**: Python, Flask, NBA API (`nba_api`)  
- **Frontend**: HTML5, CSS3, Bootstrap 4, JavaScript ES6  
- **Charts**: Chart.js for performance trends and radar comparisons  
- **Design**: Responsive UI with modern aesthetics and Google Fonts  

---

## Summary

**SwishScope** is a comprehensive basketball analytics platform that empowers users to analyze games and players like pros. With dynamic filtering, chart-based insights, and real-time data, it’s designed to be the ultimate tool for fans, scouts, and analysts alike.

---

## How to Run Locally

```bash
# Clone the repository
git clone https://github.com/yourusername/swishscope.git
cd swishscope

# Install dependencies
pip install flask nba_api

# Run the Flask server
python app.py
