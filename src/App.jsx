import { useEffect, useState } from "react";
import { BREAK_MARKERS, EVENTS, MARKETING, TODAY, VACATION_BLOCKS } from "./data";

const TAB_OPTIONS = [
  { id: "calendar", label: "Calendar" },
  { id: "operations", label: "Operations" },
  { id: "marketing", label: "Marketing" },
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MARKETING_STATUS_ORDER = ["todo", "drafted", "posted", "behind"];
const CALENDAR_FILTERS = [
  { id: "sandy", label: "Sandy events", owner: "Sandy", tone: "rose" },
  { id: "patrice", label: "Patrice events", owner: "Patrice", tone: "cyan" },
  { id: "vacations", label: "Vacations", tone: "mint" },
];

const STATUS_META = {
  done: { label: "Done", tone: "positive" },
  overdue: { label: "Overdue", tone: "critical" },
  urgent: { label: "Due soon", tone: "warning" },
  pending: { label: "Upcoming", tone: "neutral" },
};

const MARKETING_STATUS_META = {
  todo: { label: "To do", tone: "neutral" },
  drafted: { label: "Drafted", tone: "info" },
  posted: { label: "Posted", tone: "positive" },
  behind: { label: "Behind", tone: "critical" },
};

const OWNER_META = {
  Sandy: "rose",
  Patrice: "cyan",
  Andy: "mint",
  TBD: "slate",
};

const PLATFORM_META = {
  Instagram: "rose",
  TikTok: "cyan",
  Flock: "amber",
};

function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthKey(value) {
  return value.slice(0, 7);
}

function formatMonthLabel(value) {
  return parseDate(`${value}-01`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatDayLabel(value) {
  return parseDate(value).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatShortDate(value) {
  return parseDate(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function daysBetween(left, right) {
  const daySize = 1000 * 60 * 60 * 24;
  return Math.round((left - right) / daySize);
}

function rangeDays(startDate, endDate) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const days = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    days.push(dateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

function milestoneStatus(dateString, done) {
  if (done) {
    return "done";
  }

  const diff = daysBetween(parseDate(dateString), parseDate(TODAY));
  if (diff < 0) {
    return "overdue";
  }
  if (diff <= 5) {
    return "urgent";
  }
  return "pending";
}

function eventHealth(event) {
  const statuses = event.milestones.map((milestone) => milestoneStatus(milestone.date, milestone.done));
  if (statuses.includes("overdue")) {
    return "overdue";
  }
  if (statuses.includes("urgent")) {
    return "urgent";
  }
  if (statuses.every((status) => status === "done")) {
    return "done";
  }
  return "pending";
}

function completionRatio(event) {
  const completeCount = event.milestones.filter((milestone) => milestone.done).length;
  return Math.round((completeCount / event.milestones.length) * 100);
}

function nextOpenMilestone(event) {
  return event.milestones.find((milestone) => !milestone.done) ?? null;
}

function buildVacationItems() {
  const items = [];

  for (const block of VACATION_BLOCKS) {
    for (const date of rangeDays(block.start, block.end)) {
      items.push({
        id: `vacation-${block.id}-${date}`,
        date,
        title: block.label,
        detail: block.details,
        owner: block.owner,
        theme: "Vacation",
        status: "pending",
        type: block.label.toLowerCase().includes("back") ? "return" : "vacation",
        tone: block.tone,
        tentative: false,
        done: false,
      });
    }
  }

  return items;
}

function buildScheduleItems(events, vacations) {
  const items = [];

  for (const event of events) {
    for (const milestone of event.milestones) {
      items.push({
        id: `milestone-${event.id}-${milestone.label}`,
        date: milestone.date,
        title: `${event.theme} - ${milestone.label}`,
        detail: event.seriesNumber,
        owner: event.owner,
        theme: event.theme,
        status: milestoneStatus(milestone.date, milestone.done),
        type: milestone.label === "Event Day" ? "event-day" : "milestone",
        tentative: event.tentative,
        done: milestone.done,
      });
    }
  }

  for (const marker of BREAK_MARKERS) {
    items.push({
      id: marker.id,
      date: marker.date,
      title: marker.title,
      detail: marker.details,
      owner: "Ops",
      theme: "Break",
      status: "pending",
      type: "marker",
      tentative: false,
      done: false,
    });
  }

  items.push(...vacations);

  return items.sort((left, right) => {
    if (left.date !== right.date) {
      return left.date.localeCompare(right.date);
    }
    return left.title.localeCompare(right.title);
  });
}

function buildMonthGrid(selectedMonth) {
  const firstDay = parseDate(`${selectedMonth}-01`);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  const cells = [];
  for (let index = 0; index < 42; index += 1) {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    cells.push({
      date: dateKey(current),
      inMonth: current.getMonth() === firstDay.getMonth(),
    });
  }
  return cells;
}

function groupedMarketing(marketingItems) {
  const groups = {};
  for (const item of [...marketingItems].sort((left, right) => left.weekStart.localeCompare(right.weekStart))) {
    groups[item.weekLabel] ??= [];
    groups[item.weekLabel].push(item);
  }
  return Object.entries(groups);
}

function scheduleItemTone(item) {
  if (item.type === "vacation" || item.type === "return") {
    return `tone-${item.tone}`;
  }
  if (item.type === "event-day") {
    return "tone-info";
  }
  if (item.type === "marker") {
    return "tone-neutral";
  }
  return `tone-${STATUS_META[item.status].tone}`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState("calendar");
  const [events, setEvents] = useState(EVENTS);
  const [marketing, setMarketing] = useState(MARKETING);
  const [selectedMonth, setSelectedMonth] = useState(monthKey(TODAY));
  const [selectedDay, setSelectedDay] = useState(TODAY);
  const [selectedMarketingOwner, setSelectedMarketingOwner] = useState("All");
  const [selectedMarketingStatus, setSelectedMarketingStatus] = useState("All");
  const [calendarVisibility, setCalendarVisibility] = useState({
    sandy: true,
    patrice: true,
    vacations: true,
  });

  const owners = ["All", ...new Set(marketing.map((item) => item.owner))];
  const visibleEvents = events.filter((event) => {
    if (event.owner === "Sandy" && !calendarVisibility.sandy) {
      return false;
    }
    if (event.owner === "Patrice" && !calendarVisibility.patrice) {
      return false;
    }
    return true;
  });
  const visibleVacations = calendarVisibility.vacations ? buildVacationItems() : [];

  const scheduleItems = buildScheduleItems(visibleEvents, visibleVacations);
  const months = [...new Set(scheduleItems.map((item) => monthKey(item.date)))];
  const selectedDayItems = scheduleItems.filter((item) => item.date === selectedDay);
  const calendarCells = buildMonthGrid(selectedMonth);
  const urgentItems = scheduleItems.filter((item) => (item.type === "milestone" || item.type === "event-day") && (item.status === "urgent" || item.status === "overdue"));
  const tentativeCount = visibleEvents.filter((event) => event.tentative).length;
  const unownedCount = visibleEvents.filter((event) => event.owner === "TBD").length;
  const completedMilestones = visibleEvents.flatMap((event) => event.milestones).filter((milestone) => milestone.done).length;
  const totalMilestones = visibleEvents.flatMap((event) => event.milestones).length;
  const visibleMarketing = marketing.filter((item) => {
    const ownerMatches = selectedMarketingOwner === "All" ? true : item.owner === selectedMarketingOwner;
    const statusMatches = selectedMarketingStatus === "All" ? true : item.status === selectedMarketingStatus;
    return ownerMatches && statusMatches;
  });

  useEffect(() => {
    if (!months.includes(selectedMonth) && months[0]) {
      setSelectedMonth(months[0]);
    }
  }, [months, selectedMonth]);

  function toggleMilestone(eventId, milestoneLabel) {
    setEvents((currentEvents) =>
      currentEvents.map((event) => {
        if (event.id !== eventId) {
          return event;
        }
        return {
          ...event,
          milestones: event.milestones.map((milestone) =>
            milestone.label === milestoneLabel
              ? { ...milestone, done: !milestone.done }
              : milestone,
          ),
        };
      }),
    );
  }

  function cycleMarketingStatus(marketingId) {
    setMarketing((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== marketingId) {
          return item;
        }
        const currentIndex = MARKETING_STATUS_ORDER.indexOf(item.status);
        const nextIndex = (currentIndex + 1) % MARKETING_STATUS_ORDER.length;
        return {
          ...item,
          status: MARKETING_STATUS_ORDER[nextIndex],
        };
      }),
    );
  }

  function toggleCalendarVisibility(filterId) {
    setCalendarVisibility((current) => ({
      ...current,
      [filterId]: !current[filterId],
    }));
  }

  return (
    <div className="app-shell">
      <div className="background-orb background-orb-a" />
      <div className="background-orb background-orb-b" />

      <header className="hero">
        <div className="hero-copy">
          <div className="eyebrow">GetLoveYVR dashboard</div>
          <h1>Calendar-first planning for events, owners, and launch pressure.</h1>
          <p>
            Rebuilt from the original dashboard into a cleaner command surface with
            an actual calendar, sharper hierarchy, and smoother controls.
          </p>
          <div className="hero-meta">
            <span>{formatDayLabel(TODAY)}</span>
            <span>8 event arcs</span>
            <span>10 marketing tasks</span>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-panel-label">Snapshot</div>
          <div className="hero-stats">
            <article className="stat-card">
              <span className="stat-value">{visibleEvents.length}</span>
              <span className="stat-label">tracked events</span>
            </article>
            <article className="stat-card">
              <span className="stat-value">{urgentItems.length}</span>
              <span className="stat-label">urgent or overdue</span>
            </article>
            <article className="stat-card">
              <span className="stat-value">{tentativeCount}</span>
              <span className="stat-label">tentative slots</span>
            </article>
            <article className="stat-card">
              <span className="stat-value">{visibleVacations.length}</span>
              <span className="stat-label">vacation days shown</span>
            </article>
            <article className="stat-card">
              <span className="stat-value">
                {completedMilestones}/{totalMilestones}
              </span>
              <span className="stat-label">milestones done</span>
            </article>
          </div>
        </div>
      </header>

      <main className="workspace">
        <section className="toolbar">
          <div className="segmented-control">
            {TAB_OPTIONS.map((tabOption) => (
              <button
                key={tabOption.id}
                type="button"
                className={tabOption.id === activeTab ? "segment active" : "segment"}
                onClick={() => setActiveTab(tabOption.id)}
              >
                {tabOption.label}
              </button>
            ))}
          </div>

          <div className="filter-cluster">
            {activeTab !== "marketing" && (
              <div className="filter-group">
                <span className="filter-label">Calendar filters</span>
                <div className="chip-row">
                  {CALENDAR_FILTERS.map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      className={`chip calendar-chip ${calendarVisibility[filter.id] ? "active" : ""} calendar-chip-${filter.tone}`}
                      onClick={() => toggleCalendarVisibility(filter.id)}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "marketing" && (
              <>
                <div className="filter-group">
                  <span className="filter-label">Owner</span>
                  <div className="chip-row">
                    {owners.map((owner) => (
                      <button
                        key={owner}
                        type="button"
                        className={owner === selectedMarketingOwner ? "chip active" : "chip"}
                        onClick={() => setSelectedMarketingOwner(owner)}
                      >
                        {owner}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="filter-group">
                  <span className="filter-label">Status</span>
                  <div className="chip-row">
                    {["All", ...MARKETING_STATUS_ORDER].map((statusId) => (
                      <button
                        key={statusId}
                        type="button"
                        className={statusId === selectedMarketingStatus ? "chip active" : "chip"}
                        onClick={() => setSelectedMarketingStatus(statusId)}
                      >
                        {statusId === "All" ? "All" : MARKETING_STATUS_META[statusId].label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {activeTab === "calendar" && (
          <section className="page-grid">
            <div className="panel calendar-panel">
              <div className="panel-header">
                <div>
                  <div className="panel-kicker">Calendar view</div>
                  <h2>{formatMonthLabel(selectedMonth)}</h2>
                </div>
                <div className="chip-row">
                  {months.map((month) => (
                    <button
                      key={month}
                      type="button"
                      className={month === selectedMonth ? "chip active" : "chip"}
                      onClick={() => setSelectedMonth(month)}
                    >
                      {formatMonthLabel(month)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="calendar-headings">
                {DAY_NAMES.map((dayName) => (
                  <div key={dayName} className="calendar-heading">
                    {dayName}
                  </div>
                ))}
              </div>

              <div className="calendar-grid">
                {calendarCells.map((cell) => {
                  const dayItems = scheduleItems.filter((item) => item.date === cell.date);
                  const dayState =
                    cell.date === TODAY ? "today" : cell.date === selectedDay ? "selected" : "";

                  return (
                    <button
                      key={cell.date}
                      type="button"
                      className={[
                        "calendar-day",
                        cell.inMonth ? "" : "calendar-day-muted",
                        dayState,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => setSelectedDay(cell.date)}
                    >
                      <span className="calendar-day-number">{parseDate(cell.date).getDate()}</span>
                      <div className="calendar-day-stack">
                        {dayItems.slice(0, 3).map((item) => (
                          <span
                            key={item.id}
                            className={`mini-chip ${scheduleItemTone(item)}`}
                          >
                            {item.type === "event-day" ? item.theme : item.title}
                          </span>
                        ))}
                        {dayItems.length > 3 && (
                          <span className="mini-chip tone-neutral">+{dayItems.length - 3} more</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <aside className="panel day-panel">
              <div className="panel-header">
                <div>
                  <div className="panel-kicker">Selected day</div>
                  <h2>{formatDayLabel(selectedDay)}</h2>
                </div>
              </div>

              <div className="day-summary">
                <div className="summary-pill">
                  <span className="summary-pill-value">{selectedDayItems.length}</span>
                  <span className="summary-pill-label">items</span>
                </div>
                <div className="summary-pill">
                  <span className="summary-pill-value">{unownedCount}</span>
                  <span className="summary-pill-label">events need owner</span>
                </div>
              </div>

              <div className="agenda-list">
                {selectedDayItems.length === 0 && (
                  <div className="empty-state">
                    No milestones or events on this date. Try a highlighted day in the month grid.
                  </div>
                )}

                {selectedDayItems.map((item) => (
                  <article key={item.id} className="agenda-card">
                    <div className="agenda-topline">
                      <span className={`badge ${scheduleItemTone(item)}`}>
                        {item.type === "marker"
                          ? "Ops note"
                          : item.type === "vacation"
                            ? "Vacation"
                            : item.type === "return"
                              ? "Return"
                          : item.type === "event-day"
                            ? "Event day"
                            : STATUS_META[item.status].label}
                      </span>
                      {item.owner !== "Ops" && (
                        <span className={`owner-tag owner-${OWNER_META[item.owner] ?? "slate"}`}>
                          {item.owner}
                        </span>
                      )}
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                    {item.tentative && <div className="micro-note">Tentative event slot</div>}
                  </article>
                ))}
              </div>
            </aside>
          </section>
        )}

        {activeTab === "operations" && (
          <section className="page-grid">
            <div className="panel">
              <div className="panel-header">
                <div>
                  <div className="panel-kicker">Operations board</div>
                  <h2>Event readiness at a glance</h2>
                </div>
              </div>

              <div className="event-grid">
                {visibleEvents.map((event, index) => {
                  const health = eventHealth(event);
                  const nextMilestone = nextOpenMilestone(event);
                  return (
                    <article
                      key={event.id}
                      className="event-card"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <div className="event-card-topline">
                        <span className="series-chip">{event.seriesNumber}</span>
                        <span className={`badge tone-${STATUS_META[health].tone}`}>{STATUS_META[health].label}</span>
                      </div>

                      <div className="event-heading">
                        <div>
                          <h3>{event.theme}</h3>
                          <p>
                            {formatShortDate(event.eventDate)} · {event.owner}
                          </p>
                        </div>
                        {event.tentative && <span className="ghost-chip">Tentative</span>}
                      </div>

                      <div className="progress-shell">
                        <div className="progress-meta">
                          <span>Completion</span>
                          <strong>{completionRatio(event)}%</strong>
                        </div>
                        <div className="progress-bar">
                          <span style={{ width: `${completionRatio(event)}%` }} />
                        </div>
                      </div>

                      <div className="milestone-stack">
                        {event.milestones.map((milestone) => {
                          const status = milestoneStatus(milestone.date, milestone.done);
                          return (
                            <button
                              key={milestone.label}
                              type="button"
                              className="milestone-row"
                              onClick={() => toggleMilestone(event.id, milestone.label)}
                            >
                              <span className={`checkmark ${milestone.done ? "checked" : ""}`} />
                              <span className="milestone-copy">
                                <span>{milestone.label}</span>
                                <small>{formatShortDate(milestone.date)}</small>
                              </span>
                              <span className={`badge tone-${STATUS_META[status].tone}`}>
                                {STATUS_META[status].label}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="event-footer">
                        <span>Next up</span>
                        <strong>{nextMilestone ? `${nextMilestone.label} on ${formatShortDate(nextMilestone.date)}` : "All clear"}</strong>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <aside className="panel side-rail">
              <div className="panel-header">
                <div>
                  <div className="panel-kicker">Pressure points</div>
                  <h2>What needs attention next</h2>
                </div>
              </div>

              <div className="hot-list">
                {urgentItems.slice(0, 7).map((item) => (
                  <article key={item.id} className="hot-item">
                    <div className="hot-item-top">
                      <span className={`badge tone-${STATUS_META[item.status].tone}`}>{STATUS_META[item.status].label}</span>
                      <span className={`owner-tag owner-${OWNER_META[item.owner] ?? "slate"}`}>{item.owner}</span>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{formatDayLabel(item.date)}</p>
                  </article>
                ))}
                {urgentItems.length === 0 && (
                  <div className="empty-state">No urgent or overdue milestones in the current owner filter.</div>
                )}
              </div>
            </aside>
          </section>
        )}

        {activeTab === "marketing" && (
          <section className="page-grid marketing-layout">
            <div className="panel">
              <div className="panel-header">
                <div>
                  <div className="panel-kicker">Marketing system</div>
                  <h2>Weekly content pipeline</h2>
                </div>
              </div>

              <div className="marketing-summary">
                {Object.entries(MARKETING_STATUS_META).map(([statusId, meta]) => (
                  <article key={statusId} className="summary-card">
                    <span className={`badge tone-${meta.tone}`}>{meta.label}</span>
                    <strong>{marketing.filter((item) => item.status === statusId).length}</strong>
                    <p>{statusId} items</p>
                  </article>
                ))}
              </div>

              <div className="marketing-groups">
                {groupedMarketing(visibleMarketing).map(([weekLabel, items]) => (
                  <section key={weekLabel} className="week-block">
                    <div className="week-header">
                      <div>
                        <div className="panel-kicker">Week</div>
                        <h3>{weekLabel}</h3>
                      </div>
                      <span className="ghost-chip">{items.length} items</span>
                    </div>

                    <div className="marketing-stack">
                      {items.map((item) => (
                        <article key={item.id} className="marketing-card">
                          <div className="marketing-meta">
                            <span className={`owner-tag owner-${PLATFORM_META[item.platform]}`}>{item.platform}</span>
                            <span className={`owner-tag owner-${OWNER_META[item.owner] ?? "slate"}`}>{item.owner}</span>
                          </div>
                          <div className="marketing-copy">
                            <h4>{item.type}</h4>
                            <p>{item.event}</p>
                          </div>
                          <button
                            type="button"
                            className={`status-toggle tone-${MARKETING_STATUS_META[item.status].tone}`}
                            onClick={() => cycleMarketingStatus(item.id)}
                          >
                            {MARKETING_STATUS_META[item.status].label}
                          </button>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
                {visibleMarketing.length === 0 && (
                  <div className="empty-state">No marketing tasks match the current filters.</div>
                )}
              </div>
            </div>

            <aside className="panel side-rail">
              <div className="panel-header">
                <div>
                  <div className="panel-kicker">Notes</div>
                  <h2>How to use this board</h2>
                </div>
              </div>
              <div className="notes-stack">
                <article className="note-card">
                  <h3>Calendar-led execution</h3>
                  <p>
                    Use the Calendar tab to review event pressure before posting. The
                    marketing plan stays closer to launch windows when operations dates move.
                  </p>
                </article>
                <article className="note-card">
                  <h3>Status control</h3>
                  <p>
                    Click any marketing status chip to cycle it from To do to Drafted,
                    Posted, and Behind.
                  </p>
                </article>
                <article className="note-card">
                  <h3>Vacation overlay</h3>
                  <p>
                    Sandy, Patrice, and Andy travel dates are logged directly in the
                    calendar, and the Sandy, Patrice, and Vacations chips can be toggled
                    on or off without losing the rest of the board.
                  </p>
                </article>
              </div>
            </aside>
          </section>
        )}
      </main>
    </div>
  );
}
