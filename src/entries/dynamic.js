import { setNgrams, languageData } from '../languageData.js';
import { eld } from '../languageDetector.js';

/**
 * @param {string} name File inside /ngrams/, with ELD ngrams data format
 * @returns {boolean|undefined} true if file was loaded
 */
export async function load(name = 'medium') {
    if (typeof name !== 'string') throw new TypeError('file name must be a string');
    let filename = name.replace(/\.js$/, '')
    if (filename.includes('..')) {
        // reject directory climbing attempts
        throw new Error('invalid ngrams name (\"..\" not allowed)');
    }
    if (!/^[A-Za-z0-9._-]+$/.test(filename)) {
        throw new Error('invalid ngrams name (only A-Za-z0-9._- allowed)');
    }
    return import('../ngrams/' + filename + '.js').then((module) => {
        if (module.ngramsData) {
            setNgrams(module.ngramsData)
            if (languageData.type) {
                return true
            }
        }
        throw new Error('invalid data at loaded database file');
    })
}

const withLoader = {...eld, load};

export { withLoader as eld };
export default withLoader;