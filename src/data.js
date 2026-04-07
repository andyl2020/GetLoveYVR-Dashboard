export const TODAY = "2026-04-07";

export const MILESTONE_PLAYBOOK = {
  alignment: {
    label: "Event Alignment",
    timing: "5 weeks before",
    summary:
      "Agree on the event direction at a high level so the team is aligned on what this event is.",
    outputs: [
      { id: "direction", label: "High-level event concept is agreed" },
      { id: "positioning", label: "Event positioning or talking points are written down" },
    ],
  },
  venueLocked: {
    label: "Venue Locked",
    timing: "4 weeks before",
    summary:
      "The venue is committed, the booking is real, and the operating details are locked.",
    outputs: [
      { id: "booked", label: "Venue is booked" },
      { id: "deposit", label: "Deposit is paid" },
      { id: "schedule", label: "Date and time are locked" },
    ],
  },
  kickoff: {
    label: "Kickoff",
    timing: "3 weeks before",
    summary:
      "Launch marketing so the event is live publicly and promotion has actually started.",
    outputs: [
      { id: "flock", label: "Flock event is posted" },
      { id: "social", label: "Instagram / TikTok promotion has started" },
    ],
  },
  finalCheck: {
    label: "Final Check",
    timing: "6 days before",
    summary:
      "Run the pre-event call or check-in so any last-minute blockers are visible before the event.",
    outputs: [
      { id: "checkin", label: "Call or check-in is completed" },
      { id: "followups", label: "Final action items are confirmed or assigned" },
      { id: "content", label: "1-3 event-specific TikToks or reels are live or scheduled" },
    ],
  },
  eventDay: {
    label: "Event Day",
    timing: "Sunday",
    summary: "The live event happens on Sunday.",
    outputs: [{ id: "live", label: "Event day is completed" }],
  },
};

function createMilestone(type, date, completedOutputIds = []) {
  const template = MILESTONE_PLAYBOOK[type];
  const completedSet =
    completedOutputIds === true
      ? new Set(template.outputs.map((output) => output.id))
      : new Set(completedOutputIds);

  return {
    type,
    date,
    outputs: template.outputs.map((output) => ({
      ...output,
      done: completedSet.has(output.id),
    })),
  };
}

export const EVENTS = [
  {
    id: 1,
    seriesNumber: "1/8",
    theme: "Boxing",
    owner: "Sandy",
    eventDate: "2026-04-26",
    tentative: false,
    milestones: [
      createMilestone("alignment", "2026-03-22", true),
      createMilestone("venueLocked", "2026-03-29", true),
      createMilestone("kickoff", "2026-04-05", true),
      createMilestone("finalCheck", "2026-04-20"),
      createMilestone("eventDay", "2026-04-26"),
    ],
  },
  {
    id: 2,
    seriesNumber: "2/8",
    theme: "Improv",
    owner: "Patrice",
    eventDate: "2026-05-03",
    tentative: false,
    milestones: [
      createMilestone("alignment", "2026-03-29", true),
      createMilestone("venueLocked", "2026-04-05", true),
      createMilestone("kickoff", "2026-04-12"),
      createMilestone("finalCheck", "2026-04-27"),
      createMilestone("eventDay", "2026-05-03"),
    ],
  },
  {
    id: 3,
    seriesNumber: "3/8",
    theme: "Baking",
    owner: "Patrice",
    eventDate: "2026-05-10",
    tentative: false,
    milestones: [
      createMilestone("alignment", "2026-04-05", true),
      createMilestone("venueLocked", "2026-04-12"),
      createMilestone("kickoff", "2026-04-19"),
      createMilestone("finalCheck", "2026-05-04"),
      createMilestone("eventDay", "2026-05-10"),
    ],
  },
  {
    id: 4,
    seriesNumber: "4/8",
    theme: "Painting",
    owner: "Patrice",
    eventDate: "2026-05-24",
    tentative: false,
    milestones: [
      createMilestone("alignment", "2026-04-19"),
      createMilestone("venueLocked", "2026-04-26"),
      createMilestone("kickoff", "2026-05-03"),
      createMilestone("finalCheck", "2026-05-18"),
      createMilestone("eventDay", "2026-05-24"),
    ],
  },
  {
    id: 5,
    seriesNumber: "5/8",
    theme: "Social / Bingo",
    owner: "Sandy",
    eventDate: "2026-05-31",
    tentative: true,
    milestones: [
      createMilestone("alignment", "2026-04-26"),
      createMilestone("venueLocked", "2026-05-03"),
      createMilestone("kickoff", "2026-05-10"),
      createMilestone("finalCheck", "2026-05-25"),
      createMilestone("eventDay", "2026-05-31"),
    ],
  },
  {
    id: 6,
    seriesNumber: "6/8",
    theme: "TBD",
    owner: "TBD",
    eventDate: "2026-06-07",
    tentative: true,
    milestones: [
      createMilestone("alignment", "2026-05-03"),
      createMilestone("venueLocked", "2026-05-10"),
      createMilestone("kickoff", "2026-05-17"),
      createMilestone("finalCheck", "2026-06-01"),
      createMilestone("eventDay", "2026-06-07"),
    ],
  },
  {
    id: 7,
    seriesNumber: "7/8",
    theme: "TBD",
    owner: "TBD",
    eventDate: "2026-06-21",
    tentative: false,
    milestones: [
      createMilestone("alignment", "2026-05-17"),
      createMilestone("venueLocked", "2026-05-24"),
      createMilestone("kickoff", "2026-05-31"),
      createMilestone("finalCheck", "2026-06-15"),
      createMilestone("eventDay", "2026-06-21"),
    ],
  },
  {
    id: 8,
    seriesNumber: "8/8",
    theme: "TBD",
    owner: "TBD",
    eventDate: "2026-06-28",
    tentative: false,
    milestones: [
      createMilestone("alignment", "2026-05-24"),
      createMilestone("venueLocked", "2026-05-31"),
      createMilestone("kickoff", "2026-06-07"),
      createMilestone("finalCheck", "2026-06-22"),
      createMilestone("eventDay", "2026-06-28"),
    ],
  },
];

