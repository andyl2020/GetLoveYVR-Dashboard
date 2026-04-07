import { useState } from "react";

const TODAY = new Date("2026-04-07");

const parseDate = (str) => {
  if (!str) return null;
  const d = new Date(str + ", 2026");
  return isNaN(d) ? null : d;
};

const getMilestoneStatus = (dateStr, completed) => {
  if (completed) return "done";
  const d = parseDate(dateStr);
  if (!d) return "pending";
  const diff = (d - TODAY) / (1000 * 60 * 60 * 24);
  if (diff < 0) return "overdue";
  if (diff <= 5) return "urgent";
  return "pending";
};

const EVENTS = [
  {
    id: 1, num: "1/8", theme: "Boxing", date: "April 26", owner: "Sandy",
    milestones: [
      { label: "Alignment", date: "March 22", done: true },
      { label: "Venue Locked", date: "March 29", done: true },
      { label: "Kickoff", date: "April 5", done: true },
      { label: "Final Check", date: "April 20", done: false },
      { label: "Event Day", date: "April 26", done: false },
    ],
    tentative: false,
  },
  {
    id: 2, num: "2/8", theme: "Improv", date: "May 3", owner: "Patrice",
    milestones: [
      { label: "Alignment", date: "March 29", done: true },
      { label: "Venue Locked", date: "April 5", done: true },
      { label: "Kickoff", date: "April 12", done: false },
      { label: "Final Check", date: "April 27", done: false },
      { label: "Event Day", date: "May 3", done: false },
    ],
    tentative: false,
  },
  {
    id: 3, num: "3/8", theme: "Baking", date: "May 10", owner: "Patrice",
    milestones: [
      { label: "Alignment", date: "April 5", done: true },
      { label: "Venue Locked", date: "April 12", done: false },
      { label: "Kickoff", date: "April 19", done: false },
      { label: "Final Check", date: "May 4", done: false },
      { label: "Event Day", date: "May 10", done: false },
    ],
    tentative: false,
  },
  {
    id: 4, num: "4/8", theme: "Painting", date: "May 24", owner: "Patrice",
    milestones: [
      { label: "Alignment", date: "April 19", done: false },
      { label: "Venue Locked", date: "April 26", done: false },
      { label: "Kickoff", date: "May 3", done: false },
      { label: "Final Check", date: "May 18", done: false },
      { label: "Event Day", date: "May 24", done: false },
    ],
    tentative: false,
  },
  {
    id: 5, num: "5/8", theme: "Social/Bingo", date: "May 31", owner: "Sandy",
    milestones: [
      { label: "Alignment", date: "April 26", done: false },
      { label: "Venue Locked", date: "May 3", done: false },
      { label: "Kickoff", date: "May 10", done: false },
      { label: "Final Check", date: "May 25", done: false },
      { label: "Event Day", date: "May 31", done: false },
    ],
    tentative: true,
  },
  {
    id: 6, num: "6/8", theme: "TBD", date: "June 7", owner: "TBD",
    milestones: [
      { label: "Alignment", date: "May 3", done: false },
      { label: "Venue Locked", date: "May 10", done: false },
      { label: "Kickoff", date: "May 17", done: false },
      { label: "Final Check", date: "June 1", done: false },
      { label: "Event Day", date: "June 7", done: false },
    ],
    tentative: true,
  },
  {
    id: 7, num: "7/8", theme: "TBD", date: "June 21", owner: "TBD",
    milestones: [
      { label: "Alignment", date: "May 17", done: false },
      { label: "Venue Locked", date: "May 24", done: false },
      { label: "Kickoff", date: "May 31", done: false },
      { label: "Final Check", date: "June 15", done: false },
      { label: "Event Day", date: "June 21", done: false },
    ],
    tentative: false,
  },
  {
    id: 8, num: "8/8", theme: "TBD", date: "June 28", owner: "TBD",
    milestones: [
      { label: "Alignment", date: "May 24", done: false },
      { label: "Venue Locked", date: "May 31", done: false },
      { label: "Kickoff", date: "June 7", done: false },
      { label: "Final Check", date: "June 22", done: false },
      { label: "Event Day", date: "June 28", done: false },
    ],
    tentative: false,
  },
];

