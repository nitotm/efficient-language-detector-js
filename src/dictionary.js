/*
Copyright 2023 Nito T.M.
License https://www.apache.org/licenses/LICENSE-2.0 Apache-2.0
Author Nito T.M. (https://github.com/nitotm)
Package npmjs.com/package/eld
*/

// JS does not allow raw byte strings, Uint8Array\hex adds complexity and a heavier database.
// A dictionary for invalid UTF-8 bytes solves all problems.
export const dictionary = [
  ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ',
  ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '\'', ' ', ' ', ' ', ' ', ' ', ' ',
  ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ',
  ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ',
  ' ', ' ', ' ', ' ', '`', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
  's', 't', 'u', 'v', 'w', 'x', 'y', 'z', ' ', ' ', ' ', ' ', ' ', 'M', '2', 'R', 'J', 'O', 'P', '{', 'ä', '>', 'â',
  'ü', 'é', '_', 'Q', 'á', 'ô', 'ë', 'å', 'õ', 'è', 'ï', 'Z', 'û', '}', 'à', '3', 'ù', 'É', 'Y', 'î', 'í', ']', '|',
  ')', 'ÿ', '~', '1', 'V', 'D', 'T', '4', '8', 'F', 'I', 'K', '7', 'W', 'S', '/', 'E', 'B', '5', ';', 'N', 'C', 'ê',
  '*', 'X', '=', '^', ':', '[', 'H', 'ò', ' ', ' ', '¢', '!', '(', ',', 'ß', ' ', 'ø', 'ó', ' ', ' ', ' ', ' ', 'U',
  'ö', '6', '@', 'À', 'Á', ' ', '<', 'ý', 'G', '-', 'A', 'ñ', 'ú', ' ', ' ', ' ', ' ', '$', 'L', 'æ', '?', '0', '"',
  '#', '%', '&', '+', 'ì', '9', '.', 'ç', ' ', 'µ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ',
  ' ', ' ', ' ']