import { ELDR } from "./eldr.js";
import { ngramsData } from "./ngrams/ngrams-s60.js";

const eldr = new ELDR(ngramsData);
export { eldr };
