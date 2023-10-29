import { ELDR } from "./eldr.js";
import { ngramsData } from "./ngrams/ngrams-xs60.js";

const eldr = new ELDR(ngramsData);
export { eldr };
