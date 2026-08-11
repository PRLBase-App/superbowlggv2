/** Real Super Bowl history — public factual data. */

export interface SuperBowl {
  number: number;
  year: number;
  winner: string;
  winnerAbbr: string;
  loser: string;
  loserAbbr: string;
  score: string;
  mvp: string;
  venue: string;
  city: string;
  attendance: string;
  scheduledDate?: string;
}

export const SUPER_BOWLS: SuperBowl[] = [
  { number: 1, year: 1967, winner: "Green Bay Packers", winnerAbbr: "GB", loser: "Kansas City Chiefs", loserAbbr: "KC", score: "35–10", mvp: "Bart Starr", venue: "Los Angeles Memorial Coliseum", city: "Los Angeles, CA", attendance: "61,946" },
  { number: 2, year: 1968, winner: "Green Bay Packers", winnerAbbr: "GB", loser: "Oakland Raiders", loserAbbr: "OAK", score: "33–14", mvp: "Bart Starr", venue: "Miami Orange Bowl", city: "Miami, FL", attendance: "75,546" },
  { number: 3, year: 1969, winner: "New York Jets", winnerAbbr: "NYJ", loser: "Baltimore Colts", loserAbbr: "BAL", score: "16–7", mvp: "Joe Namath", venue: "Miami Orange Bowl", city: "Miami, FL", attendance: "75,389" },
  { number: 4, year: 1970, winner: "Kansas City Chiefs", winnerAbbr: "KC", loser: "Minnesota Vikings", loserAbbr: "MIN", score: "23–7", mvp: "Len Dawson", venue: "Tulane Stadium", city: "New Orleans, LA", attendance: "80,562" },
  { number: 5, year: 1971, winner: "Baltimore Colts", winnerAbbr: "BAL", loser: "Dallas Cowboys", loserAbbr: "DAL", score: "16–13", mvp: "Chuck Howley", venue: "Miami Orange Bowl", city: "Miami, FL", attendance: "79,204" },
  { number: 6, year: 1972, winner: "Dallas Cowboys", winnerAbbr: "DAL", loser: "Miami Dolphins", loserAbbr: "MIA", score: "24–3", mvp: "Roger Staubach", venue: "Tulane Stadium", city: "New Orleans, LA", attendance: "81,023" },
  { number: 7, year: 1973, winner: "Miami Dolphins", winnerAbbr: "MIA", loser: "Washington Redskins", loserAbbr: "WAS", score: "14–7", mvp: "Jake Scott", venue: "Los Angeles Memorial Coliseum", city: "Los Angeles, CA", attendance: "90,182" },
  { number: 8, year: 1974, winner: "Miami Dolphins", winnerAbbr: "MIA", loser: "Minnesota Vikings", loserAbbr: "MIN", score: "24–7", mvp: "Larry Csonka", venue: "Rice Stadium", city: "Houston, TX", attendance: "71,882" },
  { number: 9, year: 1975, winner: "Pittsburgh Steelers", winnerAbbr: "PIT", loser: "Minnesota Vikings", loserAbbr: "MIN", score: "16–6", mvp: "Franco Harris", venue: "Tulane Stadium", city: "New Orleans, LA", attendance: "80,997" },
  { number: 10, year: 1976, winner: "Pittsburgh Steelers", winnerAbbr: "PIT", loser: "Dallas Cowboys", loserAbbr: "DAL", score: "21–17", mvp: "Lynn Swann", venue: "Miami Orange Bowl", city: "Miami, FL", attendance: "80,187" },
  { number: 11, year: 1977, winner: "Oakland Raiders", winnerAbbr: "OAK", loser: "Minnesota Vikings", loserAbbr: "MIN", score: "32–14", mvp: "Fred Biletnikoff", venue: "Rose Bowl", city: "Pasadena, CA", attendance: "103,438" },
  { number: 12, year: 1978, winner: "Dallas Cowboys", winnerAbbr: "DAL", loser: "Denver Broncos", loserAbbr: "DEN", score: "27–10", mvp: "Randy White / Harvey Martin", venue: "Louisiana Superdome", city: "New Orleans, LA", attendance: "76,400" },
  { number: 13, year: 1979, winner: "Pittsburgh Steelers", winnerAbbr: "PIT", loser: "Dallas Cowboys", loserAbbr: "DAL", score: "35–31", mvp: "Terry Bradshaw", venue: "Orange Bowl", city: "Miami, FL", attendance: "79,484" },
  { number: 14, year: 1980, winner: "Pittsburgh Steelers", winnerAbbr: "PIT", loser: "Los Angeles Rams", loserAbbr: "LAR", score: "31–19", mvp: "Terry Bradshaw", venue: "Rose Bowl", city: "Pasadena, CA", attendance: "103,985" },
  { number: 15, year: 1981, winner: "Oakland Raiders", winnerAbbr: "OAK", loser: "Philadelphia Eagles", loserAbbr: "PHI", score: "27–10", mvp: "Jim Plunkett", venue: "Louisiana Superdome", city: "New Orleans, LA", attendance: "76,135" },
  { number: 16, year: 1982, winner: "San Francisco 49ers", winnerAbbr: "SF", loser: "Cincinnati Bengals", loserAbbr: "CIN", score: "26–21", mvp: "Joe Montana", venue: "Pontiac Silverdome", city: "Pontiac, MI", attendance: "81,270" },
  { number: 17, year: 1983, winner: "Washington Redskins", winnerAbbr: "WAS", loser: "Miami Dolphins", loserAbbr: "MIA", score: "27–17", mvp: "John Riggins", venue: "Rose Bowl", city: "Pasadena, CA", attendance: "103,667" },
  { number: 18, year: 1984, winner: "Los Angeles Raiders", winnerAbbr: "LV", loser: "Washington Redskins", loserAbbr: "WAS", score: "38–9", mvp: "Marcus Allen", venue: "Tampa Stadium", city: "Tampa, FL", attendance: "72,920" },
  { number: 19, year: 1985, winner: "San Francisco 49ers", winnerAbbr: "SF", loser: "Miami Dolphins", loserAbbr: "MIA", score: "38–16", mvp: "Joe Montana", venue: "Stanford Stadium", city: "Stanford, CA", attendance: "84,059" },
  { number: 20, year: 1986, winner: "Chicago Bears", winnerAbbr: "CHI", loser: "New England Patriots", loserAbbr: "NE", score: "46–10", mvp: "Richard Dent", venue: "Louisiana Superdome", city: "New Orleans, LA", attendance: "73,818" },
  { number: 21, year: 1987, winner: "New York Giants", winnerAbbr: "NYG", loser: "Denver Broncos", loserAbbr: "DEN", score: "39–20", mvp: "Phil Simms", venue: "Rose Bowl", city: "Pasadena, CA", attendance: "101,063" },
  { number: 22, year: 1988, winner: "Washington Redskins", winnerAbbr: "WAS", loser: "Denver Broncos", loserAbbr: "DEN", score: "42–10", mvp: "Doug Williams", venue: "Jack Murphy Stadium", city: "San Diego, CA", attendance: "73,302" },
  { number: 23, year: 1989, winner: "San Francisco 49ers", winnerAbbr: "SF", loser: "Cincinnati Bengals", loserAbbr: "CIN", score: "20–16", mvp: "Jerry Rice", venue: "Joe Robbie Stadium", city: "Miami, FL", attendance: "75,129" },
  { number: 24, year: 1990, winner: "San Francisco 49ers", winnerAbbr: "SF", loser: "Denver Broncos", loserAbbr: "DEN", score: "55–10", mvp: "Joe Montana", venue: "Louisiana Superdome", city: "New Orleans, LA", attendance: "72,919" },
  { number: 25, year: 1991, winner: "New York Giants", winnerAbbr: "NYG", loser: "Buffalo Bills", loserAbbr: "BUF", score: "20–19", mvp: "Ottis Anderson", venue: "Tampa Stadium", city: "Tampa, FL", attendance: "73,813" },
  { number: 26, year: 1992, winner: "Washington Redskins", winnerAbbr: "WAS", loser: "Buffalo Bills", loserAbbr: "BUF", score: "37–24", mvp: "Mark Rypien", venue: "Hubert H. Humphrey Metrodome", city: "Minneapolis, MN", attendance: "63,130" },
  { number: 27, year: 1993, winner: "Dallas Cowboys", winnerAbbr: "DAL", loser: "Buffalo Bills", loserAbbr: "BUF", score: "52–17", mvp: "Troy Aikman", venue: "Rose Bowl", city: "Pasadena, CA", attendance: "98,374" },
  { number: 28, year: 1994, winner: "Dallas Cowboys", winnerAbbr: "DAL", loser: "Buffalo Bills", loserAbbr: "BUF", score: "30–13", mvp: "Emmitt Smith", venue: "Georgia Dome", city: "Atlanta, GA", attendance: "72,817" },
  { number: 29, year: 1995, winner: "San Francisco 49ers", winnerAbbr: "SF", loser: "San Diego Chargers", loserAbbr: "SD", score: "49–26", mvp: "Steve Young", venue: "Joe Robbie Stadium", city: "Miami, FL", attendance: "74,107" },
  { number: 30, year: 1996, winner: "Dallas Cowboys", winnerAbbr: "DAL", loser: "Pittsburgh Steelers", loserAbbr: "PIT", score: "27–17", mvp: "Larry Brown", venue: "Sun Devil Stadium", city: "Tempe, AZ", attendance: "76,347" },
  { number: 31, year: 1997, winner: "Green Bay Packers", winnerAbbr: "GB", loser: "New England Patriots", loserAbbr: "NE", score: "35–21", mvp: "Desmond Howard", venue: "Louisiana Superdome", city: "New Orleans, LA", attendance: "72,301" },
  { number: 32, year: 1998, winner: "Denver Broncos", winnerAbbr: "DEN", loser: "Green Bay Packers", loserAbbr: "GB", score: "31–24", mvp: "Terrell Davis", venue: "Qualcomm Stadium", city: "San Diego, CA", attendance: "68,912" },
  { number: 33, year: 1999, winner: "Denver Broncos", winnerAbbr: "DEN", loser: "Atlanta Falcons", loserAbbr: "ATL", score: "34–19", mvp: "John Elway", venue: "Pro Player Stadium", city: "Miami, FL", attendance: "74,803" },
  { number: 34, year: 2000, winner: "St. Louis Rams", winnerAbbr: "LAR", loser: "Tennessee Titans", loserAbbr: "TEN", score: "23–16", mvp: "Kurt Warner", venue: "Georgia Dome", city: "Atlanta, GA", attendance: "72,625" },
  { number: 35, year: 2001, winner: "Baltimore Ravens", winnerAbbr: "BAL", loser: "New York Giants", loserAbbr: "NYG", score: "34–7", mvp: "Ray Lewis", venue: "Raymond James Stadium", city: "Tampa, FL", attendance: "71,921" },
  { number: 36, year: 2002, winner: "New England Patriots", winnerAbbr: "NE", loser: "St. Louis Rams", loserAbbr: "LAR", score: "20–17", mvp: "Tom Brady", venue: "Louisiana Superdome", city: "New Orleans, LA", attendance: "72,922" },
  { number: 37, year: 2003, winner: "Tampa Bay Buccaneers", winnerAbbr: "TB", loser: "Oakland Raiders", loserAbbr: "OAK", score: "48–21", mvp: "Dexter Jackson", venue: "Qualcomm Stadium", city: "San Diego, CA", attendance: "67,603" },
  { number: 38, year: 2004, winner: "New England Patriots", winnerAbbr: "NE", loser: "Carolina Panthers", loserAbbr: "CAR", score: "32–29", mvp: "Tom Brady", venue: "Reliant Stadium", city: "Houston, TX", attendance: "71,525" },
  { number: 39, year: 2005, winner: "New England Patriots", winnerAbbr: "NE", loser: "Philadelphia Eagles", loserAbbr: "PHI", score: "24–21", mvp: "Deion Branch", venue: "Alltel Stadium", city: "Jacksonville, FL", attendance: "78,125" },
  { number: 40, year: 2006, winner: "Pittsburgh Steelers", winnerAbbr: "PIT", loser: "Seattle Seahawks", loserAbbr: "SEA", score: "21–10", mvp: "Hines Ward", venue: "Ford Field", city: "Detroit, MI", attendance: "68,206" },
  { number: 41, year: 2007, winner: "Indianapolis Colts", winnerAbbr: "IND", loser: "Chicago Bears", loserAbbr: "CHI", score: "29–17", mvp: "Peyton Manning", venue: "Dolphin Stadium", city: "Miami Gardens, FL", attendance: "74,512" },
  { number: 42, year: 2008, winner: "New York Giants", winnerAbbr: "NYG", loser: "New England Patriots", loserAbbr: "NE", score: "17–14", mvp: "Eli Manning", venue: "University of Phoenix Stadium", city: "Glendale, AZ", attendance: "71,101" },
  { number: 43, year: 2009, winner: "Pittsburgh Steelers", winnerAbbr: "PIT", loser: "Arizona Cardinals", loserAbbr: "ARI", score: "27–23", mvp: "Santonio Holmes", venue: "Raymond James Stadium", city: "Tampa, FL", attendance: "70,774" },
  { number: 44, year: 2010, winner: "New Orleans Saints", winnerAbbr: "NO", loser: "Indianapolis Colts", loserAbbr: "IND", score: "31–17", mvp: "Drew Brees", venue: "Sun Life Stadium", city: "Miami Gardens, FL", attendance: "74,059" },
  { number: 45, year: 2011, winner: "Green Bay Packers", winnerAbbr: "GB", loser: "Pittsburgh Steelers", loserAbbr: "PIT", score: "31–25", mvp: "Aaron Rodgers", venue: "Cowboys Stadium", city: "Arlington, TX", attendance: "103,219" },
  { number: 46, year: 2012, winner: "New York Giants", winnerAbbr: "NYG", loser: "New England Patriots", loserAbbr: "NE", score: "21–17", mvp: "Eli Manning", venue: "Lucas Oil Stadium", city: "Indianapolis, IN", attendance: "68,658" },
  { number: 47, year: 2013, winner: "Baltimore Ravens", winnerAbbr: "BAL", loser: "San Francisco 49ers", loserAbbr: "SF", score: "34–31", mvp: "Joe Flacco", venue: "Mercedes-Benz Superdome", city: "New Orleans, LA", attendance: "71,024" },
  { number: 48, year: 2014, winner: "Seattle Seahawks", winnerAbbr: "SEA", loser: "Denver Broncos", loserAbbr: "DEN", score: "43–8", mvp: "Malcolm Smith", venue: "MetLife Stadium", city: "East Rutherford, NJ", attendance: "82,529" },
  { number: 49, year: 2015, winner: "New England Patriots", winnerAbbr: "NE", loser: "Seattle Seahawks", loserAbbr: "SEA", score: "28–24", mvp: "Tom Brady", venue: "University of Phoenix Stadium", city: "Glendale, AZ", attendance: "70,288" },
  { number: 50, year: 2016, winner: "Denver Broncos", winnerAbbr: "DEN", loser: "Carolina Panthers", loserAbbr: "CAR", score: "24–10", mvp: "Von Miller", venue: "Levi's Stadium", city: "Santa Clara, CA", attendance: "71,088" },
  { number: 51, year: 2017, winner: "New England Patriots", winnerAbbr: "NE", loser: "Atlanta Falcons", loserAbbr: "ATL", score: "34–28", mvp: "Tom Brady", venue: "NRG Stadium", city: "Houston, TX", attendance: "70,807" },
  { number: 52, year: 2018, winner: "Philadelphia Eagles", winnerAbbr: "PHI", loser: "New England Patriots", loserAbbr: "NE", score: "41–33", mvp: "Nick Foles", venue: "U.S. Bank Stadium", city: "Minneapolis, MN", attendance: "67,612" },
  { number: 53, year: 2019, winner: "New England Patriots", winnerAbbr: "NE", loser: "Los Angeles Rams", loserAbbr: "LAR", score: "13–3", mvp: "Julian Edelman", venue: "Mercedes-Benz Stadium", city: "Atlanta, GA", attendance: "70,081" },
  { number: 54, year: 2020, winner: "Kansas City Chiefs", winnerAbbr: "KC", loser: "San Francisco 49ers", loserAbbr: "SF", score: "31–20", mvp: "Patrick Mahomes", venue: "Hard Rock Stadium", city: "Miami Gardens, FL", attendance: "62,417" },
  { number: 55, year: 2021, winner: "Tampa Bay Buccaneers", winnerAbbr: "TB", loser: "Kansas City Chiefs", loserAbbr: "KC", score: "31–9", mvp: "Tom Brady", venue: "Raymond James Stadium", city: "Tampa, FL", attendance: "24,835" },
  { number: 56, year: 2022, winner: "Los Angeles Rams", winnerAbbr: "LAR", loser: "Cincinnati Bengals", loserAbbr: "CIN", score: "23–20", mvp: "Cooper Kupp", venue: "SoFi Stadium", city: "Inglewood, CA", attendance: "70,048" },
  { number: 57, year: 2023, winner: "Kansas City Chiefs", winnerAbbr: "KC", loser: "Philadelphia Eagles", loserAbbr: "PHI", score: "38–35", mvp: "Patrick Mahomes", venue: "State Farm Stadium", city: "Glendale, AZ", attendance: "67,827" },
  { number: 58, year: 2024, winner: "Kansas City Chiefs", winnerAbbr: "KC", loser: "San Francisco 49ers", loserAbbr: "SF", score: "25–22", mvp: "Patrick Mahomes", venue: "Allegiant Stadium", city: "Paradise, NV", attendance: "61,629" },
  { number: 59, year: 2025, winner: "Philadelphia Eagles", winnerAbbr: "PHI", loser: "Kansas City Chiefs", loserAbbr: "KC", score: "40–22", mvp: "Jalen Hurts", venue: "Caesars Superdome", city: "New Orleans, LA", attendance: "65,719" },
  { number: 60, year: 2026, winner: "Seattle Seahawks", winnerAbbr: "SEA", loser: "New England Patriots", loserAbbr: "NE", score: "29–13", mvp: "Kenneth Walker III", venue: "Levi's Stadium", city: "Santa Clara, CA", attendance: "70,823" },
  { number: 61, year: 2027, winner: "TBD", winnerAbbr: "—", loser: "TBD", loserAbbr: "—", score: "—", mvp: "TBD", venue: "SoFi Stadium", city: "Inglewood, CA", attendance: "—", scheduledDate: "2027-02-14" },
];

export function superBowlChampionships(): { team: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const sb of SUPER_BOWLS) {
    if (sb.winner === "TBD") continue;
    counts.set(sb.winner, (counts.get(sb.winner) ?? 0) + 1);
  }
  return [...counts.entries()].map(([team, count]) => ({ team, count })).sort((a, b) => b.count - a.count);
}
