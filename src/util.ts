import Decimal from "decimal.js";
import { parse as losslessJSONParse } from "lossless-json";

import addressTickerMap from "../constants/addressTickerMap.json";
import { U256_MAX_VALUE } from "../models/BigInts";
import {
  Approve_095ea7b3_In,
  ParsedTxAnalysis,
  Swap_Generalized_In,
  Transfer_a9059cbb_In,
  TxFromStream,
} from "../models/crystalball";
import { Currency } from "../models/Currency";

Decimal.set({ rounding: Decimal.ROUND_DOWN });
Decimal.set({ toExpPos: 9e15 });
Decimal.set({ toExpNeg: -9e15 });
Decimal.set({ precision: 100 });

//// FUNCTIONS

// formats time in milliseconds
export const formatTime = (
  ms: number,
  omitLeadingZeros = true,
  omitTrailingZeros = false,
  approximate = false,
) => {
  let leftovers = ms;

  // get days
  const days = Math.floor(leftovers / (1000 * 60 * 60 * 24));
  leftovers %= 1000 * 60 * 60 * 24;

  // get hours
  const hours = Math.floor(leftovers / (1000 * 60 * 60));
  leftovers %= 1000 * 60 * 60;

  // get minutes
  const minutes = Math.floor(leftovers / (1000 * 60));
  leftovers %= 1000 * 60;

  // get seconds
  const seconds = Math.floor(leftovers / 1000);
  // leftovers %= 1000

  // time obj
  const time = [
    { label: "d", val: days },
    { label: "h", val: hours },
    { label: "m", val: minutes },
    { label: "s", val: seconds },
  ];

  // if approximate, return the value of the largest unit
  if (approximate) {
    for (let i = 0; i < time.length; i++) {
      if (time[i].val === 0) {
        continue;
      } else {
        return time[i].val + time[i].label;
      }
    }
  }

  if (omitLeadingZeros) {
    for (let i = 0; i < time.length; i++) {
      if (time[i].val === 0) {
        if (i === time.length - 1) {
          break;
        } else {
          delete time[i];
        }
      } else {
        break;
      }
    }
  }

  if (omitTrailingZeros) {
    for (let i = 0; i < time.length; i++) {
      if (time[time.length - i - 1].val === 0) {
        delete time[time.length - i - 1];
      } else {
        break;
      }
    }
  }

  // return
  return time.reduce((acc, curr) => {
    return acc + " " + curr.val + curr.label;
  }, "");
};

// Adds thousands separators to a number string
export const addSeparatorsToNumString = (number: string) => {
  // split by decimal
  const [integer, fractional] = number.split(".");
  // process the integer part
  const intWithSeparator = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (fractional) {
    return [intWithSeparator, fractional].join(".");
  } else {
    return intWithSeparator;
  }
};

// formats Decimal amount as readable number string
export const formatAmount = (
  amount: Decimal | number,
  options?: {
    showThousandsSeparators?: boolean;
    maxDecimals?: number;
    expPwrThreshold?: number;
    decimalSigFigs?: number;
  },
) => {
  let dec = new Decimal(amount);

  // if max decimals is specified, then set
  if (options?.maxDecimals !== undefined)
    dec = dec.toDecimalPlaces(options.maxDecimals, Decimal.ROUND_UP);

  // format depending on scale
  if (dec.gt(1000)) {
    dec = dec.toDecimalPlaces(2);
  } else if (dec.decimalPlaces() > 8) {
    dec = dec.toSignificantDigits(
      options?.decimalSigFigs ?? 5,
      Decimal.ROUND_UP,
    );
  }

  // format depending on over or under exp power threshold
  if (
    options?.expPwrThreshold &&
    Decimal.log10(dec).gte(options.expPwrThreshold)
  ) {
    return dec.toExponential(options?.maxDecimals);
  }

  return options?.showThousandsSeparators ?? true
    ? addSeparatorsToNumString(dec.toString())
    : dec.toString();
};

// checksums address
export const checksumAddress = (address: string) => {
  try {
    return ethers.utils.getAddress(address).replace(/^(0x)/, "");
  } catch (e) {
    return address;
  }
};

