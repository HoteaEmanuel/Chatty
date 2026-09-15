let counter = 0;

// Local-only ids. Once messages come from Postgres, rows carry real uuids.
export const localId = (prefix = 'local') =>
  `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`;
