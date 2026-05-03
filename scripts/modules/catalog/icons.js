export function getSubjectIcon(subjectName) {
  const normalizedName = subjectName.toLowerCase();

  if (normalizedName.includes("law")) {
    return `
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 4v16"></path>
        <path d="M5 8h14"></path>
        <path d="m7 8-3 6h6Z"></path>
        <path d="m17 8-3 6h6Z"></path>
      </svg>
    `;
  }

  if (normalizedName.includes("data")) {
    return `
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M5 8h14"></path>
        <path d="M5 16h14"></path>
        <circle cx="7" cy="8" r="2"></circle>
        <circle cx="17" cy="16" r="2"></circle>
      </svg>
    `;
  }

  return `
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M8 9h8"></path>
      <path d="M8 15h8"></path>
      <path d="M9 4 5 20"></path>
      <path d="m19 4-4 16"></path>
    </svg>
  `;
}
