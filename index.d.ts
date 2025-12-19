/**
 * Result object returned by the language detection
 * @interface DetectResult
 */
interface DetectResult {
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

export const eld: {
    /**
     * Identifies the natural language of a UTF-8 string
     * @param {string} text - UTF-8 text to analyze
     * @returns {DetectResult} Object containing the detected language and methods to get detailed results
     * @example
     * const result = eld.detect('Hola, cómo te llamas?');
     * console.log(result.language); // 'es'
     * console.log(result.getScores()); // {'es': 0.5, 'et': 0.2}
     * console.log(result.isReliable()); // true
     */
    detect: (text: string) => DetectResult;
};
