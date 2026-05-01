export const SUBJECTS = [
  { value: "RIYAZIYYAT", label: "Riyaziyyat", emoji: "📐" },
  { value: "FIZIKA", label: "Fizika", emoji: "⚡" },
  { value: "KIMYA", label: "Kimya", emoji: "🧪" },
  { value: "BIOLOGIYA", label: "Biologiya", emoji: "🌿" },
  { value: "INFORMATIKA", label: "İnformatika", emoji: "💻" },
  { value: "AZERBAYCAN_DILI", label: "Azərbaycan dili", emoji: "📖" },
  { value: "EDEBIYYAT", label: "Ədəbiyyat", emoji: "✍️" },
  { value: "INGILIS_DILI", label: "İngilis dili", emoji: "🌍" },
  { value: "TARIX", label: "Tarix", emoji: "🏛️" },
  { value: "COGRAFIYA", label: "Coğrafiya", emoji: "🗺️" },
] as const;

export const SUBJECT_LABEL: Record<string, string> = Object.fromEntries(
  SUBJECTS.map(({ value, label }) => [value, label])
);

export const DAY_AZ: Record<string, string> = {
  MONDAY: "Bazar ertəsi",
  TUESDAY: "Çərşənbə axşamı",
  WEDNESDAY: "Çərşənbə",
  THURSDAY: "Cümə axşamı",
  FRIDAY: "Cümə",
  SATURDAY: "Şənbə",
  SUNDAY: "Bazar",
};

export const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export const DAY_ORDER: Record<string, number> = Object.fromEntries(
  DAYS_OF_WEEK.map((d, i) => [d, i])
);

export const ROLE_LABEL: Record<string, string> = {
  STUDENT: "Şagird",
  TEACHER: "Müəllim",
  PARENT: "Valideyn",
  ADMIN: "Admin",
};

export const RELATION_LABEL: Record<string, string> = {
  MOTHER: "Ana",
  FATHER: "Ata",
  GUARDIAN: "Qəyyum",
};
