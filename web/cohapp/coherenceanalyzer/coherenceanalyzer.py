# encoding: utf-8

import os
import re
import constants
import subprocess
from pandas import DataFrame
import numpy as np
from pygermanet import load_germanet
from more_itertools import unique_everseen
from nltk.corpus import stopwords # We might need to remove this line
from nltk.stem.snowball import GermanStemmer
import itertools
# from pymongo import MongoClient


# def nounify(verb_word):
#     """ Transform a verb to the closest noun: die -> death """

#     gn = load_germanet()

#     verb_synsets = gn.synsets(gn.lemmatise(verb_word)[0], pos="v")

#     # Word not found
#     if not verb_synsets:
#         return []

#     # Get all verb lemmas of the word
#     verb_lemmas = [l.orthForm for s in verb_synsets for l in s.lemmas]

#     # verb_lemmas = [l for s in verb_synsets \
#     #                for l in s.lemmas if s.name.split('.')[1] == 'v']
#     # print(verb_lemmas)

#     print(gn.synsets('Haus')[0].lemmas[0].rels())
#     # Get related forms
#     # derivationally_related_forms = [(l, l.derivationally_related_forms()) \
#     #                                 for l in verb_lemmas]

#     # # filter only the nouns
#     # related_noun_lemmas = [l for drf in derivationally_related_forms \
#     #                        for l in drf[1] if l.synset.name.split('.')[1] == 'n']

#     # # Extract the words from the lemmas
#     # words = [l.name for l in related_noun_lemmas]
#     # len_words = len(words)

#     # # Build the result in the form of a list containing tuples (word, probability)
#     # result = [(w, float(words.count(w))/len_words) for w in set(words)]
#     # result.sort(key=lambda w: -w[1])

#     # return all the possibilities sorted by probability
#     return None

# # print(nounify('arbeitet'))

def getPOSElement(element, regex, tags):
    """Returns an array with a boolean
    value of the specified element.
    If element exists, element is true.

    Args:
        element (String) - Element to be extracted
        regex (reg)      - Regular Expression
        tags (Array)     - List of word dictionaries
    Returns:
        Array of text elements
    """

    return [dict(tag.items() + {element: bool(re.match(regex,
        tag['pos']))}.items()) for tag in tags]


def getHypoHyperPairs(sentences, gn):
    """Generates all hyponmys and hypernyms of
    a list of nouns

    Returns:
        Array of hyponyms in lemma form
    """

    wordPairs = []

    for val, sentence in enumerate(sentences):

        if val != (len(sentences) - 1):
            for word in sentences[val]:
                if word['noun'] is True:
                    # Init variables
                    hypos = []
                    hypers = []

                    # Get all synsets of current word
                    synsets = gn.synsets(word['lemma'])

                    # Get all hyponyms of current word and append
                    for synset in synsets:
                        # Hyponyms
                        for hypo in synset.hyponyms:
                            for lemma in hypo.lemmas:
                                hypos.append(lemma.orthForm)
                        # Hypernyms
                        for hyper in synset.hypernyms:
                            for lemma in hyper.lemmas:
                                hypers.append(lemma.orthForm)

                    # Get next sentence
                    nextSentence = [wordNext['lemma']
                        for wordNext in sentences[val + 1] if wordNext['noun']]

                    # Get nouns of current sentence
                    sentence = [wordThis['lemma'] for wordThis in sentences[val]
                        if wordThis['noun']]

                    # Find common elements in hypos and next sentence
                    intersections_hypo = list(set(hypos).intersection(nextSentence))

                    # Find common elements in hypos and next sentence
                    intersections_hyper = list(set(hypers).intersection(nextSentence))

                    # Loop over every intersections and append
                    for intersection in intersections_hypo:
                        if intersection != word['orth']:
                            wordPairs.append([word['lemma'], intersection,
                                'hyponym'])

                    # Loop over every intersections and append
                    for intersection in intersections_hyper:
                        if intersection != word['orth']:
                            wordPairs.append([word['lemma'], intersection,
                                'hypernym'])

    return wordPairs


