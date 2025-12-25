import { setNgrams } from '../languageData.js';
import { ngramsData } from '../ngrams/medium.js';
import { eld } from '../languageDetector.js';

setNgrams(ngramsData);

export { eld };
export default eld;