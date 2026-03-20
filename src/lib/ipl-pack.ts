import type { ElectionPackQuestion } from "@/lib/election-pack";

const iplSource = "Official IPL scorecards and standings (iplt20.com / BCCI)";

// IPL 2026 likely runs late March – late May 2026
// Finals expected ~25 May 2026

export const iplPack2026: ElectionPackQuestion[] = [

  // ── Title contenders ───────────────────────────────────────────────────────

  {
    title: "Will RCB win their first ever IPL title in 2026?",
    description:
      "Resolves YES if Royal Challengers Bengaluru lifts the IPL trophy in 2026. After nearly two decades without a title this is the market Indian fans debate most. Resolves NO if any other team wins.",
    category: "Cricket",
    closeAt: "2026-05-24T14:00:00.000Z",
    resolveBy: "2026-06-01T12:00:00.000Z",
    resolutionSource: iplSource,
    status: "active"
  },
  {
    title: "Will Mumbai Indians win IPL 2026?",
    description:
      "Resolves YES if Mumbai Indians win the 2026 IPL final. MI hold the record for most IPL titles. Resolves NO otherwise.",
    category: "Cricket",
    closeAt: "2026-05-24T14:00:00.000Z",
    resolveBy: "2026-06-01T12:00:00.000Z",
    resolutionSource: iplSource,
    status: "active"
  },
  {
    title: "Will Chennai Super Kings make the IPL 2026 playoffs?",
    description:
      "Resolves YES if CSK finish in the top 4 of the IPL 2026 league stage and qualify for the playoffs. Resolves NO if they finish 5th or lower.",
    category: "Cricket",
    closeAt: "2026-05-10T14:00:00.000Z",
    resolveBy: "2026-05-15T12:00:00.000Z",
    resolutionSource: iplSource,
    status: "active"
  },
  {
    title: "Will Kolkata Knight Riders make the IPL 2026 playoffs?",
    description:
      "Resolves YES if KKR qualify for the top-4 playoffs in IPL 2026. Resolves NO otherwise.",
    category: "Cricket",
    closeAt: "2026-05-10T14:00:00.000Z",
    resolveBy: "2026-05-15T12:00:00.000Z",
    resolutionSource: iplSource,
    status: "active"
  },

  // ── Star player markets ────────────────────────────────────────────────────

  {
    title: "Will Virat Kohli score 600+ runs in IPL 2026?",
    description:
      "Resolves YES if Virat Kohli scores 600 or more runs in total across all his IPL 2026 innings (league stage + playoffs). Resolves NO otherwise, including if he does not participate.",
    category: "Cricket",
    closeAt: "2026-05-24T14:00:00.000Z",
    resolveBy: "2026-06-01T12:00:00.000Z",
    resolutionSource: iplSource,
    status: "active"
  },
  {
    title: "Will Jasprit Bumrah play 10 or more matches in IPL 2026?",
    description:
      "Resolves YES if Jasprit Bumrah plays in 10 or more IPL 2026 matches for Mumbai Indians. Tracks fitness and availability given his workload management. Resolves NO otherwise.",
    category: "Cricket",
    closeAt: "2026-05-10T14:00:00.000Z",
    resolveBy: "2026-05-15T12:00:00.000Z",
    resolutionSource: iplSource,
    status: "active"
  },
  {
    title: "Will MS Dhoni play in IPL 2026?",
    description:
      "Resolves YES if MS Dhoni plays at least one IPL 2026 match for Chennai Super Kings in any capacity (batsman, wicketkeeper). Resolves NO if he does not take the field in 2026.",
    category: "Cricket",
    closeAt: "2026-04-10T14:00:00.000Z",
    resolveBy: "2026-04-15T12:00:00.000Z",
    resolutionSource: iplSource,
    status: "active"
  },
  {
    title: "Will Rohit Sharma win the Orange Cap in IPL 2026?",
    description:
      "Resolves YES if Rohit Sharma finishes as the highest run-scorer in IPL 2026 (league stage + playoffs combined). Resolves NO otherwise.",
    category: "Cricket",
    closeAt: "2026-05-24T14:00:00.000Z",
    resolveBy: "2026-06-01T12:00:00.000Z",
    resolutionSource: iplSource,
    status: "active"
  },

  // ── Statistical firsts ─────────────────────────────────────────────────────

  {
    title: "Will any bowler take a hat-trick in IPL 2026?",
    description:
      "Resolves YES if any bowler takes three wickets on three consecutive deliveries (hat-trick) in any IPL 2026 match, including playoffs. Resolves NO if no hat-trick is taken all season.",
    category: "Cricket",
    closeAt: "2026-05-24T14:00:00.000Z",
    resolveBy: "2026-06-01T12:00:00.000Z",
    resolutionSource: iplSource,
    status: "active"
  },
  {
    title: "Will there be a tied or Super Over match in IPL 2026?",
    description:
      "Resolves YES if any IPL 2026 match ends in a tie and goes to a Super Over. Includes league stage and playoffs. Resolves NO if every match has a clear result without a Super Over.",
    category: "Cricket",
    closeAt: "2026-05-24T14:00:00.000Z",
    resolveBy: "2026-06-01T12:00:00.000Z",
    resolutionSource: iplSource,
    status: "active"
  },
  {
    title: "Will the IPL 2026 final be played in front of a 100,000+ crowd?",
    description:
      "Resolves YES if the IPL 2026 final is held in a stadium with an official attendance exceeding 100,000 (e.g. Narendra Modi Stadium, Ahmedabad). Resolves NO otherwise.",
    category: "Cricket",
    closeAt: "2026-05-20T14:00:00.000Z",
    resolveBy: "2026-06-01T12:00:00.000Z",
    resolutionSource: iplSource,
    status: "active"
  }
];
