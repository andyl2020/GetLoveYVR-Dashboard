import { useEffect, useState } from "react";
import { EVENTS, TODAY, VACATION_BLOCKS } from "./data";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const FILTER_OPTIONS = [
  { id: "sandy", label: "Sandy events", tone: "rose" },
  { id: "patrice", label: "Patrice events", tone: "cyan" },
  { id: "vacations", label: "Vacations", tone: "mint" },
  { id: "issuesOnly", label: "Only issues", tone: "critical" },
];

const OWNER_TONES = {
  Sandy: "rose",
  Patrice: "cyan",
  Andy: "mint",
  TBD: "slate",
};

const STATUS_META = {
  done: { label: "Done", tone: "positive" },
  overdue: { label: "Overdue", tone: "critical" },
  urgent: { label: "Due soon", tone: "warning" },
  pending: { label: "Upcoming", tone: "neutral" },
};

const SEVERITY_META = {
  critical: { label: "Needs action", tone: "critical" },
  warning: { label: "Watch", tone: "warning" },
  healthy: { label: "On track", tone: "info" },
  done: { label: "Done", tone: "positive" },
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

function formatMonthLabel(value) {
  return parseDate(`${value}-01`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(value) {
  return parseDate(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDayLabel(value) {
  return parseDate(value).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatDateRange(startDate, endDate) {
  if (startDate === endDate) {
    return formatShortDate(startDate);
  }

  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (start.getMonth() === end.getMonth()) {
    return `${start.toLocaleDateString("en-US", { month: "short" })} ${start.getDate()}-${end.getDate()}`;
  }
  return `${formatShortDate(startDate)}-${formatShortDate(endDate)}`;
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

function buildVacationLookup(blocks) {
  const lookup = {};

  for (const block of blocks) {
    lookup[block.owner] ??= new Set();
    for (const date of rangeDays(block.start, block.end)) {
      lookup[block.owner].add(date);
    }
  }

  return lookup;
}

function buildMonthOptions(events) {
  return [...new Set([monthKey(TODAY), ...events.map((event) => monthKey(event.eventDate))])].sort();
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

function eventCode(event) {
  return `E${event.id}`;
}

function clipVacationBlockToMonth(block, selectedMonth) {
  const [year, month] = selectedMonth.split("-").map(Number);
  const monthStart = `${selectedMonth}-01`;
  const monthEnd = dateKey(new Date(year, month, 0, 12, 0, 0));
  const start = block.start < monthStart ? monthStart : block.start;
  const end = block.end > monthEnd ? monthEnd : block.end;

  if (start > end) {
    return null;
  }

  return {
    ...block,
    start,
    end,
  };
}

function buildEventModels(events, vacationLookup) {
  return [...events]
    .sort((left, right) => left.eventDate.localeCompare(right.eventDate))
    .map((event) => {
      const issues = [];
      const ownerVacationDays = vacationLookup[event.owner] ?? new Set();
      const overdueMilestones = event.milestones.filter(
        (milestone) => !milestone.done && milestoneStatus(milestone.date, milestone.done) === "overdue",
      );
      const nextMilestone = event.milestones.find((milestone) => !milestone.done) ?? null;
      const vacationConflicts = event.milestones.filter(
        (milestone) => !milestone.done && ownerVacationDays.has(milestone.date),
      );
      const daysUntilEvent = daysBetween(parseDate(event.eventDate), parseDate(TODAY));

      if (overdueMilestones.length > 0) {
        issues.push({
          severity: "critical",
          label: "Overdue milestone",
          message:
            overdueMilestones.length === 1
              ? `${overdueMilestones[0].label} is overdue.`
              : `${overdueMilestones.length} milestones are overdue.`,
        });
      }

      if (event.owner === "TBD") {
        issues.push({
          severity: "critical",
          label: "No owner",
          message: "This event still needs a responsible owner.",
        });
      }

      if (vacationConflicts.length > 0) {
        issues.push({
          severity: "critical",
          label: "Owner conflict",
          message:
            vacationConflicts.length === 1
              ? `${event.owner} is away during ${vacationConflicts[0].label}.`
              : `${event.owner} is away during ${vacationConflicts.length} milestones.`,
        });
      }

      if (nextMilestone && milestoneStatus(nextMilestone.date, nextMilestone.done) === "urgent") {
        issues.push({
          severity: "warning",
          label: "Due soon",
          message: `${nextMilestone.label} is due ${formatShortDate(nextMilestone.date)}.`,
        });
      }

      if (event.tentative && daysUntilEvent <= 35) {
        issues.push({
          severity: "warning",
          label: "Tentative",
          message: `Still tentative with ${Math.max(daysUntilEvent, 0)} days until event day.`,
        });
      }

      const severity = issues.some((issue) => issue.severity === "critical")
        ? "critical"
        : issues.length > 0
          ? "warning"
          : event.milestones.every((milestone) => milestone.done)
            ? "done"
            : "healthy";

      return {
        ...event,
        code: eventCode(event),
        nextMilestone,
        issues,
        severity,
        issueCount: issues.length,
      };
    });
}

function buildAlerts(eventModels) {
  return eventModels
    .flatMap((event) =>
      event.issues.map((issue) => ({
        ...issue,
        eventId: event.id,
        code: event.code,
        theme: event.theme,
        owner: event.owner,
        eventDate: event.eventDate,
      })),
    )
    .sort((left, right) => {
      if (left.severity !== right.severity) {
        return left.severity === "critical" ? -1 : 1;
      }
      return left.eventDate.localeCompare(right.eventDate);
    });
}

function toneForEvent(event) {
  return `tone-${SEVERITY_META[event.severity].tone}`;
}

export default function App() {
  const [selectedMonth, setSelectedMonth] = useState(monthKey(TODAY));
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [filters, setFilters] = useState({
    sandy: true,
    patrice: true,
    vacations: true,
    issuesOnly: false,
  });

  const monthOptions = buildMonthOptions(EVENTS);
  const vacationLookup = buildVacationLookup(VACATION_BLOCKS);
  const eventModels = buildEventModels(EVENTS, vacationLookup);
  const visibleEvents = eventModels.filter((event) => {
    if (!filters.sandy && event.owner === "Sandy") {
      return false;
    }
    if (!filters.patrice && event.owner === "Patrice") {
      return false;
    }
    if (filters.issuesOnly && event.issueCount === 0) {
      return false;
    }
    return true;
  });
  const monthEvents = visibleEvents.filter((event) => monthKey(event.eventDate) === selectedMonth);
  const calendarCells = buildMonthGrid(selectedMonth);
  const alerts = buildAlerts(visibleEvents);
  const criticalCount = alerts.filter((alert) => alert.severity === "critical").length;
  const warningCount = alerts.filter((alert) => alert.severity === "warning").length;
  const availabilityRows = ["Sandy", "Patrice", "Andy"].map((owner) => ({
    owner,
    tone: OWNER_TONES[owner],
    blocks: VACATION_BLOCKS
      .filter((block) => block.owner === owner)
      .map((block) => clipVacationBlockToMonth(block, selectedMonth))
      .filter(Boolean),
  }));
  const selectedEvent =
    visibleEvents.find((event) => event.id === selectedEventId) ??
    monthEvents[0] ??
    visibleEvents[0] ??
    null;

  useEffect(() => {
    const candidates = monthEvents.length > 0 ? monthEvents : visibleEvents;
    if (!selectedEventId || !candidates.some((event) => event.id === selectedEventId)) {
      setSelectedEventId(candidates[0]?.id ?? null);
    }
  }, [monthEvents, selectedEventId, visibleEvents]);

  function focusEvent(eventId, eventDate) {
    setSelectedMonth(monthKey(eventDate));
    setSelectedEventId(eventId);
  }

  function toggleFilter(filterId) {
    setFilters((current) => ({
      ...current,
      [filterId]: !current[filterId],
    }));
  }

  return (
    <div className="app-shell">
      <div className="backdrop-orb backdrop-orb-a" />
      <div className="backdrop-orb backdrop-orb-b" />

      <div className="page-header">
        <div>
          <div className="eyebrow">GetLoveYVR</div>
          <h1>Event calendar</h1>
          <p>
            Events live in the calendar, vacations live in availability, and anything
            wrong shows up in alerts first.
          </p>
        </div>
        <div className="header-meta">
          <span>{formatDayLabel(TODAY)}</span>
          <span>{visibleEvents.length} visible events</span>
          <span>{alerts.length === 0 ? "All clear" : `${alerts.length} alerts`}</span>
        </div>
      </div>

      <section className="alert-strip">
        {alerts.length === 0 ? (
          <div className="alert-card alert-card-ok">
            <div className="alert-card-title">All clear</div>
            <p>No overdue milestones, owner conflicts, or tentative near-term events.</p>
          </div>
        ) : (
          <>
            <div className="alert-summary">
              <div className="alert-summary-title">Anything wrong?</div>
              <div className="alert-summary-stats">
                <span className="pill tone-critical">{criticalCount} critical</span>
                <span className="pill tone-warning">{warningCount} warning</span>
              </div>
            </div>

            {alerts.slice(0, 4).map((alert) => (
              <button
                key={`${alert.eventId}-${alert.label}`}
                type="button"
                className={`alert-card tone-${SEVERITY_META[alert.severity].tone}`}
                onClick={() => focusEvent(alert.eventId, alert.eventDate)}
              >
                <div className="alert-card-topline">
                  <span className="pill subtle-pill">{alert.code}</span>
                  <span className={`pill tone-${SEVERITY_META[alert.severity].tone}`}>
                    {alert.label}
                  </span>
                </div>
                <strong>{alert.theme}</strong>
                <p>{alert.message}</p>
              </button>
            ))}
          </>
        )}
      </section>

      <section className="control-bar">
        <div className="month-switcher">
          {monthOptions.map((month) => (
            <button
              key={month}
              type="button"
              className={month === selectedMonth ? "switch-chip active" : "switch-chip"}
              onClick={() => setSelectedMonth(month)}
            >
              {formatMonthLabel(month)}
            </button>
          ))}
        </div>

        <div className="filter-row">
          {FILTER_OPTIONS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`switch-chip filter-chip filter-chip-${filter.tone} ${filters[filter.id] ? "active" : ""}`}
              onClick={() => toggleFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {filters.vacations && (
        <section className="availability-panel">
          <div className="section-header">
            <div>
              <div className="eyebrow">Availability</div>
              <h2>{formatMonthLabel(selectedMonth)}</h2>
            </div>
          </div>

          <div className="availability-rows">
            {availabilityRows.map((row) => (
              <div key={row.owner} className="availability-row">
                <div className="availability-owner">
                  <span className={`owner-tag owner-${row.tone}`}>{row.owner}</span>
                </div>
                <div className="availability-blocks">
                  {row.blocks.length === 0 ? (
                    <span className="availability-empty">Available all month</span>
                  ) : (
                    row.blocks.map((block) => (
                      <span
                        key={block.id}
                        className={`availability-chip tone-${block.tone}`}
                      >
                        {block.label} · {formatDateRange(block.start, block.end)}
                      </span>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="main-layout">
        <div className="calendar-panel">
          <div className="section-header">
            <div>
              <div className="eyebrow">Calendar</div>
              <h2>{formatMonthLabel(selectedMonth)}</h2>
            </div>
            <div className="panel-note">Events only</div>
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
              const dayEvents = monthEvents.filter((event) => event.eventDate === cell.date);
              const selectedDay = selectedEvent?.eventDate === cell.date;
              const today = cell.date === TODAY;

              return (
                <div
                  key={cell.date}
                  className={[
                    "calendar-day",
                    cell.inMonth ? "" : "calendar-day-muted",
                    selectedDay ? "selected" : "",
                    today ? "today" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="calendar-day-topline">
                    <span className="calendar-day-number">{parseDate(cell.date).getDate()}</span>
                    {today && <span className="calendar-day-badge">Today</span>}
                  </div>

                  <div className="calendar-event-stack">
                    {dayEvents.map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        className={`event-pill ${toneForEvent(event)} ${selectedEvent?.id === event.id ? "active" : ""}`}
                        onClick={() => setSelectedEventId(event.id)}
                      >
                        <div className="event-pill-topline">
                          <span className="event-code">{event.code}</span>
                          {event.issueCount > 0 && (
                            <span className="event-issue-count">{event.issueCount}</span>
                          )}
                        </div>
                        <strong>{event.theme}</strong>
                        <small>{event.owner}</small>
                      </button>
                    ))}
                    {dayEvents.length === 0 && <div className="calendar-empty" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="sidebar">
          <div className="detail-panel">
            <div className="section-header">
              <div>
                <div className="eyebrow">Selected event</div>
                <h2>{selectedEvent ? `${selectedEvent.code} ${selectedEvent.theme}` : "No event visible"}</h2>
              </div>
            </div>

            {selectedEvent ? (
              <>
                <div className="detail-summary">
                  <span className={`pill ${toneForEvent(selectedEvent)}`}>
                    {SEVERITY_META[selectedEvent.severity].label}
                  </span>
                  <span className={`owner-tag owner-${OWNER_TONES[selectedEvent.owner] ?? "slate"}`}>
                    {selectedEvent.owner}
                  </span>
                  <span className="detail-date">{formatDayLabel(selectedEvent.eventDate)}</span>
                </div>

                <div className="detail-section">
                  <h3>What this event is</h3>
                  <p>
                    {selectedEvent.code} is the {selectedEvent.theme} event scheduled for{" "}
                    {formatShortDate(selectedEvent.eventDate)}.
                  </p>
                </div>

                <div className="detail-section">
                  <h3>Issues</h3>
                  {selectedEvent.issues.length === 0 ? (
                    <div className="empty-state">No active issues for this event.</div>
                  ) : (
                    <div className="issue-list">
                      {selectedEvent.issues.map((issue) => (
                        <div key={issue.label} className={`issue-card tone-${SEVERITY_META[issue.severity].tone}`}>
                          <div className="issue-card-topline">
                            <span className={`pill tone-${SEVERITY_META[issue.severity].tone}`}>
                              {issue.label}
                            </span>
                          </div>
                          <p>{issue.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="detail-section">
                  <h3>Milestones</h3>
                  <div className="milestone-list">
                    {selectedEvent.milestones.map((milestone) => {
                      const status = milestoneStatus(milestone.date, milestone.done);
                      const conflict =
                        selectedEvent.owner !== "TBD" &&
                        vacationLookup[selectedEvent.owner]?.has(milestone.date);

                      return (
                        <div key={milestone.label} className="milestone-row">
                          <div className="milestone-main">
                            <strong>{milestone.label}</strong>
                            <span>{formatShortDate(milestone.date)}</span>
                          </div>
                          <div className="milestone-meta">
                            <span className={`pill tone-${STATUS_META[status].tone}`}>
                              {STATUS_META[status].label}
                            </span>
                            {conflict && (
                              <span className="pill tone-critical">Owner away</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">No events match the current filters.</div>
            )}
          </div>

          <div className="directory-panel">
            <div className="section-header">
              <div>
                <div className="eyebrow">Event directory</div>
                <h2>What each event represents</h2>
              </div>
            </div>

            <div className="directory-list">
              {visibleEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  className={event.id === selectedEvent?.id ? "directory-item active" : "directory-item"}
                  onClick={() => focusEvent(event.id, event.eventDate)}
                >
                  <div className="directory-item-topline">
                    <span className="event-code">{event.code}</span>
                    <span className={`pill ${toneForEvent(event)}`}>
                      {event.issueCount > 0 ? `${event.issueCount} issue${event.issueCount === 1 ? "" : "s"}` : "On track"}
                    </span>
                  </div>
                  <strong>{event.theme}</strong>
                  <div className="directory-item-meta">
                    <span>{formatShortDate(event.eventDate)}</span>
                    <span>{event.owner}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
