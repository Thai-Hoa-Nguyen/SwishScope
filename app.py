from flask import Flask, jsonify, render_template
from nba_api.stats.static import players as nba_players_static
from nba_api.stats.endpoints import commonplayerinfo, playercareerstats
from nba_api.stats.static import teams as nba_teams_static
from nba_api.stats.endpoints import leaguestandings
import time
import random

app = Flask(__name__)


@app.route('/api/teams')
def get_nba_teams():
    try:
        nba_teams = nba_teams_static.get_teams()
        standings_df = leaguestandings.LeagueStandings().get_data_frames()[0]

        print("Standings columns:", standings_df.columns.tolist())

        formatted_teams = []

        for team in nba_teams:
            if not team.get("is_nba_team", True):
                continue

            team_id = team["id"]
            team_abbr = team.get("abbreviation", "UNK")
            team_name = team.get("full_name", "Unknown")

            # Get matching row from standings
            record = standings_df[standings_df['TeamID'].astype(str) == str(team_id)]

            if not record.empty:
                row = record.iloc[0]
                try:
                    wins = int(float(row.get("WINS", 0)))
                except:
                    wins = 0
                try:
                    losses = int(float(row.get("LOSSES", 0)))
                except:
                    losses = 0
                try:
                    win_pct = float(row.get("WinPCT", 0.0))
                except:
                    win_pct = 0.0
                conference = row.get("Conference", "Unknown")
                division = row.get("Division", "Unknown")
            else:
                wins = 0
                losses = 0
                win_pct = 0.0
                conference = team.get("conference", "Unknown")
                division = team.get("division", "Unknown")

            formatted_teams.append({
                "id": team_id,
                "name": team_name,
                "abbreviation": team_abbr,
                "city": team.get("city", ""),
                "state": team.get("state", ""),
                "conference": conference,
                "division": division,
                "logo": f"https://cdn.nba.com/logos/nba/{team_id}/global/L/logo.svg",
                "wins": wins,
                "losses": losses,
                "winPct": round(win_pct, 3)
            })

        return jsonify({"nba": formatted_teams})

    except Exception as e:
        print("ERROR in /api/teams:", e)
        return jsonify({"error": "Failed to fetch team data", "details": str(e)}), 500




# Player Setup
ACTIVE_PLAYERS = [
    "Joel Embiid", "Shai Gilgeous-Alexander", "Luka Doncic", "Jayson Tatum",
    "Giannis Antetokounmpo", "Nikola Jokic", "LeBron James", "Anthony Davis",
    "Stephen Curry", "Kawhi Leonard", "Donovan Mitchell", "Tyrese Haliburton"
]

cached_active_players = []
cached_game_logs = {}


def safe_float(val):
    try:
        return float(val) if val is not None else 0.0
    except:
        return 0.0


def safe_int(val):
    try:
        return int(val) if val is not None else 0
    except:
        return 0


