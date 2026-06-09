/**
 * Priority Inbox - Stage 6
 * 
 * Fetches notifications from the evaluation service API and ranks them
 * using a priority score based on:
 *   1. Type weight: Placement (3) > Result (2) > Event (1)
 *   2. Recency: more recent notifications score higher
 * 
 * The top N notifications are displayed based on this combined score.
 * 
 * Approach for maintaining top 10 efficiently as new notifications arrive:
 *   - Use a min-heap of size N (here N=10)
 *   - For each incoming notification, compute its priority score
 *   - If heap size < N, insert directly
 *   - If new score > heap's minimum, pop the min and insert the new one
 *   - This gives O(log N) per insertion instead of re-sorting the entire list
 */

require("dotenv").config();
const axios = require("axios");
const Log = require("../logging_middleware");

// ============================================================
// Configuration
// ============================================================
const AUTH_URL = "http://4.224.186.213/evaluation-service/auth";
const NOTIFICATIONS_URL = "http://4.224.186.213/evaluation-service/notifications";
const TOP_N = 10; // how many priority notifications to show

const AUTH_BODY = {
  email: process.env.LOG_EMAIL,
  name: process.env.LOG_NAME,
  rollNo: process.env.LOG_ROLL_NO,
  accessCode: process.env.LOG_ACCESS_CODE,
  clientID: process.env.LOG_CLIENT_ID,
  clientSecret: process.env.LOG_CLIENT_SECRET,
};

// ============================================================
// Type weights — Placement is most important, Event least
// ============================================================
const TYPE_WEIGHT = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

// ============================================================
// Min-Heap implementation for maintaining top N efficiently
// No external libraries used — built from scratch
// ============================================================
class MinHeap {
  constructor(capacity) {
    this.capacity = capacity;
    this.heap = [];
  }

  // Get parent/child indices
  parentIdx(i) { return Math.floor((i - 1) / 2); }
  leftIdx(i) { return 2 * i + 1; }
  rightIdx(i) { return 2 * i + 2; }

  // Compare by score (min at top)
  compare(a, b) { return a.score - b.score; }

  // Bubble up after insertion
  bubbleUp(i) {
    while (i > 0) {
      const parent = this.parentIdx(i);
      if (this.compare(this.heap[i], this.heap[parent]) < 0) {
        [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
        i = parent;
      } else {
        break;
      }
    }
  }

  // Sink down after removal
  sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = this.leftIdx(i);
      const right = this.rightIdx(i);

      if (left < n && this.compare(this.heap[left], this.heap[smallest]) < 0) {
        smallest = left;
      }
      if (right < n && this.compare(this.heap[right], this.heap[smallest]) < 0) {
        smallest = right;
      }
      if (smallest !== i) {
        [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
        i = smallest;
      } else {
        break;
      }
    }
  }

  // Peek at the minimum element
  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  // Insert element — maintains top N by score
  insert(item) {
    if (this.heap.length < this.capacity) {
      this.heap.push(item);
      this.bubbleUp(this.heap.length - 1);
    } else if (item.score > this.heap[0].score) {
      // New item has higher score than current minimum — replace it
      this.heap[0] = item;
      this.sinkDown(0);
    }
    // else: item score too low, discard it
  }

  // Extract all items sorted by score (highest first)
  getSorted() {
    return [...this.heap].sort((a, b) => b.score - a.score);
  }

  size() { return this.heap.length; }
}

// ============================================================
// Priority score calculation
// ============================================================
function calculateScore(notification, nowMs) {
  const typeWeight = TYPE_WEIGHT[notification.Type] || 1;
  const timestamp = new Date(notification.Timestamp).getTime();
  
  // Recency: hours since the notification was created
  // More recent = lower hoursSince = higher recency score
  const hoursSince = (nowMs - timestamp) / (1000 * 60 * 60);
  
  // Recency factor: decays over time
  // A notification from 1 hour ago gets ~1.0, from 24h ago gets ~0.04
  const recencyFactor = 1 / (1 + hoursSince * 0.1);

  // Final score = type weight * recency factor
  // This means a Placement from 2 hours ago scores higher than
  // a Result from 2 hours ago, and higher than a Placement from 48h ago
  const score = typeWeight * recencyFactor;

  return score;
}