def get_clusters(word_pairs):
    """Calculates the number of computed
    clusters"""

    # Initialize clusters
    clusters = []
    tempClusters = []
    found = True
    pairs = word_pairs

    # Loop over every word pair
    for num in range(0, len(pairs)):
        # Get link data
        source = pairs[num][0]
        target = pairs[num][1]

        # Temporary list
        tempClusters = [source, target]

        # Found set to true for while loop
        found = True

        while found:
            # Found set to false
            found = False

            # Loop over every word pair again
            for num_again in range(0, len(pairs)):
                # Word pairs do not match
                if num != num_again:

                    # Initialize temporary source and target
                    tempSource = pairs[num_again][0]
                    tempTarget = pairs[num_again][1]

                    # Temporary array
                    tempArray = [tempSource, tempTarget]

                    # Temporary sources and targets in array position
                    tempPosSource = tempSource in tempClusters
                    tempPosTarget = tempTarget in tempClusters

                    # Either of the two in in tempClusters
                    if tempPosSource or tempPosTarget:
                        # TempSource is in tempClusters
                        if not tempPosTarget:
                            found = True
                            tempClusters.append(tempTarget)

                    # Temp Target is in tempClusters
                    if tempPosTarget:
                        # TempSource is not in tempClusters
                        if not tempPosSource:
                            found = True
                            tempClusters.append(tempSource)

        # Remove duplicates from tempClusters
        tempClusters = list(unique_everseen(tempClusters))

        clusterIn = False

        # Clusters has at least one element
        if len(clusters) > 0:
            # Loop over every cluster
            for cluster in range(0, len(clusters)):
                # Current Cluster
                currentCluster = clusters[cluster]

                # Loop over every element in tempClusters
                for c in range(0, len(tempClusters)):
                    if tempClusters[c] in currentCluster:
                        clusterIn = True
                        break

            # tempClusters does not exist yet in clusters
            if not clusterIn:
                clusters.append(tempClusters)

        # Clusters is empty
        else:
            clusters.append(tempClusters)

    return len(clusters)


def get_compounds(sentences):
    """If there is a compound
    between sentences add these
    as word pairs.

    Returns
        Array of compounds
    """

    # Dirname
    dir_path = os.path.dirname(os.path.realpath(__file__))

    # Read data
    data = DataFrame.from_csv(dir_path + '/data/compounds.txt', sep='\t',
        index_col=None, encoding='utf-8')

    # Init word pairs
    wordPairs = []

    # Loop over every sentence
    for val, sentence in enumerate(sentences):
        # Loop over every word in current sentence
        for word in sentences[val]:
            if word['noun'] is True:
                # Get nouns of current sentence
                nouns_current_sentence = [wordThis['lemma']
                    for wordThis in sentences[val] if wordThis['noun']]

                # Check if noun is in compound list
                word_in_list = data['compound'].str.match(r''
                    + word['lemma'] + r'$')

                # Current word has been found
                # in the compound list
                if word_in_list.any():
                    # Get index of word
                    word_index = np.where(word_in_list)[0][0]

                    # Get head of compound
                    head = data['head'].where(data['compound'] ==
                        word['lemma'], np.nan).max()

                    # Is current sentence not the last
                    # sentence? This is important, otherwise
                    # we would compare the compound to a head
                    # in a sentence that doesn't exist.
                    if val != (len(sentences) - 1):
                        # Get nouns of current next sentence
                        nouns_next_sentence = [wordNext['lemma']
                            for wordNext in sentences[val + 1]
                                if wordNext['noun']]

                        # Head is in next sentence
                        if head in nouns_next_sentence:
                            # Get compound word
                            compound = data['compound'][word_index]

                            # Get index of head in next sentence
                            index_next_sentence = nouns_next_sentence.index(head)

                            # Append to list
                            wordPairs.append([compound,
                                nouns_next_sentence[index_next_sentence],
                                    'compound'])

                    # Make sure that I do not append a word pair
                    # that links the first and the last sentence.
                    # Only link wordpairs within the text.
                    if (val -1) > -1:
                        # Get nouns of previous sentence
                        nouns_previous_sentence = [wordNext['lemma']
                            for wordNext in sentences[val - 1]
                                if wordNext['noun']]

                        # Head occurs in previous sentence
                        if head in nouns_previous_sentence:
                            # Get compound word
                            compound = data['compound'][word_index]

                            # Get index of head in next sentence
                            index_previous_sentence = nouns_previous_sentence.index(head)

                            # Append to list
                            wordPairs.append([compound,
                                nouns_previous_sentence[index_previous_sentence],
                                    'compound'])

    return wordPairs


