import { Brand } from './Brand'
import { capitalizeFirstLetter } from './format'

/**
 * Narrows a string into one which is guaranteed to start with a given prefix.
 */
export const startsWith = <S extends string>(
  prefix: S,
  str: string
): str is `${S}${string}` => str.startsWith(prefix)

/**
 * Represents an array of strings, branded as 'SplitStringArray'.
 * ex: ['Hello', 'World']
 */
export type SplitStringArray = Brand<readonly string[], 'SplitStringArray'>

/**
 * Represents a title-cased string, branded as 'TitleCaseString'.
 * ex: 'Hello World'
 */
export type TitleCaseString = Brand<string, 'TitleCaseString'>

/**
 * Represents a snake-cased string, branded as 'SnakeCaseString'.
 * ex: 'hello_world'
 */
export type SnakeCaseString = Brand<string, 'SnakeCaseString'>

/**
 * Represents a camel-cased string, branded as 'CamelCaseString'.
 * ex: 'helloWorld'
 */
export type CamelCaseString = Brand<string, 'CamelCaseString'>

export function toSplitStringArray(strs: readonly string[]): SplitStringArray {
  const result: readonly string[] = strs
    .flatMap((str) => str.trim().split(' '))
    .filter((x) => x.length > 0)
    .map((x) => x.trim().toLowerCase())

  return result as SplitStringArray
}

/**
 * Splits a title-cased string into an array of words, branded as
 * 'SplitStringArray'.
 *
 * @param {string} str - The title-cased string to be split.
 * @returns {SplitStringArray} An array of words extracted from the title-cased
 *   string, branded as 'SplitStringArray'.
 */
export function fromTitleCase(str: string): SplitStringArray {
  return toSplitStringArray(str.split(' '))
}

/**
 * Splits a snake-cased string into an array of words, branded as
 * 'SplitStringArray'.
 *
 * @param {string} str - The snake-cased string to be split.
 * @returns {SplitStringArray} An array of words extracted from the snake-cased
 *   string, branded as 'SplitStringArray'.
 */
export function fromSnakeCase(str: string): SplitStringArray {
  return toSplitStringArray(str.split('_'))
}

/**
 * Splits a camel-cased string into an array of words, branded as
 * 'SplitStringArray'.
 *
 * @param {string} str - The snake-cased string to be split.
 * @returns {SplitStringArray} An array of words extracted from the snake-cased
 *   string, branded as 'SplitStringArray'.
 */
export function fromCamelCase(str: string): SplitStringArray {
  return toSplitStringArray(str.split(/(?=[A-Z])/))
}

/**
 * Converts an array of strings, branded as 'SplitStringArray', to a
 * title-cased string, branded as 'TitleCaseString'. Each word in the input
 * array will have its first letter capitalized and the remaining letters in
 * lowercase. The words will be separated by a single space in the output
 * string.
 *
 * @param {SplitStringArray} splitString - An array of words to be converted to
 *   title case.
 * @returns {TitleCaseString} A title-cased string representation of the input
 *   words array, branded as 'TitleCaseString'.
 */
export function toTitleCase(splitString: SplitStringArray): TitleCaseString {
  return splitString.map(capitalizeFirstLetter).join(' ') as TitleCaseString
}

/**
 * Converts an array of strings, branded as 'SplitStringArray', to a
 * snake-cased string, branded as 'SnakeCaseString'. Each word in the input
 * array will be converted to lowercase, and the words will be separated by
 * underscores in the output string.
 *
 * @param {SplitStringArray} splitString - An array of words to be converted to
 *   snake case.
 * @returns {SnakeCaseString} A snake-cased string representation of the input
 *   words array, branded as 'SnakeCaseString'.
 */
export function toSnakeCase(splitString: SplitStringArray): SnakeCaseString {
  return splitString.join('_') as SnakeCaseString
}

/**
 * Converts an array of strings, branded as 'SplitString', to a camel-cased
 * string, branded as 'CamelCaseString'. The first word in the input array will
 * be in lowercase, and the subsequent words will have their first letter
 * capitalized and the remaining letters in lowercase. The words will be
 * combined without any separators in the output string.
 *
 * @param {SplitString} splitString - An array of words to be converted to
 *   camel case.
 * @returns {CamelCaseString} A camel-cased string representation of the input
 *   words array, branded as 'CamelCaseString'.
 */
export function toCamelCase(splitString: SplitStringArray): CamelCaseString {
  return splitString
    .map((word, i) => {
      if (i === 0) return word
      return capitalizeFirstLetter(word)
    })
    .join('') as CamelCaseString
}

//
// #region Validators {{{
//

/**
 * Matches a snake_case string -- one which contains only digits, lowercase
 * chars, and underscores.
 */
const SNAKE_CASE_REGEX = /^[_a-z0-9]*$/

/** Narrows `str` to a {@link SnakeCaseString}. */
export function isSnakeCase(str: string): str is SnakeCaseString {
  return SNAKE_CASE_REGEX.test(str)
}

/**
 * Matches a camelCase string -- one which starts with a lowercase char or a
 * digit, then contains a mix of digits and letters.
 */
const CAMEL_CASE_REGEX = /^[a-z0-9][a-zA-Z0-9]*$/

/** Narrows `str` to a {@link CamelCaseString}. */
export function isCamelCase(str: string): str is CamelCaseString {
  if (str.length === 0) return true
  return CAMEL_CASE_REGEX.test(str)
}

//
// #endregion Validators }}}
//

/**
 * Given singular/plural forms of a noun, selects the properly pluralized noun
 * based on the given count.
 *
 * ```typescript
 * pluralize('cactus', 'cacti', 1)  // 'cactus'
 * pluralize('sandwich', 'sandwiches', 100)  // 'sandwiches'
 * ```
 */
export function pluralize(
  singular: string,
  plural: string,
  count: number
): string {
  if (count === 1) return singular
  return plural
}

/**
 * Trim all of the given character from the end of the given string.
 * Will throw an error if `char` is more than one character long.
 *
 */
export function trimEnd(str: string, char: string): string {
  if (char.length > 1) throw new Error('char must be a char')

  let i = str.length - 1
  for (; i >= 0; i--) {
    if (str[i] !== char) break
  }

  return str.slice(0, i + 1)
}
