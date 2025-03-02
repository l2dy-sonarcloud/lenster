import { Regex } from "@hey/data/regex";

/**
 * Remove restricted symbols from account name
 *
 * @param name Account name
 * @returns Account name with restricted symbols removed
 */
const sanitizeDisplayName = (
  name: null | string | undefined
): null | string => {
  if (!name) {
    return null;
  }

  return name.replace(Regex.accountNameFilter, " ").trim().replace(/\s+/g, " ");
};

export default sanitizeDisplayName;