export const splitCamelCase = (str: string, lowerNonAcronyms = false) => {
  // split string by capitals (will contain empty strings in list)
  const splitListUnfiltered = str.split(/([A-Z][a-z]+)/);

  // filter out empty strings
  const splitList = splitListUnfiltered.filter((e) => e);

  if (lowerNonAcronyms) {
    return splitList.map((word, i) => {
      if (i === 0) return word;
      if (word === word.toUpperCase()) return word;
      return word.toLowerCase();
    });
  }

  return splitList;
};

/**
 * Abbreviates a large number using a suffix. Small numbers receive standard suffixes (up to T for trillions).
 * Beyond this threshold, e notation is used.
 *
 * @example
 * abbreviateAmount(1000000) => "1.00M"
 * abbreviateAmount(1000000000000) => "1.00T"
 * abbreviateAmount(1000000000000000) => "1.00e15"
 *
 * */
export const abbreviateAmount = (
  amount: Decimal | number,
  numDecimals = 2,
): string => {
  // suffixes for abbreviations
  const lowDenominationSuffixes = ["", "K", "M", "B", "T"];
  const decimalJsAmount = new Decimal(amount);

  // edge cases
  // special case 0 because otherwise taking the log is -infinity
  if (decimalJsAmount.eq(0)) return "0";
  // special case negatives
  if (decimalJsAmount.lt(0))
    return `-${abbreviateAmount(decimalJsAmount.mul(-1), numDecimals)}`;
  // special case less than 1
  if (decimalJsAmount.lt(1))
    return decimalJsAmount.toSD(numDecimals, Decimal.ROUND_UP).toString();

  // obtain index into abbreviations array
  // note: log is really slow, so we use a faster method
  // const abbrevIndex = decimalJsAmount.log(1000).floor().toNumber()
  const numWholeNumberDigits = (() => {
    const wholeNumStr = decimalJsAmount.toString().split(".")[0];
    const numChars = wholeNumStr.length;
    if (numChars === 1 && wholeNumStr === "0") return 0;
    return numChars;
  })();
  const abbrevIndex = Math.floor((numWholeNumberDigits - 1) / 3);

  // get abbreviation
  const abbrev = (() => {
    const suffixLookup = lowDenominationSuffixes[abbrevIndex];
    if (suffixLookup !== undefined) return suffixLookup;

    // if there doesn't exist a suffix in lowDenominationSuffixes, then use e notation.
    return `e${numWholeNumberDigits - 1}`;
  })();

  // get numerical portion of abbreviation
  const abbrevNum = decimalJsAmount
    .div(new Decimal(1000).pow(abbrevIndex))
    .toDecimalPlaces(numDecimals)
    .toString();

  // return abbreviated string
  return `${abbrevNum}${abbrev}`;
};

/**
 * @deprecated Use {@link scaleValueOrThrow}
 */
export const normalizeCurr = (amount: Decimal.Value, decimals: number) => {
  // normalize currency against its decimals
  return new Decimal(amount).div(new Decimal(10).pow(decimals));
};

/**
 * Given a Record with {@link Currency} values, filters out all value which
 * have `isSwappable` unset or equal to `false`.
 */
export const removeNonSwappableCurrs = (
  currencies: Partial<Record<string, Currency>>,
) => {
  const result: Record<string, Currency | undefined> = {};

  for (const key in currencies) {
    if (currencies[key]?.isSwappable ?? false) {
      result[key] = currencies[key];
    }
  }

  return result;
};

// parses stringified json losslessly (stringifies all numbers to handle bignums)
export const parseJSONLosslessly = (jsonString: string) => {
  // losslessJSONParse converts every number (ints and floats) in the
  // JSON string into a LosslessNumber, a type built into the lib.
  // The following function (reviver) will convert LosslessNumber into
  // string so that it's easier to work with.

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function reviver(key: string, value: any) {
    if (value && value.isLosslessNumber) {
      // cast LosslessNumber to string and return
      return value.toString();
    } else {
      // pass non integers through
      return value;
    }
  }

  // return parsed
  return losslessJSONParse(jsonString, reviver);
};

