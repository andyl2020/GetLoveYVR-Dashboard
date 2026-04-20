export const TODAY = "2026-04-07";

export const OWNER_OPTIONS = ["Andy", "Sandy", "Patrice", "Stephy"];

export const MILESTONE_PLAYBOOK = {
  alignment: {
    label: "Event Alignment",
    timing: "5 weeks before",
    summary:
      "Agree on the event direction at a high level and make sure event ownership is clearly assigned.",
    outputs: [
      { id: "direction", label: "High-level event concept is agreed" },
      {
        id: "leadAssigned",
        label: "Event lead is identified and ownership has been discussed and assigned",
      },
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
      "Kick off the event with the public-facing launch assets live and production support in place.",
    outputs: [
      { id: "eventGraphicPosted", label: "(A) Event graphic + event post has been published" },
      { id: "filmVolunteerIdentified", label: "(D1) Film Volunteer identified" },
    ],
  },
  contentProduction: {
    label: "Content Production",
    timing: "2 weeks before",
    summary:
      "Get the main conversion reel and the personality-driven brand reel filmed so the final push is not blocked.",
    outputs: [
      {
        id: "contentBCFilmed",
        label: "Content B & C filmed (Event Announcement Reel + Unhinged Brand Reel)",
      },
    ],
  },
  finalCheck: {
    label: "Final Check",
    timing: "6 days before",
    summary:
      "Confirm the launch content is scheduled or posted and the event lead has run the final agenda rundown.",
    outputs: [
      {
        id: "contentBCScheduledOrPosted",
        label: "Content B & C scheduled / posted (Event Announcement Reel + Unhinged Brand Reel)",
      },
      { id: "filmVolunteerConfirmed", label: "(D1) Film Volunteer confirmed" },
      { id: "agendaRundownDone", label: "Event lead hosts agenda rundown (call conducted)" },
    ],
  },
  eventDay: {
    label: "Event Day",
    timing: "Day of event",
    summary: "Run the live event and make sure the raw material for post-event content is actually collected.",
    outputs: [
      { id: "eventCompleted", label: "Event completed" },
      { id: "rawFootageCollected", label: "(D1) Raw footage collected" },
    ],
  },
  postEvent: {
    label: "Post-Event",
    timing: "1-2 days after",
    summary:
      "Publish the proof and recap content while the event is still fresh and useful for the next ticket push.",
    outputs: [
      { id: "dayOfEventReelPosted", label: "(D1) Day of Event Reel / BTS posted" },
      { id: "dayOfEventRecapPosted", label: "(D2) Day of Event Recap posted" },
    ],
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

function shiftDate(value, offsetDays) {
  const [year, month, day] = value.split("-").map(Number);
  const shifted = new Date(year, month - 1, day + offsetDays, 12, 0, 0);
  const nextYear = shifted.getFullYear();
  const nextMonth = String(shifted.getMonth() + 1).padStart(2, "0");
  const nextDay = String(shifted.getDate()).padStart(2, "0");

  return `${nextYear}-${nextMonth}-${nextDay}`;
}

function buildMilestones(eventDate, completedMilestones = {}) {
  return [
    createMilestone("alignment", shiftDate(eventDate, -35), completedMilestones.alignment ?? []),
    createMilestone("venueLocked", shiftDate(eventDate, -28), completedMilestones.venueLocked ?? []),
    createMilestone("kickoff", shiftDate(eventDate, -21), completedMilestones.kickoff ?? []),
    createMilestone(
      "contentProduction",
      shiftDate(eventDate, -14),
      completedMilestones.contentProduction ?? [],
    ),
    createMilestone("finalCheck", shiftDate(eventDate, -6), completedMilestones.finalCheck ?? []),
    createMilestone("eventDay", eventDate, completedMilestones.eventDay ?? []),
    createMilestone("postEvent", shiftDate(eventDate, 2), completedMilestones.postEvent ?? []),
  ];
}

function createEvent({
  id,
  seriesNumber,
  theme,
  owner,
  eventDate,
  tentative,
  completedMilestones = {},
}) {
  return {
    id,
    seriesNumber,
    theme,
    owner,
    eventDate,
    tentative,
    milestones: buildMilestones(eventDate, completedMilestones),
  };
}

export const CONTENT_TYPE_GUIDE = [
  {
    code: "A",
    title: "Event Graphic + Event Post",
    description:
      "The visual announcement and matching event post that publish the key details like date, vibe, and ticket link.",
  },
  {
    code: "B",
    title: "Event Announcement Reel",
    description:
      "You on camera explaining what the event is and why someone should come. This is the main conversion piece.",
  },
  {
    code: "C",
    title: "Unhinged Brand Reel",
    description:
      "Fun, personality-driven content with no sales agenda. Its job is reach, discovery, and getting new eyes on the brand.",
  },
  {
    code: "D1",
    title: "Day of Event Reel / BTS",
    description:
      "Raw footage from the event itself that proves the event was real and fun, building trust for the next one.",
  },
  {
    code: "D2",
    title: "Day of Event Recap",
    description:
      "You talking to camera after the event about what happened, how it went, and what you learned to build founder trust.",
  },
];

export const EVENTS = [
  createEvent({
    id: 1,
    seriesNumber: "1/8",
    theme: "Boxing",
    owner: "Sandy",
    eventDate: "2026-04-26",
    tentative: false,
    completedMilestones: {
      alignment: true,
      venueLocked: true,
      kickoff: true,
    },
  }),
  createEvent({
    id: 2,
    seriesNumber: "2/8",
    theme: "Improv",
    owner: "Patrice",
    eventDate: "2026-05-03",
    tentative: false,
    completedMilestones: {
      alignment: true,
      venueLocked: true,
    },
  }),
  createEvent({
    id: 3,
    seriesNumber: "3/8",
    theme: "Painting",
    owner: "Patrice",
    eventDate: "2026-05-24",
    tentative: false,
  }),
  createEvent({
    id: 4,
    seriesNumber: "4/8",
    theme: "Sunset Bike Ride",
    owner: "",
    eventDate: "2026-06-07",
    tentative: false,
  }),
  createEvent({
    id: 5,
    seriesNumber: "5/8",
    theme: "Board Games + Karaoke",
    owner: "",
    eventDate: "2026-06-28",
    tentative: false,
  }),
  createEvent({
    id: 6,
    seriesNumber: "6/8",
    theme: "TBD",
    owner: "",
    eventDate: "2026-07-19",
    tentative: true,
  }),
  createEvent({
    id: 7,
    seriesNumber: "7/8",
    theme: "TBD",
    owner: "",
    eventDate: "2026-08-09",
    tentative: true,
  }),
  createEvent({
    id: 8,
    seriesNumber: "8/8",
    theme: "TBD",
    owner: "",
    eventDate: "2026-08-30",
    tentative: true,
  }),
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
