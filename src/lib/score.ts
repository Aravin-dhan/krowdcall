type ScoreInput = {
  probability: number;
  outcome: number;
};

export function brierScore({ probability, outcome }: ScoreInput) {
  const normalized = probability / 100;
  const error = (normalized - outcome) ** 2;
  return Math.round((1 - error) * 1000) / 10;
}

export function averageScore(scores: number[]) {
  if (scores.length === 0) {
    return 0;
  }

  return Math.round(
    (scores.reduce((total, score) => total + score, 0) / scores.length) * 10
  ) / 10;
}