def get_stem_relations(sentences, gn):
    """Gets verb-noun relations
    between two sentences.

    Returns
        Array of word-pairs between two sentences
    """

    # Init word pairs
    word_pairs = []

    # Init stemmer
    stemmer = GermanStemmer(ignore_stopwords=True)

    # Loop over every sentence
    for val, sentence in enumerate(sentences):
        # Is current sentence not the last
        # sentence? If so carry on
        if val != (len(sentences) - 1):
            # Get stems of all words in current sentence
            stems_next_sentence = map(lambda x: stemmer.stem(x['lemma']),
                sentences[val + 1])

            # Words next sentence
            words_next_sentence = map(lambda x: x['lemma'],
                sentences[val + 1])

            # Nouns in next sentence
            nouns_next_sentence = [word['lemma'] for word in sentences[val + 1]
                if word['noun']]

            # Nouns of current sentence
            nouns_current_sentence = [word['lemma'] for word in sentence
                if word['noun']]

            # Loop over every word in current sentece
            for word in sentences[val]:

                # Stem of current word
                stem_current_word = stemmer.stem(word['lemma'])

                # Is the stemmed word in the next sentence, great.
                # If word is a lame 'sein', ignore it
                if (stem_current_word in stems_next_sentence) and word['lemma'] != 'sein':

                    # Get index of stem that is related to current word
                    index_word_next_sentence = stems_next_sentence.index(stem_current_word)

                    # Corresponding word in next sentence
                    corresponding_word = words_next_sentence[index_word_next_sentence]

                    # Only add word pairs if verb or noun
                    if word['noun'] or word['verb']:

                        # Get dictionary of word in next sentence
                        dict_next = sentences[val + 1][index_word_next_sentence]

                        # We do not want to combine words
                        # that have the same grammatical function
                        # A noun should not be combined with a noun
                        # We are only interested in verb-noun relations
                        if word['verb'] and dict_next['noun']:
                            # Get all combinations of corresponding noun
                            # in next sentence an all nouns in current sentence
                            verb_noun_combinations = [[corresponding_word,
                                noun, 'verb-noun-relation'] for noun in
                                    nouns_current_sentence]

                            # Append to word pairs
                            word_pairs = word_pairs + verb_noun_combinations

                        # Current word is noun and corresponding word is
                        # verb
                        elif word['noun'] and dict_next['verb']:
                            # Get all combinations of noun in this sentence
                            # and all nouns in next sentence
                            noun_verb_combinations = [[word['lemma'], noun,
                                'verb-noun-relation'] for noun in
                                    nouns_next_sentence]

                            # Append to word pairs
                            word_pairs = word_pairs + noun_verb_combinations

    return word_pairs



def get_coreferences(sentences, gn):
    """Extracts all unambigous
    coreferences

    Args:
        sentences (Array) - all sentences of the text
        gn (Object)       - pygermanet object

    Returns:
        Array of of pronoun and noun pairs
    """

    word_pairs = []

    # Loop over every sentence
    for val, sentence in enumerate(sentences):

        # Do not analyze last sentence
        if val != (len(sentences) - 1):

            # Get nouns and pronouns of current and next sentence
            current_sentence = filter(lambda x: x['noun'], sentence)
            nouns_next_sentence = filter(lambda x: x['noun'],
                                    sentences[val + 1])
            pronouns_next_sentence = filter(lambda x: x['pronoun'],
                                    sentences[val + 1])

            # Loop over every pronoun in next sentence
            for pronoun in pronouns_next_sentence:

                # Check if gender and numerus is unique among
                # the nouns within the next sentence
                unique_next = not any([pronoun['feminin'] == noun['feminin'] and
                          pronoun['singular'] == noun['singular'] and
                          pronoun['neutrum'] == noun['neutrum']
                          for noun in nouns_next_sentence])

                if unique_next:
                    # Check if gender and numerus is unique among
                    # the nouns within the current sentence
                    unique_current = [pronoun['feminin'] == noun['feminin'] and
                              pronoun['singular'] == noun['singular'] and
                              pronoun['neutrum'] == noun['neutrum']
                              for noun in current_sentence]

                    # We found a candidate
                    if sum(unique_current) == 1:
                        # Get index of anaphor parent
                        anaphor_parent = [i for i, x in enumerate(unique_current) if x][0]

                        # Get lemma of anaphor parent
                        lemma_parent = current_sentence[anaphor_parent]['lemma']

                        # Create word pairs
                        pairs = [[lemma_parent, noun['lemma'], 'coreference']
                            for noun in nouns_next_sentence]

                        # Append pairs to word pairs
                        word_pairs = word_pairs + pairs

    return word_pairs


