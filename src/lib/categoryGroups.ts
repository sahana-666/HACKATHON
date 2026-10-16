/**
 * Maps raw API category strings → one of 7 friendly group labels.
 * Add new raw strings here as the API evolves; unknown ones fall through to "Other".
 */

export const GROUP_LABELS = [
  "Tech & AI",
  "Robotics & Engineering",
  "Design & Art",
  "Performing Arts & Music",
  "Literary & Debate",
  "Gaming & Quiz",
  "Food, Culture & Other",
] as const;

export type GroupLabel = (typeof GROUP_LABELS)[number];

const RAW_TO_GROUP: Record<string, GroupLabel> = {
  // Tech & AI
  "Tech": "Tech & AI",
  "Technology": "Tech & AI",
  "AI": "Tech & AI",
  "AI & ML": "Tech & AI",
  "Machine Learning": "Tech & AI",
  "Data Science": "Tech & AI",
  "Cybersecurity": "Tech & AI",
  "Web Dev": "Tech & AI",
  "Web Development": "Tech & AI",
  "App Development": "Tech & AI",
  "Software": "Tech & AI",
  "Hackathon": "Tech & AI",
  "Programming": "Tech & AI",
  "Coding": "Tech & AI",
  "IoT": "Tech & AI",
  "Cloud": "Tech & AI",

  // Robotics & Engineering
  "Robotics": "Robotics & Engineering",
  "Robotics & Electronics": "Robotics & Engineering",
  "Aerial Robotics": "Robotics & Engineering",
  "Engineering": "Robotics & Engineering",
  "Electronics": "Robotics & Engineering",
  "Mechanical": "Robotics & Engineering",
  "Civil": "Robotics & Engineering",
  "Automobile": "Robotics & Engineering",

  // Design & Art
  "Design": "Design & Art",
  "Design & Product": "Design & Art",
  "Art & Design": "Design & Art",
  "Arts & Craft": "Design & Art",
  "Visual Arts": "Design & Art",
  "Photography": "Design & Art",
  "Fashion": "Design & Art",
  "Architecture": "Design & Art",
  "Graphic Design": "Design & Art",
  "UI/UX": "Design & Art",
  "Film": "Design & Art",
  "Media": "Design & Art",

  // Performing Arts & Music
  "Music": "Performing Arts & Music",
  "Dance": "Performing Arts & Music",
  "Drama": "Performing Arts & Music",
  "Theatre": "Performing Arts & Music",
  "Performing Arts": "Performing Arts & Music",
  "Fine Arts": "Performing Arts & Music",

  // Literary & Debate
  "Literature": "Literary & Debate",
  "Creative Writing": "Literary & Debate",
  "Debate": "Literary & Debate",
  "Public Speaking": "Literary & Debate",
  "Journalism": "Literary & Debate",
  "Quiz": "Gaming & Quiz",
  "Spell Bee": "Literary & Debate",
  "Poetry": "Literary & Debate",

  // Gaming & Quiz
  "Gaming": "Gaming & Quiz",
  "Esports": "Gaming & Quiz",
  "Sports": "Gaming & Quiz",
  "Athletics": "Gaming & Quiz",
  "Adventure": "Gaming & Quiz",

  // Food, Culture & Other
  "Food": "Food, Culture & Other",
  "Culinary": "Food, Culture & Other",
  "Culture": "Food, Culture & Other",
  "Cultural": "Food, Culture & Other",
  "Business": "Food, Culture & Other",
  "Entrepreneurship": "Food, Culture & Other",
  "Finance": "Food, Culture & Other",
  "Management": "Food, Culture & Other",
  "HR": "Food, Culture & Other",
  "Marketing": "Food, Culture & Other",
  "Science": "Food, Culture & Other",
  "Environment": "Food, Culture & Other",
  "Social": "Food, Culture & Other",
  "General": "Food, Culture & Other",
  "Other": "Food, Culture & Other",
};

/** Return the friendly group for a raw API category string. */
export function categoryToGroup(raw: string | null | undefined): GroupLabel {
  const key = (raw ?? "").trim();
  return RAW_TO_GROUP[key] ?? "Food, Culture & Other";
}

/** Return the distinct groups present in a list of events, in GROUP_LABELS order. */
export function groupsInEvents(events: { category?: string }[]): GroupLabel[] {
  const present = new Set<GroupLabel>();
  for (const e of events) present.add(categoryToGroup(e.category));
  return GROUP_LABELS.filter((g) => present.has(g));
}
