import { createEld } from '../languageDetector.js';

/**
 * Builds one independent eld instance with its own load()/loadNgrams(), not preloaded with any
 * database. Called once at module-evaluation time for the default export, and again by
 * newInstance() for anyone who explicitly wants another isolated dynamic instance (its own
 * loaded database, subset and text-cleanup settings) in the same process - e.g. one part of an
 * app running 'large' and another running 'small' at the same time, without either affecting the
 * other.
 *
 * @returns {Object}
 */
function build() {
    const { instance, loadData } = createEld()

    /**
     * @param {string} name File inside /ngrams/, with ELD ngrams data format
     * @returns {boolean|undefined} true if file was loaded
     */
    async function load(name = 'medium') {
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
            if (module.ngramsData && loadData(module.ngramsData)) {
                return true
            }
            throw new Error('invalid data at loaded database file');
        })
    }

    instance.load = load
    instance.loadNgrams = load
    instance.newInstance = build

    return instance
}

const eld = build();

export { eld };
export default eld;
