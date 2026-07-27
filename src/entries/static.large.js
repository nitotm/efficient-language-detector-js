import { createEld } from '../languageDetector.js'
import { ngramsData } from '../ngrams/large.js'

/**
 * Builds one independent, fully preloaded 'large' eld instance. Called once at module-evaluation
 * time for the default export, and again by newInstance() for anyone who explicitly wants another
 * isolated 'large' instance (its own subset / text-cleanup settings) in the same process.
 *
 * @returns {Object}
 */
function build() {
    const { instance, loadData } = createEld()
    loadData(ngramsData)
    instance.newInstance = build
    return instance
}

const eld = build()

export { eld }
export default eld
