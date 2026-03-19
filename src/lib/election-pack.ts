export type ElectionPackQuestion = {
  title: string;
  description: string;
  category: string;
  closeAt: string;
  resolveBy: string;
  resolutionSource: string;
  status: "active";
};

const eciSource = "Election Commission of India final results / turnout data";

export const electionPack2026: ElectionPackQuestion[] = [
  // ─── Indian State Elections 2026 ───────────────────────────────────────────

  // West Bengal
  {
    title: "Will the TMC win a majority in the West Bengal Assembly election?",
    description:
      "Resolves YES if the Trinamool Congress secures 148 or more of the 294 seats in the 2026 West Bengal Legislative Assembly election, giving it a simple majority. Resolves NO otherwise.",
    category: "West Bengal 2026",
    closeAt: "2026-04-28T09:00:00.000Z",
    resolveBy: "2026-05-10T12:00:00.000Z",
    resolutionSource: eciSource,
    status: "active"
  },
  {
    title: "Will the BJP cross 100 seats in West Bengal?",
    description:
      "Resolves YES if the Bharatiya Janata Party wins 100 or more seats in the 2026 West Bengal Assembly election. This would represent a significant breakthrough in the state. Resolves NO otherwise.",
    category: "West Bengal 2026",
    closeAt: "2026-04-28T09:00:00.000Z",
    resolveBy: "2026-05-10T12:00:00.000Z",
    resolutionSource: eciSource,
    status: "active"
  },
  {
    title: "Will voter turnout in West Bengal exceed 80%?",
    description:
      "Resolves YES if the Election Commission of India reports final aggregate voter turnout above 80.0% for the 2026 West Bengal Assembly election across all phases. Resolves NO otherwise.",
    category: "West Bengal 2026",
    closeAt: "2026-04-28T09:00:00.000Z",
    resolveBy: "2026-05-10T12:00:00.000Z",
    resolutionSource: eciSource,
    status: "active"
  },

  // Tamil Nadu
  {
    title: "Will the DMK-led alliance retain its majority in Tamil Nadu?",
    description:
      "Resolves YES if the DMK and its alliance partners together win 118 or more of the 234 seats in the 2026 Tamil Nadu Assembly election. Resolves NO otherwise.",
    category: "Tamil Nadu 2026",
    closeAt: "2026-04-28T09:00:00.000Z",
    resolveBy: "2026-05-12T12:00:00.000Z",
    resolutionSource: eciSource,
    status: "active"
  },
  {
    title: "Will the AIADMK win 75+ seats in Tamil Nadu?",
    description:
      "Resolves YES if the AIADMK (including any pre-election alliance partners) wins at least 75 seats in the 2026 Tamil Nadu Assembly election. Resolves NO otherwise.",
    category: "Tamil Nadu 2026",
    closeAt: "2026-04-28T09:00:00.000Z",
    resolveBy: "2026-05-12T12:00:00.000Z",
    resolutionSource: eciSource,
    status: "active"
  },

  // Assam
  {
    title: "Will the BJP-led NDA retain a majority in Assam?",
    description:
      "Resolves YES if the BJP-led National Democratic Alliance wins 64 or more of the 126 seats in the 2026 Assam Assembly election, retaining its governing majority. Resolves NO otherwise.",
    category: "Assam 2026",
    closeAt: "2026-04-28T09:00:00.000Z",
    resolveBy: "2026-05-18T12:00:00.000Z",
    resolutionSource: eciSource,
    status: "active"
  },
  {
    title: "Will Congress win 30+ seats in Assam?",
    description:
      "Resolves YES if the Indian National Congress wins at least 30 seats in the 2026 Assam Assembly election, improving on its 2021 tally. Resolves NO otherwise.",
    category: "Assam 2026",
    closeAt: "2026-04-28T09:00:00.000Z",
    resolveBy: "2026-05-18T12:00:00.000Z",
    resolutionSource: eciSource,
    status: "active"
  },

  // Kerala
  {
    title: "Will the LDF retain power in Kerala?",
    description:
      "Resolves YES if the Left Democratic Front wins 71 or more of the 140 seats in the 2026 Kerala Assembly election, defying Kerala's historic pattern of alternating governments. Resolves NO otherwise.",
    category: "Kerala 2026",
    closeAt: "2026-04-28T09:00:00.000Z",
    resolveBy: "2026-05-20T12:00:00.000Z",
    resolutionSource: eciSource,
    status: "active"
  },
  {
    title: "Will the BJP win 5 or more seats in Kerala?",
    description:
      "Resolves YES if the Bharatiya Janata Party wins at least 5 seats in the 2026 Kerala Assembly election, marking a significant expansion from its historic 1-seat presence. Resolves NO otherwise.",
    category: "Kerala 2026",
    closeAt: "2026-04-28T09:00:00.000Z",
    resolveBy: "2026-05-20T12:00:00.000Z",
    resolutionSource: eciSource,
    status: "active"
  },

  // Puducherry
  {
    title: "Will the NDA win a majority in Puducherry?",
    description:
      "Resolves YES if the NDA alliance wins 16 or more of the 30 elected seats in the 2026 Puducherry Assembly election. Resolves NO otherwise.",
    category: "Puducherry 2026",
    closeAt: "2026-05-15T09:00:00.000Z",
    resolveBy: "2026-06-01T12:00:00.000Z",
    resolutionSource: eciSource,
    status: "active"
  },

  // ─── Indian General Election 2027 ─────────────────────────────────────────

  {
    title: "Will the BJP win 300+ seats in the next Lok Sabha election?",
    description:
      "Resolves YES if the Bharatiya Janata Party wins 300 or more seats in the next Indian general election (expected by May 2029 at the latest). Market closes when the Election Commission announces the election schedule. Resolves NO if the BJP wins fewer than 300 seats.",
    category: "General Election 2027",
    closeAt: "2027-03-31T09:00:00.000Z",
    resolveBy: "2029-06-30T12:00:00.000Z",
    resolutionSource: "Election Commission of India official Lok Sabha results",
    status: "active"
  },
  {
    title: "Will any new party win 10+ seats in the next general election?",
    description:
      "Resolves YES if any political party that did not contest the 2024 Lok Sabha election (or won zero seats) wins 10 or more seats in the next Indian general election. Resolves NO otherwise.",
    category: "General Election 2027",
    closeAt: "2027-03-31T09:00:00.000Z",
    resolveBy: "2029-06-30T12:00:00.000Z",
    resolutionSource: "Election Commission of India official Lok Sabha results",
    status: "active"
  },

  // ─── World Events 2026-2027 ────────────────────────────────────────────────

  {
    title: "Will India land Chandrayaan-4 on the Moon by end of 2026?",
    description:
      "Resolves YES if ISRO successfully achieves a soft landing of Chandrayaan-4 (or any component of the mission) on the lunar surface on or before December 31, 2026 23:59 UTC. Resolves NO if no landing occurs by that date or if the mission fails.",
    category: "World Events",
    closeAt: "2026-12-15T09:00:00.000Z",
    resolveBy: "2027-01-15T12:00:00.000Z",
    resolutionSource: "Official ISRO press releases and mission status updates (isro.gov.in)",
    status: "active"
  },
  {
    title: "Will the US enter a recession in 2026?",
    description:
      "Resolves YES if the National Bureau of Economic Research (NBER) Business Cycle Dating Committee declares that a recession began at any point during 2026. Since NBER declarations are often delayed, this market resolves by end of 2027. Resolves NO if no such declaration is made by the resolve date.",
    category: "World Events",
    closeAt: "2026-12-31T09:00:00.000Z",
    resolveBy: "2027-12-31T12:00:00.000Z",
    resolutionSource: "NBER Business Cycle Dating Committee official announcement (nber.org/research/business-cycle-dating)",
    status: "active"
  },
  {
    title: "Will the FIFA Club World Cup 2025 final have over 60,000 attendance?",
    description:
      "Resolves YES if the official match attendance for the 2025 FIFA Club World Cup final (scheduled for July 13, 2025 at MetLife Stadium, New Jersey) exceeds 60,000. Resolves NO otherwise, including if the final is moved to a different venue.",
    category: "World Events",
    closeAt: "2026-07-12T09:00:00.000Z",
    resolveBy: "2026-07-20T12:00:00.000Z",
    resolutionSource: "Official FIFA match report for the Club World Cup 2025 final",
    status: "active"
  },
  {
    title: "Will a non-OpenAI AI model top the LMSYS leaderboard by Dec 2026?",
    description:
      "Resolves YES if, at any point on or before December 31, 2026, a model not developed or co-developed by OpenAI holds the #1 overall position on the LMSYS Chatbot Arena leaderboard (lmsys.org). Resolves NO if an OpenAI model holds the top spot for the entire period from market open through December 31, 2026.",
    category: "World Events",
    closeAt: "2026-12-25T09:00:00.000Z",
    resolveBy: "2027-01-07T12:00:00.000Z",
    resolutionSource: "LMSYS Chatbot Arena leaderboard (lmarena.ai)",
    status: "active"
  },
  {
    title: "Will India's GDP growth exceed 7% in FY2026-27?",
    description:
      "Resolves YES if India's real GDP growth for fiscal year 2026-27 (April 2026 to March 2027) exceeds 7.0% according to the first advance estimate or the provisional estimate published by the Ministry of Statistics. Resolves NO otherwise.",
    category: "World Events",
    closeAt: "2027-01-15T09:00:00.000Z",
    resolveBy: "2027-06-30T12:00:00.000Z",
    resolutionSource: "Ministry of Statistics and Programme Implementation, Government of India (mospi.gov.in)",
    status: "active"
  },

  // ─── Cricket / Sports ─────────────────────────────────────────────────────

  {
    title: "Will India win the 2026 ICC Champions Trophy?",
    description:
      "Resolves YES if the Indian men's cricket team wins the 2026 ICC Champions Trophy. Resolves NO if India does not win the tournament, including if India does not qualify or the tournament is cancelled.",
    category: "Cricket",
    closeAt: "2026-03-30T09:00:00.000Z",
    resolveBy: "2026-04-15T12:00:00.000Z",
    resolutionSource: "Official ICC match results (icc-cricket.com)",
    status: "active"
  },
  {
    title: "Will an IPL team score 300+ in IPL 2026?",
    description:
      "Resolves YES if any team posts a total of 300 or more runs in a single innings during the 2026 Indian Premier League season (including playoffs). Resolves NO if no team achieves this milestone during the entire season.",
    category: "Cricket",
    closeAt: "2026-05-25T09:00:00.000Z",
    resolveBy: "2026-06-05T12:00:00.000Z",
    resolutionSource: "Official IPL match scorecards via BCCI/IPL (iplt20.com)",
    status: "active"
  }
];
