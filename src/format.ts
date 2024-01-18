/**
 * Capitalizes the first letter of a given string,
 * appending the rest of the string unchanged.
 */
export const capitalizeFirstLetter = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1)

/**
 * Formats an address or other long string by rendering the first
 * and last four characters, with '...' between them.
 */
export const truncateAddress = (address: string): string =>
  `${address.slice(0, 4)}...${address.slice(-5)}`
