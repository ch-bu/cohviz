var initialState = {
    // Draft
    'text': null,
    'clusters': null,
    'cohNotSentences': null,
    'cohSentences': null,
    'html_string': null,
    'lemmaWordRelations': null,
    'links': null,
    'local cohesion': null,
    'nodes': null,
    'numCluster': null,
    'numConcepts': null,
    'numCoreferences': null,
    'numHypoHypo': null,
    'numRelations': null,
    'numSentences': null,
    'numStemRelations': null,
    'wordClusterIndex': null,
    'wordLemmaRelations': null,
    'word_pairs': null,
    'loading': null
};

export default function reducer(state=initialState, action) {
  switch(action.type) {
    case "ANALYZE_TEXT": {
      return state;
    }
  }

  return state;
}