def analyzeTextCohesion(text):
    """Analyzed the cohesion of a txt.
    Args:
        text (String) - A string that is Analyzed
    Returns:
        Array - An array of word pairs
    """

    # Check if text is string or unicode
    if type(text) is not str:
        raise TypeError('you did not pass a string as argument')

    # Remove brackets and parenthesis from text
    text = re.sub(r"[\(\[].*?[\)\]]", "", text)

    # Substitute abbreviations
    text = re.sub('bzw.', 'beziehungsweise', text)
    text = re.sub('“', '', text)
    text = re.sub('„', '', text)

    # Remove trailing white space
    text = text.strip()

    # If text doesn't end with a dot, fill it in
    if not text[-1:] in ['.', '!', '?']:
            text += '.'

    ############################################################################
    # Tag text
    ############################################################################
    # Save text to file
    f = open(constants.temp_text, 'w')
    f.write(text)
    f.close()

    # Tokenize
    f = open(constants.temp_tokens, 'w')
    subprocess.call([constants.tokenizer, constants.temp_text], \
        stdout=f, shell=False)
    f.close()

    # Tag Tokens from temp_tokens
    f = open(constants.temp_tags, 'w')
    subprocess.call([constants.rftagger, constants.german_par, \
        constants.temp_tokens], stdout=f, shell=False)
    f.close()

    # Read tags from file
    f = open(constants.temp_tags, 'r')
    tags = f.readlines()
    f.close()

    # Split tags in array
    tags = [str.split(tag, '\t') for tag in tags]

    # Remove last entry
    # the entry is only a \n character and can
    # be ignored. It is a percularity of the
    # RFTagger
    tags.pop()

    # Remove \n from end of tag
    tags = [[tag[0].decode('utf-8'), tag[1][:-1]] for tag in tags]

    ############################################################################
    # Further processing
    ############################################################################

    # Load germanet
    gn = load_germanet()

    # Lemmatise all words
    tags = [{'orth': tag[0], 'lemma': gn.lemmatise(tag[0])[0],
               'pos': tag[1]} for tag in tags]

    # Filter only relevant tags: Verbs, Nouns, Pronouns
    regex = re.compile(
        r'.*N.Name.*|.*N.Reg.*|.*SYM.Pun.Sent.*|.*VFIN.*|.*PRO.Pers.*|.*PRO.Dem')

    # Filtered tags
    tags = [tag for tag in tags if regex.match(tag['pos']) != None]

    # Get specific elements of words
    tags = getPOSElement('singular', r'.*Sg', tags)
    tags = getPOSElement('accusative', r'.*N.Reg.Acc', tags)
    tags = getPOSElement('dative', r'.*N.Reg.Dat', tags)
    tags = getPOSElement('nominative', r'.*N.Reg.Nom', tags)
    tags = getPOSElement('genitive', r'.*N.Reg.Gen', tags)
    tags = getPOSElement('feminin', r'.*Fem', tags)
    tags = getPOSElement('neutrum', r'.*Neut', tags)
    tags = getPOSElement('noun', r'.*N.Name.*|.*N.Reg', tags)
    tags = getPOSElement('pronoun', r'.*PRO.Dem.*|.*PRO.Pers', tags)
    tags = getPOSElement('verb', r'.*VFIN', tags)

    # Get sentences
    sentences = []
    sentenceArray = []

    for word in tags:
        if word['pos'] != 'SYM.Pun.Sent':
                sentenceArray.append(word)
        else:
            sentences.append(sentenceArray)
            sentenceArray = []

    ############################################################################
    # Build word pairs
    ############################################################################

    # Init word pairs array
    wordPairs = []

    # Build lexical overlap word pairs
    for val, sentence in enumerate(sentences):
        # Get all nouns
        nouns = [word['lemma'] for word in sentence if word['noun'] == True]

        # Append noun if it only occurs once
        if len(nouns) == 1 and word['noun']:
            # Append lonely noun
            wordPairs.append([word['lemma'], word['lemma'], 'lexical overlap'])
        # If there are multiple nouns append all combinations of nouns
        elif len(nouns) > 1:
            for subset in itertools.combinations_with_replacement(nouns, 2):
                if subset[0] != subset[1]:
                    pairArray = list(subset)
                    pairArray.append('lexical overlap')
                    wordPairs.append(pairArray)

    # Get hypernym hyponym pairs
    hyponym_hyper_pairs = getHypoHyperPairs(sentences, gn)

    # Get coreference resolutions
    coreferences = get_coreferences(sentences, gn)

    # Get compounds
    compounds = get_compounds(sentences)

    # Get stem relations
    stem_relations = get_stem_relations(sentences, gn)

    # Merge all word pairs
    wordPairs = wordPairs + hyponym_hyper_pairs + coreferences + compounds + \
        stem_relations

    # Calc number of sentences
    num_sentences = len(sentences)

    # Number of clusters
    num_clusters = get_clusters(wordPairs)

    # Get number of concepts
    num_concepts = len(set([concept['lemma']
        for concept in tags if concept['noun'] == True]))

    return {'word_pairs': wordPairs,
             'numSentences': num_sentences,
             'numConcepts': num_concepts,
             'numClusters': num_clusters}