def load_active_players():
    print("Loading selected active playoff players...")
    nba_players = nba_players_static.get_players()
    for name in ACTIVE_PLAYERS:
        try:
            player = next(p for p in nba_players if p['full_name'].lower() == name.lower())
            info = commonplayerinfo.CommonPlayerInfo(player_id=player['id'])
            stats = playercareerstats.PlayerCareerStats(player_id=player['id'])

            bio = info.get_data_frames()[0].iloc[0]
            basic = stats.get_data_frames()[0].iloc[-1]

            games_played = safe_int(basic.get('GP', 0)) or 1
            total_minutes = safe_float(basic.get('MIN', 0))
            total_points = safe_float(basic.get('PTS', 0))
            total_rebounds = safe_float(basic.get('REB', 0))
            total_assists = safe_float(basic.get('AST', 0))
            total_steals = safe_float(basic.get('STL', 0))
            total_blocks = safe_float(basic.get('BLK', 0))

            mpg = total_minutes / games_played
            ppg = total_points / games_played
            rpg = total_rebounds / games_played
            apg = total_assists / games_played
            spg = total_steals / games_played
            bpg = total_blocks / games_played

            try:
                age = str(bio.get('AGE', 'N/A'))
                if age in ['N/A', 'None', ''] or not age:
                    birthdate = bio.get('BIRTHDATE')
                    if birthdate:
                        from datetime import datetime
                        birth_date = datetime.strptime(birthdate, '%Y-%m-%dT%H:%M:%S')
                        today = datetime.today()
                        age = str(today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day)))
                    else:
                        age = "25"
            except:
                age = "25"

            cached_active_players.append({
                'id': int(player['id']),
                'name': name,
                'team': str(bio.get('TEAM_ABBREVIATION', 'N/A')),
                'teamFull': str(bio.get('TEAM_NAME', 'N/A')),
                'position': str(bio.get('POSITION', 'N/A')),
                'height': str(bio.get('HEIGHT', 'N/A')),
                'weight': str(bio.get('WEIGHT', 'N/A')),
                'age': age,
                'image': f"https://cdn.nba.com/headshots/nba/latest/260x190/{player['id']}.png",
                'stats': {
                    'gp': games_played,
                    'mpg': mpg,
                    'ppg': ppg,
                    'rpg': rpg,
                    'apg': apg,
                    'spg': spg,
                    'bpg': bpg,
                    'fgp': safe_float(basic.get('FG_PCT')),
                    'tpp': safe_float(basic.get('FG3_PCT')),
                    'ftp': safe_float(basic.get('FT_PCT')),
                    'total_points': total_points,
                    'total_rebounds': total_rebounds,
                    'total_assists': total_assists,
                    'total_steals': total_steals,
                    'total_blocks': total_blocks,
                    'total_minutes': total_minutes
                }
            })
            time.sleep(0.4)
        except Exception as e:
            print(f"Error loading {name}: {e}")
            continue


def generate_game_logs(player_id):
    if player_id in cached_game_logs:
        return cached_game_logs[player_id]

    player = next((p for p in cached_active_players if p['id'] == player_id), None)
    if not player:
        return []

    stats = player['stats']
    games_to_generate = min(stats['gp'], 20)

    game_logs = []
    remaining_points = stats['total_points']
    remaining_rebounds = stats['total_rebounds']
    remaining_assists = stats['total_assists']
    remaining_games = stats['gp']

    for i in range(games_to_generate):
        variation = 0.7 + (random.random() * 0.6) if remaining_games > 1 else 1.0
        points = min(round(stats['ppg'] * variation), remaining_points)
        rebounds = min(round(stats['rpg'] * variation), remaining_rebounds)
        assists = min(round(stats['apg'] * variation), remaining_assists)

        remaining_points -= points
        remaining_rebounds -= rebounds
        remaining_assists -= assists
        remaining_games -= 1

        opponents = ["LAL", "BOS", "GSW", "MIA", "PHI", "MIL", "DEN", "DAL", "PHX", "BKN"]
        opponent = random.choice(opponents)
        win = random.random() > 0.5

        game_logs.append({
            'game_id': f"G{games_to_generate-i}",
            'date': f"2023-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
            'opponent': opponent,
            'result': f"{'W' if win else 'L'} {random.randint(90, 130)}-{random.randint(90, 130)}",
            'minutes': round(stats['mpg'] * variation),
            'points': points,
            'rebounds': rebounds,
            'assists': assists,
            'steals': round(stats['spg'] * variation),
            'blocks': round(stats['bpg'] * variation),
            'fg_pct': round(stats['fgp'] * (0.9 + random.random() * 0.2) * 100, 1),
            'tp_pct': round(stats['tpp'] * (0.9 + random.random() * 0.2) * 100, 1),
            'ft_pct': round(stats['ftp'] * (0.9 + random.random() * 0.2) * 100, 1)
        })

    game_logs.sort(key=lambda x: x['date'], reverse=True)
    cached_game_logs[player_id] = game_logs
    return game_logs


with app.app_context():
    load_active_players()

# --- ROUTES ---

@app.route('/')
def homepage():
    return render_template('homepage.html')


