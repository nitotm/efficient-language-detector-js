/**
 * Result object returned by the language detection
 * @interface LanguageResult
 */
interface LanguageResult {
    /** ISO 639-1 language code (e.g. 'en', 'es', 'fr') or empty string if no language detected */
    language: string;

    /**
     * Returns an object containing confidence scores for each detected language
     * @returns {Record<string, number>} Object with ISO 639-1 codes as keys and confidence scores as values
     * @example
     * // Returns something like {'es': 0.5, 'et': 0.2}
     */
    getScores: () => Record<string, number>;

    /**
     * Checks if the detection result is reliable based on confidence scores and number of ngrams
     * @returns {boolean} true if the detection is considered reliable
     */
    isReliable: () => boolean;
}

/** Info object returned by `eld.info()` */
interface EldInfo {
    'Data type': string;
    'Languages': Record<number, string>;
    'Subset': Record<number, string> | false;
}

interface Eld {
    /**
     * Identifies the natural language of a UTF-8 string
     * @param {string} text - UTF-8 text to analyze
     * @returns {LanguageResult} Object containing the detected language and methods to get detailed results
     * @example
     * const result = eld.detect('Hola, cómo te llamas?');
     * console.log(result.language); // 'es'
     * console.log(result.getScores()); // {'es': 0.5, 'et': 0.2}
     * console.log(result.isReliable()); // true
     */
    detect: (text: string) => LanguageResult;

    /**
     * Enable/disable text cleaning. Implementation-specific side effect; returns void.
     */
    enableTextCleanup(flag: boolean): void;

    /** @deprecated Use `enableTextCleanup` instead. */
    cleanText(flag: boolean): void;

    /**
     * Create a dynamic subset of languages. Accepts an array of language keys or `false` to reset.
     * Returns a validated list of language keys included in the new subset.
     */
    setLanguageSubset(languages: string[] | boolean): Record<number, string>;

    /** @deprecated Use `setLanguageSubset` instead. */
    dynamicLangSubset(languages: string[] | boolean): Record<number, string>;

    /** Save subset in a file */
    saveSubset(languages: string[]): void;

    /** Return runtime information about eld. */
    info(): EldInfo;
}

/**
 * Extended API available on the dynamic entry (root) that can load datasets at runtime.
 * Static single-database entries still export `Eld` but will not provide these loader methods.
 */
interface EldWithLoader extends Eld {
    /** Load a named ngrams dataset by key (e.g. 'large') */
    load(size?: string): Promise<void | true>;

    /** @deprecated Use `load` instead. */
    loadNgrams(size?: string): Promise<void | true>;
}

/** The primary exported API object. Static entries export `eld: Eld`. The dynamic root exports `eld: EldWithLoader`. */
export const eld: Eld | EldWithLoader;
export default eld;