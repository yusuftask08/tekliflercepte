/** Only a first name + last-initial is shown to other users (privacy) —
 *  the full last name is still stored and available to the person
 *  themselves and to admins, just not exposed peer-to-peer in the UI. */
export function displayName(user) {
  if (!user) return "";
  const lastInitial = user.lastName?.trim()?.[0];
  return lastInitial ? `${user.firstName} ${lastInitial}.` : user.firstName ?? "";
}