@app.route('/players')
def players_page():
    return render_template('players.html')


@app.route('/teams')
def teams_page():
    return render_template('teams.html')


@app.route('/live')
def live_page():
    return render_template('live.html')


@app.route('/analyze')
def analyze_page():
    return render_template('analyze.html')


@app.route('/api/playoff_players')
def get_selected_playoff_players():
    return jsonify(cached_active_players)


@app.route('/api/player/<int:player_id>')
def get_player_stats(player_id):
    player = next((p for p in cached_active_players if p['id'] == player_id), None)
    if not player:
        return jsonify({'error': 'Player not found'}), 404
    return jsonify(player)


@app.route('/api/player/<int:player_id>/game_logs')
def get_player_game_logs(player_id):
    return jsonify(generate_game_logs(player_id))


@app.route('/api/player/<int:player_id>/last10')
def get_player_last10(player_id):
    game_logs = generate_game_logs(player_id)
    last10 = game_logs[:10] if len(game_logs) >= 10 else game_logs

    if not last10:
        return jsonify({'error': 'No game logs available'}), 404

    num_games = len(last10)
    stats = {
        'gp': num_games,
        'mpg': sum(g['minutes'] for g in last10) / num_games,
        'ppg': sum(g['points'] for g in last10) / num_games,
        'rpg': sum(g['rebounds'] for g in last10) / num_games,
        'apg': sum(g['assists'] for g in last10) / num_games,
        'spg': sum(g['steals'] for g in last10) / num_games,
        'bpg': sum(g['blocks'] for g in last10) / num_games,
        'fgp': sum(g['fg_pct'] for g in last10) / (num_games * 100),
        'tpp': sum(g['tp_pct'] for g in last10) / (num_games * 100),
        'ftp': sum(g['ft_pct'] for g in last10) / (num_games * 100),
        'total_points': sum(g['points'] for g in last10),
        'total_rebounds': sum(g['rebounds'] for g in last10),
        'total_assists': sum(g['assists'] for g in last10),
        'total_steals': sum(g['steals'] for g in last10),
        'total_blocks': sum(g['blocks'] for g in last10),
        'total_minutes': sum(g['minutes'] for g in last10)
    }

    return jsonify({'stats': stats, 'games': last10})


@app.route('/api/player/<int:player_id>/last_game')
def get_player_last_game(player_id):
    game_logs = generate_game_logs(player_id)
    if not game_logs:
        return jsonify({'error': 'No game logs available'}), 404

    last_game = game_logs[0]
    return jsonify({
        'stats': {
            'gp': 1,
            'mpg': last_game['minutes'],
            'ppg': last_game['points'],
            'rpg': last_game['rebounds'],
            'apg': last_game['assists'],
            'spg': last_game['steals'],
            'bpg': last_game['blocks'],
            'fgp': last_game['fg_pct'] / 100,
            'tpp': last_game['tp_pct'] / 100,
            'ftp': last_game['ft_pct'] / 100,
            'total_points': last_game['points'],
            'total_rebounds': last_game['rebounds'],
            'total_assists': last_game['assists'],
            'total_steals': last_game['steals'],
            'total_blocks': last_game['blocks'],
            'total_minutes': last_game['minutes']
        },
        'game': last_game
    })


@app.route('/api/player/<int:player_id>/total_stats')
def get_player_total_stats(player_id):
    player = next((p for p in cached_active_players if p['id'] == player_id), None)
    if not player:
        return jsonify({'error': 'Player not found'}), 404

    stats = player['stats']
    return jsonify({
        'games': stats['gp'],
        'minutes': stats['total_minutes'],
        'points': stats['total_points'],
        'rebounds': stats['total_rebounds'],
        'assists': stats['total_assists'],
        'steals': stats['total_steals'],
        'blocks': stats['total_blocks'],
        'fgp': stats['fgp'] * 100,
        'tpp': stats['tpp'] * 100,
        'ftp': stats['ftp'] * 100
    })


if __name__ == '__main__':
    app.run(debug=True)