// ============================================================
// Fetch auth token
// ============================================================
async function getAuthToken() {
  try {
    const response = await axios.post(AUTH_URL, AUTH_BODY);
    Log("backend", "info", "service", "Auth token obtained for priority inbox");
    return response.data.access_token;
  } catch (err) {
    Log("backend", "error", "service", `Failed to get auth token: ${err.message}`);
    return null;
  }
}

// ============================================================
// Fetch notifications from evaluation service
// ============================================================
async function fetchNotifications(token) {
  try {
    const response = await axios.get(NOTIFICATIONS_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    Log("backend", "info", "service",
      `Fetched ${response.data.notifications.length} notifications from API`);
    return response.data.notifications;
  } catch (err) {
    Log("backend", "error", "service", `Failed to fetch notifications: ${err.message}`);
    return [];
  }
}

// ============================================================
// Main: compute priority inbox
// ============================================================
async function getPriorityInbox(n = TOP_N) {
  Log("backend", "info", "controller", `Computing priority inbox for top ${n} notifications`);

  const token = await getAuthToken();
  if (!token) {
    Log("backend", "fatal", "controller", "Cannot proceed without auth token");
    return [];
  }

  const notifications = await fetchNotifications(token);
  if (notifications.length === 0) {
    Log("backend", "warn", "controller", "No notifications received from API");
    return [];
  }

  const nowMs = Date.now();
  const heap = new MinHeap(n);

  // Process each notification through the heap
  for (const notif of notifications) {
    const score = calculateScore(notif, nowMs);
    heap.insert({
      ...notif,
      score: score,
    });
  }

  const topN = heap.getSorted();

  Log("backend", "info", "controller",
    `Priority inbox computed: ${topN.length} notifications ranked`);

  return topN;
}

// ============================================================
// Run and display results
// ============================================================
async function main() {
  Log("backend", "info", "domain", "Priority Inbox service starting");

  const topNotifications = await getPriorityInbox(TOP_N);

  if (topNotifications.length === 0) {
    Log("backend", "warn", "domain", "No notifications to display");
    return;
  }

  // Display the results
  Log("backend", "info", "domain", `\n${"=".repeat(70)}`);
  Log("backend", "info", "domain", `  PRIORITY INBOX — Top ${TOP_N} Notifications`);
  Log("backend", "info", "domain", `${"=".repeat(70)}`);

  // Also print to stdout for screenshot purposes
  process.stdout.write("\n");
  process.stdout.write("=".repeat(70) + "\n");
  process.stdout.write(`  PRIORITY INBOX - Top ${TOP_N} Notifications\n`);
  process.stdout.write(`  Scoring: Type Weight (Placement=3, Result=2, Event=1) x Recency\n`);
  process.stdout.write("=".repeat(70) + "\n\n");

  topNotifications.forEach((notif, idx) => {
    const rank = idx + 1;
    const line = `  #${rank}  [${notif.Type.padEnd(9)}]  ${notif.Message.padEnd(40)}  Score: ${notif.score.toFixed(4)}  |  ${notif.Timestamp}`;
    process.stdout.write(line + "\n");

    Log("backend", "info", "handler",
      `Rank #${rank}: type=${notif.Type}, msg="${notif.Message}", score=${notif.score.toFixed(4)}, time=${notif.Timestamp}`);
  });

  process.stdout.write("\n" + "=".repeat(70) + "\n");
  process.stdout.write("  Priority weights: Placement(3) > Result(2) > Event(1)\n");
  process.stdout.write("  Recency decay: score = weight * (1 / (1 + hours_ago * 0.1))\n");
  process.stdout.write("  Min-Heap approach: O(log N) per new notification for top-N maintenance\n");
  process.stdout.write("=".repeat(70) + "\n");

  Log("backend", "info", "domain", "Priority Inbox display complete");
}

main();
