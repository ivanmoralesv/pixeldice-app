export const diceTypes = [4, 6, 8, 10, 12, 20, 100];

export const defaultPool = [
  { id: "d20_base", sides: 20, quantity: 2, color: "#050505", labelMode: "numbers" },
  { id: "d6_accent", sides: 6, quantity: 4, color: "#E8FF00", labelMode: "numbers" },
];

export function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

export function rollPool(pool) {
  const dice = pool.flatMap((die) =>
    Array.from({ length: die.quantity }, (_, index) => ({
      id: `${die.id}_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 6)}`,
      sides: die.sides,
      color: die.color,
      value: rollDie(die.sides),
    })),
  );
  return {
    id: `roll_${Date.now()}`,
    dice,
    total: dice.reduce((sum, die) => sum + die.value, 0),
    createdAt: new Date().toISOString(),
  };
}

export function poolLabel(pool) {
  return pool.filter((die) => die.quantity > 0).map((die) => `${die.quantity}d${die.sides}`).join(" + ");
}

export function updateDieQuantity(pool, sides, delta) {
  const next = pool.map((die) => (die.sides === sides ? { ...die, quantity: Math.max(0, Math.min(24, die.quantity + delta)) } : die));
  return next.filter((die) => die.quantity > 0);
}

export function addDieToPool(pool, sides, color = "#050505") {
  const existing = pool.find((die) => die.sides === sides && die.color === color);
  if (existing) return updateDieQuantity(pool, sides, 1);
  return [...pool, { id: `d${sides}_${Date.now()}`, sides, quantity: 1, color, labelMode: "numbers" }];
}