// parses a transaction's analysis data into useful display data
export const parseTx = (tx: TxFromStream) => {
  // parsed data
  const parsed: ParsedTxAnalysis = {
    txType: "Unknown",
    description: "",
    path: [],
  };

  // edge cases

  // if no input and value is zero, then display as no op
  if (!tx.input && tx.value === 0) {
    parsed.txType = "No-op";

    return parsed;
  }

  // if no analysis and value is nonzero, then display as eth transfer
  if (!tx.analysis && tx.value > 0) {
    parsed.txType = "Transfer";
    parsed.description = normalizeCurr(new Decimal(tx.value), 18).toString();

    return parsed;
  }

  // if no analysis in all other cases, then nothing to parse
  if (!tx.analysis) return parsed;

  // get contract and function name
  const { fn_name } = tx.analysis.input_metadata;

  // get contract
  const contract = (addressTickerMap as Record<string, string>)[tx.to];

  // if no function name or contract, then we don't recognize it
  if (!fn_name) return parsed;

  // switch parse logic depending on contract and function name
  switch (fn_name) {
    case "Custody_contract": {
      break;
    }
    case "swapExactETHForTokens":
    case "swapExactETHForTokensSupportingFeeOnTransferTokens":
    case "swapExactTokensForETH":
    case "swapExactTokensForTokens":
    case "swapExactTokensForTokensSupportingFeeOnTransferTokens":
    case "swapTokensForExactETH":
    case "swapTokensForExactTokens": {
      parsed.txType = "Swap";

      // get path
      const path = (tx.analysis.input_params as Swap_Generalized_In).path;

      // map curr addresses to symbols
      const pathCurrNames = path.map(
        (addr) =>
          (addressTickerMap as Record<string, string>)[addr] ||
          addr.slice(0, 8),
      );

      // add description as in and out currs (only if they exist)
      if (pathCurrNames.length > 0)
        parsed.description = [
          pathCurrNames[0],
          pathCurrNames[pathCurrNames.length - 1],
        ].join("→");

      // add path
      parsed.path = path;
      break;
    }
    case "approve": {
      parsed.txType = "Approve";

      // amount in wad
      const wadAmt = (tx.analysis?.input_params as Approve_095ea7b3_In)?.wad;
      if (!wadAmt) break;

      // description
      parsed.description = new Decimal(String(U256_MAX_VALUE)).eq(wadAmt)
        ? "∞"
        : normalizeCurr(new Decimal(wadAmt), 18).toString();

      break;
    }
    case "transfer": {
      parsed.txType = "Transfer";

      // amount in wad
      const wadAmt = (tx.analysis?.input_params as Transfer_a9059cbb_In)?.wad;
      if (!wadAmt) break;

      switch (contract) {
        case "USDC":
        case "USDT": {
          // description
          parsed.description = normalizeCurr(new Decimal(wadAmt), 6).toString();

          break;
        }
        default: {
          // description
          parsed.description = normalizeCurr(
            new Decimal(wadAmt),
            18,
          ).toString();

          break;
        }
      }

      break;
    }
    case "transferFrom": {
      parsed.txType = "Transfer from";

      break;
    }
    case "withdraw": {
      parsed.txType = "Withdraw";

      break;
    }
    default: {
      break;
    }
  }

  return parsed;
};

export const jsonToCsv = (json: readonly unknown[]) => {
  return Papa.unparse([...json], {
    header: true,
    delimiter: ",",
    newline: "\n",
  });
};

export const arrayBufferToStr = (ab: ArrayBuffer) =>
  String.fromCharCode(...Array.from(new Uint8Array(ab)));

export const b64UrlEncode = (str: string, pad = false) => {
  const encoded = btoa(str).replaceAll("+", "-").replaceAll("/", "_");
  return pad ? encoded : encoded.replaceAll("=", "");
};

/**
 * truncateString shortens a string to a more manageable length.
 * Make sure to allow the user to access (copy or display) the original text!
 *
 * @param {string} [str] the string to be (possibly) shortened
 * @param {number} [maxLength=15] only abbreviate if the string is longer than
 * this
 * @param {number} [peekLength=6]  abbreviate the string to `peekLength` characters on each side of an ellipsis
 * @returns {string} an abbreviated string
 */
export const truncateString = (str: string, maxLength = 15, peekLength = 6) => {
  if (str && str.length > maxLength) {
    const firstSection = str.substring(0, peekLength);
    const lastSection = str.substring(str.length - peekLength);
    return firstSection + "..." + lastSection;
  }
  return str;
};
