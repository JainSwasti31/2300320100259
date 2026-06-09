/**
 * Priority scoring algorithm
 * Weights: Placement=3, Result=2, Event=1
 * Recency: decays with time using 1/(1 + hours*0.1)
 */

const TYPE_WEIGHT = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export function calculateScore(notification) {
  const weight = TYPE_WEIGHT[notification.Type] || 1;
  const timestamp = new Date(notification.Timestamp).getTime();
  const hoursSince = (Date.now() - timestamp) / (1000 * 60 * 60);
  const recency = 1 / (1 + hoursSince * 0.1);
  return weight * recency;
}

export function getTopN(notifications, n = 10) {
  // Score all notifications
  const scored = notifications.map((notif) => ({
    ...notif,
    score: calculateScore(notif),
  }));

  // Sort by score descending and take top N
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, n);
}