const MARKETING = [
  { id: 1, week: "Apr 7–12", event: "Boxing (Apr 26)", platform: "Instagram", type: "Hype reel", status: "todo", owner: "Andy" },
  { id: 2, week: "Apr 7–12", event: "Boxing (Apr 26)", platform: "TikTok", type: "BTS video", status: "todo", owner: "Andy" },
  { id: 3, week: "Apr 7–12", event: "Boxing (Apr 26)", platform: "Flock", type: "Event announcement", status: "todo", owner: "Andy" },
  { id: 4, week: "Apr 13–19", event: "Boxing (Apr 26)", platform: "Instagram", type: "Countdown post", status: "todo", owner: "Andy" },
  { id: 5, week: "Apr 13–19", event: "Boxing (Apr 26)", platform: "TikTok", type: "Cohost intro", status: "todo", owner: "Sandy" },
  { id: 6, week: "Apr 13–19", event: "Improv (May 3)", platform: "Instagram", type: "Teaser post", status: "todo", owner: "Andy" },
  { id: 7, week: "Apr 20–26", event: "Boxing (Apr 26)", platform: "Instagram", type: "Final push / last tickets", status: "todo", owner: "Andy" },
  { id: 8, week: "Apr 20–26", event: "Boxing (Apr 26)", platform: "TikTok", type: "Day-of story", status: "todo", owner: "Andy" },
  { id: 9, week: "Apr 27–May 3", event: "Improv (May 3)", platform: "Instagram", type: "Kickoff post", status: "todo", owner: "Patrice" },
  { id: 10, week: "Apr 27–May 3", event: "Improv (May 3)", platform: "TikTok", type: "BTS improv prep", status: "todo", owner: "Andy" },
];

const statusColors = {
  done: { bg: "#2d5a27", text: "#a8e6a0", dot: "#6fcf6a" },
  overdue: { bg: "#5a1a1a", text: "#f4a0a0", dot: "#e05555" },
  urgent: { bg: "#5a3a0a", text: "#f4cc80", dot: "#e8a020" },
  pending: { bg: "#2a2a2a", text: "#888", dot: "#444" },
};

const contentStatusColors = {
  posted: { bg: "#2d5a27", text: "#a8e6a0" },
  drafted: { bg: "#1a3a5a", text: "#80c4f4" },
  todo: { bg: "#2a2a2a", text: "#888" },
  behind: { bg: "#5a1a1a", text: "#f4a0a0" },
};

const platformColors = {
  Instagram: "#c13584",
  TikTok: "#69c9d0",
  Flock: "#e8a020",
};

const ownerColors = {
  Sandy: "#c13584",
  Patrice: "#69c9d0",
  Andy: "#3d8f5e",
  TBD: "#555",
};

