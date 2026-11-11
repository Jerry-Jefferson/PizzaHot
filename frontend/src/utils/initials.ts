interface InitialsSource {
  name?: string | null;
  surname?: string | null;
  email?: string | null;
}

const firstLetter = (value?: string | null): string => value?.trim().charAt(0) ?? "";

export function getInitials({ name, surname, email }: InitialsSource): string {
  const fromName = firstLetter(name) + firstLetter(surname);
  if (fromName) {
    return fromName.toUpperCase();
  }
  return (firstLetter(email) || "?").toUpperCase();
}
