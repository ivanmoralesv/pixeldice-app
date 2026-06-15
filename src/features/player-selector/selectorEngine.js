export function randomInt(max) {
  return Math.floor(Math.random() * max);
}

export function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function buildOrder(players) {
  return shuffle(players).map((player, index) => ({
    ...player,
    order: index + 1,
  }));
}

export function chooseWinner(players) {
  if (!players.length) return null;
  return players[randomInt(players.length)];
}

export function assignTeams(players, teamCount) {
  const shuffled = shuffle(players);
  return shuffled.map((player, index) => ({
    ...player,
    team: (index % teamCount) + 1,
  }));
}

export function buildSelectorResult(mode, players, teamCount) {
  if (mode === "order") return { type: "order", players: buildOrder(players) };
  if (mode === "teams") return { type: "teams", players: assignTeams(players, teamCount) };
  return { type: "starter", winner: chooseWinner(players), players };
}