export default function App() {
  const [tab, setTab] = useState("ops");
  const [events, setEvents] = useState(EVENTS);
  const [marketing, setMarketing] = useState(MARKETING);
  const [expanded, setExpanded] = useState(null);

  const toggleMilestone = (eventId, mIdx) => {
    setEvents(prev => prev.map(e =>
      e.id === eventId
        ? { ...e, milestones: e.milestones.map((m, i) => i === mIdx ? { ...m, done: !m.done } : m) }
        : e
    ));
  };

  const cycleContentStatus = (id) => {
    const cycle = ["todo", "drafted", "posted", "behind"];
    setMarketing(prev => prev.map(m =>
      m.id === id ? { ...m, status: cycle[(cycle.indexOf(m.status) + 1) % cycle.length] } : m
    ));
  };

  const getEventHealth = (ev) => {
    const statuses = ev.milestones.map(m => getMilestoneStatus(m.date, m.done));
    if (statuses.includes("overdue")) return "overdue";
    if (statuses.includes("urgent")) return "urgent";
    if (statuses.every(s => s === "done")) return "done";
    return "pending";
  };

  const groupedMarketing = marketing.reduce((acc, m) => {
    acc[m.week] = acc[m.week] || [];
    acc[m.week].push(m);
    return acc;
  }, {});

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#0e0e0e", minHeight: "100vh", color: "#e8e0d5" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a2e1c 0%, #0e1a10 100%)",
        borderBottom: "1px solid #2a4a2c",
        padding: "20px 28px 0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 42, height: 42, borderRadius: "50%",
            background: "#3d5a3e",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
          }}>💚</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.04em", color: "#c8e6c9" }}>
              GetLoveYVR
            </div>
            <div style={{ fontSize: 11, color: "#6a8f6b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Command Center — Andy Luu, CEO/CMO
            </div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 12, color: "#6a8f6b" }}>
            📅 Apr 7, 2026 &nbsp;·&nbsp; 8 events · 10 weeks
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0 }}>
          {[["ops", "⚙️ Operations"], ["marketing", "📣 Marketing"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: "10px 24px",
              background: tab === key ? "#0e0e0e" : "transparent",
              border: "none",
              borderTop: tab === key ? "2px solid #6fcf6a" : "2px solid transparent",
              color: tab === key ? "#c8e6c9" : "#5a7a5b",
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: tab === key ? 700 : 400,
              cursor: "pointer",
              letterSpacing: "0.05em",
              transition: "all 0.2s",
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "24px 28px", maxWidth: 900, margin: "0 auto" }}>

        {/* ── OPERATIONS TAB ── */}
        {tab === "ops" && (
          <div>
            {/* Legend */}
            <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
              {[["done", "✓ Done"], ["overdue", "⚠ Overdue"], ["urgent", "! Urgent"], ["pending", "· Upcoming"]].map(([s, l]) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: statusColors[s].text }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColors[s].dot }} />
                  {l}
                </div>
              ))}
              <div style={{ marginLeft: "auto", fontSize: 11, color: "#555" }}>Click milestone to toggle · Click card to expand</div>
            </div>

            {/* Event Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {events.map(ev => {
                const health = getEventHealth(ev);
                const isOpen = expanded === ev.id;
                const nextMilestone = ev.milestones.find(m => !m.done);

                return (
                  <div key={ev.id} style={{
                    background: "#161616",
                    border: `1px solid ${health === "overdue" ? "#5a1a1a" : health === "urgent" ? "#5a3a0a" : "#222"}`,
                    borderLeft: `3px solid ${statusColors[health].dot}`,
                    borderRadius: 8,
                    overflow: "hidden",
                    transition: "all 0.2s",
                  }}>
                    {/* Card Header */}
                    <div
                      onClick={() => setExpanded(isOpen ? null : ev.id)}
                      style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.1em", minWidth: 30 }}>
                        {ev.num}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: "#e8e0d5" }}>
                            {ev.theme}
                          </span>
                          {ev.tentative && (
                            <span style={{ fontSize: 10, padding: "1px 6px", background: "#2a2a10", color: "#9a8a30", borderRadius: 3, letterSpacing: "0.08em" }}>
                              TENTATIVE
                            </span>
                          )}
                          {ev.owner === "TBD" && (
                            <span style={{ fontSize: 10, padding: "1px 6px", background: "#2a1a1a", color: "#9a4a4a", borderRadius: 3 }}>
                              NO OWNER
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
                          {ev.date} &nbsp;·&nbsp;
                          <span style={{ color: ownerColors[ev.owner] || "#555" }}>{ev.owner}</span>
                          {nextMilestone && !ev.milestones.every(m => m.done) && (
                            <span style={{ color: "#555" }}> · Next: {nextMilestone.label} ({nextMilestone.date})</span>
                          )}
                        </div>
                      </div>

                      {/* Mini milestone dots */}
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        {ev.milestones.map((m, i) => {
                          const s = getMilestoneStatus(m.date, m.done);
                          return (
                            <div key={i} style={{
                              width: 8, height: 8, borderRadius: "50%",
                              background: statusColors[s].dot,
                            }} />
                          );
                        })}
                      </div>
                      <div style={{ color: "#444", fontSize: 12, marginLeft: 8 }}>{isOpen ? "▲" : "▼"}</div>
                    </div>

                    {/* Expanded milestones */}
                    {isOpen && (
                      <div style={{ padding: "0 18px 16px", borderTop: "1px solid #1e1e1e" }}>
                        <div style={{ paddingTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                          {ev.milestones.map((m, i) => {
                            const s = getMilestoneStatus(m.date, m.done);
                            const c = statusColors[s];
                            return (
                              <div
                                key={i}
                                onClick={() => toggleMilestone(ev.id, i)}
                                style={{
                                  display: "flex", alignItems: "center", gap: 10,
                                  padding: "8px 12px",
                                  background: c.bg,
                                  borderRadius: 6,
                                  cursor: "pointer",
                                  transition: "opacity 0.15s",
                                }}
                              >
                                <div style={{
                                  width: 16, height: 16, borderRadius: "50%",
                                  border: `2px solid ${c.dot}`,
                                  background: m.done ? c.dot : "transparent",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: 9, color: "#000", flexShrink: 0,
                                }}>
                                  {m.done ? "✓" : ""}
                                </div>
                                <span style={{ fontSize: 13, color: c.text, flex: 1 }}>{m.label}</span>
                                <span style={{ fontSize: 11, color: c.dot }}>{m.date}</span>
                                {s === "overdue" && <span style={{ fontSize: 10, color: "#e05555" }}>OVERDUE</span>}
                                {s === "urgent" && <span style={{ fontSize: 10, color: "#e8a020" }}>DUE SOON</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Break callout */}
            <div style={{
              marginTop: 12, padding: "10px 18px",
              background: "#111", border: "1px dashed #2a2a2a",
              borderRadius: 8, color: "#444", fontSize: 12,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span>☕</span> BREAK WEEK — May 17 (no event)
            </div>
          </div>
        )}

        {/* ── MARKETING TAB ── */}
        {tab === "marketing" && (
          <div>
            <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
              {[["posted", "Posted"], ["drafted", "Drafted"], ["todo", "To Do"], ["behind", "Behind"]].map(([s, l]) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: contentStatusColors[s].text }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: contentStatusColors[s].text }} />
                  {l}
                </div>
              ))}
              <div style={{ marginLeft: "auto", fontSize: 11, color: "#555" }}>Click status to cycle</div>
            </div>

            {Object.entries(groupedMarketing).map(([week, items]) => (
              <div key={week} style={{ marginBottom: 24 }}>
                <div style={{
                  fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "#5a7a5b", marginBottom: 10, paddingBottom: 6,
                  borderBottom: "1px solid #1e1e1e",
                }}>
                  📅 Week of {week}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {items.map(item => {
                    const sc = contentStatusColors[item.status];
                    return (
                      <div key={item.id} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 14px",
                        background: "#161616",
                        borderRadius: 6,
                        border: "1px solid #1e1e1e",
                      }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: 2,
                          background: platformColors[item.platform] || "#555",
                          flexShrink: 0,
                        }} />
                        <div style={{
                          fontSize: 10, padding: "2px 7px",
                          background: "#1e1e1e",
                          color: platformColors[item.platform] || "#555",
                          borderRadius: 3, minWidth: 60, textAlign: "center",
                          letterSpacing: "0.06em",
                        }}>
                          {item.platform}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 13, color: "#d0c8c0" }}>{item.type}</span>
                          <span style={{ fontSize: 11, color: "#444", marginLeft: 8 }}>→ {item.event}</span>
                        </div>
                        <div style={{ fontSize: 11, color: ownerColors[item.owner] || "#555" }}>
                          {item.owner}
                        </div>
                        <button
                          onClick={() => cycleContentStatus(item.id)}
                          style={{
                            padding: "3px 10px",
                            background: sc.bg,
                            color: sc.text,
                            border: "none",
                            borderRadius: 4,
                            fontSize: 10,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            minWidth: 56,
                          }}
                        >
                          {item.status}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div style={{
              marginTop: 8, padding: "12px 16px",
              background: "#111", border: "1px dashed #2a2a2a",
              borderRadius: 8, fontSize: 12, color: "#555",
            }}>
              💡 Content for May+ will appear here as kickoff dates approach. Currently showing Weeks 1–4.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