export const MARKETING = [
  {
    id: 1,
    weekLabel: "Apr 7-12",
    weekStart: "2026-04-07",
    event: "Boxing",
    platform: "Instagram",
    type: "Hype reel",
    status: "todo",
    owner: "Andy",
  },
  {
    id: 2,
    weekLabel: "Apr 7-12",
    weekStart: "2026-04-07",
    event: "Boxing",
    platform: "TikTok",
    type: "Behind the scenes clip",
    status: "todo",
    owner: "Andy",
  },
  {
    id: 3,
    weekLabel: "Apr 7-12",
    weekStart: "2026-04-07",
    event: "Boxing",
    platform: "Flock",
    type: "Event announcement",
    status: "todo",
    owner: "Andy",
  },
  {
    id: 4,
    weekLabel: "Apr 13-19",
    weekStart: "2026-04-13",
    event: "Boxing",
    platform: "Instagram",
    type: "Countdown post",
    status: "todo",
    owner: "Andy",
  },
  {
    id: 5,
    weekLabel: "Apr 13-19",
    weekStart: "2026-04-13",
    event: "Boxing",
    platform: "TikTok",
    type: "Cohost intro",
    status: "todo",
    owner: "Sandy",
  },
  {
    id: 6,
    weekLabel: "Apr 13-19",
    weekStart: "2026-04-13",
    event: "Improv",
    platform: "Instagram",
    type: "Teaser post",
    status: "todo",
    owner: "Andy",
  },
  {
    id: 7,
    weekLabel: "Apr 20-26",
    weekStart: "2026-04-20",
    event: "Boxing",
    platform: "Instagram",
    type: "Final push",
    status: "todo",
    owner: "Andy",
  },
  {
    id: 8,
    weekLabel: "Apr 20-26",
    weekStart: "2026-04-20",
    event: "Boxing",
    platform: "TikTok",
    type: "Day-of story",
    status: "todo",
    owner: "Andy",
  },
  {
    id: 9,
    weekLabel: "Apr 27-May 3",
    weekStart: "2026-04-27",
    event: "Improv",
    platform: "Instagram",
    type: "Kickoff post",
    status: "todo",
    owner: "Patrice",
  },
  {
    id: 10,
    weekLabel: "Apr 27-May 3",
    weekStart: "2026-04-27",
    event: "Improv",
    platform: "TikTok",
    type: "Prep teaser",
    status: "todo",
    owner: "Andy",
  },
];

export const BREAK_MARKERS = [
  {
    id: "break-week",
    date: "2026-05-17",
    title: "Break week",
    details: "No public event scheduled.",
  },
];

export const VACATION_BLOCKS = [
  {
    id: "sandy-gone",
    owner: "Sandy",
    label: "Sandy gone",
    tone: "rose",
    start: "2026-04-01",
    end: "2026-04-12",
    details: "Away through April 12",
  },
  {
    id: "sandy-back",
    owner: "Sandy",
    label: "Sandy back",
    tone: "rose",
    end: "2026-04-13",
    start: "2026-04-13",
    details: "Return day",
  },
  {
    id: "patrice-gone",
    owner: "Patrice",
    label: "Patrice gone",
    tone: "cyan",
    start: "2026-03-26",
    end: "2026-04-07",
    details: "Away through April 7",
  },
  {
    id: "patrice-return",
    owner: "Patrice",
    label: "Patrice back",
    tone: "cyan",
    start: "2026-04-08",
    end: "2026-04-08",
    details: "Return day",
  },
  {
    id: "andy-sf",
    owner: "Andy",
    label: "Andy SF",
    tone: "mint",
    start: "2026-04-04",
    end: "2026-04-14",
    details: "Away in SF through April 14",
  },
  {
    id: "andy-back",
    owner: "Andy",
    label: "Andy back",
    tone: "mint",
    start: "2026-04-15",
    end: "2026-04-15",
    details: "Return day",
  },
];
