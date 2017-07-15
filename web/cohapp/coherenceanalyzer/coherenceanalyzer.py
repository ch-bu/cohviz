# encoding: utf-8

import os
import re
import constants
import subprocess
from pandas import DataFrame
import numpy as np
from pygermanet import load_germanet
from more_itertools import unique_everseen
from nltk.stem.snowball import GermanStemmer
from nltk.tokenize import sent_tokenize
import itertools


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
                    words_next_sentence = [wordNext
                        for wordNext in sentences[val + 1] if wordNext['noun']]

                    # Get nouns of current sentence
                    word_this_sentence = [wordThis for wordThis in sentences[val]
                        if wordThis['noun']]

                    # Get nouns of next sentence in array
                    nouns_next_sentence = map(lambda x: x['lemma'], words_next_sentence)

                    # Find common elements in hypos and next sentence
                    intersections_hypo = list(set(hypos).intersection(nouns_next_sentence))

                    # Find common elements in hypos and next sentence
                    intersections_hyper = list(set(hypers).intersection(nouns_next_sentence))

                    # Loop over every intersections and append
                    for intersection in intersections_hypo:
                        if intersection != word['orth']:
                            # Get full target word of intersection
                            targetWord = filter(lambda x: x['lemma']
                                == intersection, words_next_sentence)[0]

                            # Append
                            wordPairs.append({'source': {'word': word['orth'],
                                'lemma': word['lemma'], 'sentence': val},
                                'target': {'word': targetWord['orth'],
                                'lemma': targetWord['lemma'], 'sentence': val + 1},
                                'device': 'hyponym'})

                    # Loop over every intersections and append
                    for intersection in intersections_hyper:
                        if intersection != word['orth']:
                            # Get full target word of intersection
                            targetWord = filter(lambda x: x['lemma']
                                == intersection, words_next_sentence)[0]

                            # Append
                            wordPairs.append({'source': {'word': word['orth'],
                                'lemma': word['lemma'], 'sentence': val},
                                'target': {'word': targetWord['orth'],
                                'lemma': targetWord['lemma'], 'sentence': val + 1},
                                'device': 'hypernym'})

    return wordPairs


def get_clusters(word_pairs, sentences):
    """Calculates the number of computed
    clusters"""

    # If we only have one sentence return word pairs
    # as single cluster
    if len(sentences) == 1:
        return word_pairs

    # Initialize clusters. The cluster
    # later stores all clusters as a list containing
    # the word pair dictionaries
    clusters = []

    # Store all words that have already been
    # assigned to a cluster
    assigned_words = []

    # Loop over every word pair
    for num in range(0, len(word_pairs)):
        # Store all words that are stored in the current cluster
        current_word_pair = [word_pairs[num]['source']['lemma'],
                word_pairs[num]['target']['lemma']]

        # Only assign a new cluster if the current word pair has
        # not already been processed
        if (not bool(set(current_word_pair) & set(assigned_words))):
            # Init current cluster
            current_cluster = [word_pairs[num]]

            # Remember that we already added the words of the current cluster
            assigned_words.append(current_word_pair[0])
            assigned_words.append(current_word_pair[1])

            # Index of word_pair we already added to current cluster.
            # We store the index to reduce the computation. If we already
            # added an index to the current cluster, there is no need
            # to look at it again
            index_pairs_added = [num]

            # Found set to true for while loop
            found = True

            # As long as we still find connections keep on looping
            while found:
                # Found set to false
                found = False

                # Loop over every word pair again
                for num_again in range(0, len(word_pairs)):
                    # Word pairs do not match
                    if num_again not in index_pairs_added:
                        # Store both words of current pair in list
                        iter_word_pair = [word_pairs[num_again]['source']['lemma'],
                                 word_pairs[num_again]['target']['lemma']]

                        # Lemmas in current cluster
                        current_cluster_lemma_source = map(lambda x: x['source']['lemma'], current_cluster)
                        current_cluster_lemma_target = map(lambda x: x['target']['lemma'], current_cluster)

                        # Get all words in current cluster
                        current_cluster_lemma = current_cluster_lemma_source + \
                                    current_cluster_lemma_target

                        # Both pairs share an element
                        shared_element = bool(set(current_cluster_lemma) & set(iter_word_pair))

                        # If they share an element append to current cluster
                        if shared_element:
                            # Append pair to current cluster
                            current_cluster.append(word_pairs[num_again])

                            # Remember that we already appended this
                            # pair to the current cluster
                            index_pairs_added.append(num_again)

                            # Add word pair that belongs to current cluster
                            # to list of assigned word pairs. By doing this
                            # we know if a word has already been assigned
                            # to a cluster.
                            assigned_words.append(iter_word_pair[0])
                            assigned_words.append(iter_word_pair[1])

                            # We found a candidate. When we found a connection
                            # a new word might be added to the current
                            # cluster. Therefore we have too loop over
                            # every word pair again to see if we
                            # missed a connection with the new word
                            found = True

            # Append current cluster to all clusters
            clusters.append(current_cluster)

    return clusters


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
    data = DataFrame.from_csv(dir_path + '/data/compounds.txt', sep='\t', index_col=None,
        encoding='utf-8')

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
                        # Get nouns and words of next sentence
                        words_next_sentence = filter(lambda x: x['noun'],
                                sentences[val + 1])
                        nouns_next_sentence = map(lambda x: x['lemma'],
                                words_next_sentence)

                        # Head is in next sentence
                        if head in nouns_next_sentence:
                            # Get index of head in next sentence
                            index_next_sentence = nouns_next_sentence.index(head)

                            # Append to list
                            wordPairs.append({'source': {'word': word['orth'],
                                'lemma': word['lemma'], 'sentence': val},
                                'target': {'word': words_next_sentence[index_next_sentence]['orth'],
                                'lemma': words_next_sentence[index_next_sentence]['lemma'], 'sentence': val + 1},
                                'device': 'compound subordination'})

                    # Make sure that I do not append a word pair
                    # that links the first and the last sentence.
                    # Only link wordpairs within the text.
                    if (val -1) > -1:
                        # Get nouns of previous sentence
                        # nouns_previous_sentence = [wordNext['lemma']
                        #     for wordNext in sentences[val - 1]
                        #         if wordNext['noun']]
                        words_previous_sentence = filter(lambda x: x['noun'],
                                sentences[val - 1])
                        nouns_previous_sentence = map(lambda x: x['lemma'],
                                words_previous_sentence)

                        # Head occurs in previous sentence
                        if head in nouns_previous_sentence:
                            # Get index of head in next sentence
                            index_previous_sentence = nouns_previous_sentence.index(head)

                            # Append to list
                            wordPairs.append({'source': {'word':
                                    words_previous_sentence[index_previous_sentence]['orth'],
                                'lemma': words_previous_sentence[index_previous_sentence]['lemma'], 'sentence': val -1},
                                'target': {'word': word['orth'],
                                'lemma': word['lemma'], 'sentence': val},
                                'device': 'compound superordination'})

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

            # Nouns in next sentence
            nouns_next_sentence = [word['lemma'] for word in sentences[val + 1]
                if word['noun']]

            # Nouns of current sentence
            words_current_sentence = [word for word in sentence
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
                    corresponding_word = sentences[val + 1][index_word_next_sentence]

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
                            for wordCurrent in words_current_sentence:
                                # Append to list
                                word_pairs.append({'source': {'word': corresponding_word['orth'],
                                    'lemma': corresponding_word['lemma'], 'sentence': val},
                                    'target': {'word': wordCurrent['orth'],
                                    'lemma': wordCurrent['lemma'], 'sentence': val + 1},
                                    'device': 'verb noun relation'})

                        # Current word is noun and corresponding word is
                        # verb
                        elif word['noun'] and dict_next['verb']:
                            # Get all combinations of of noun in this sentence
                            # with nouns in next sentence
                            for wordNext in sentences[val + 1]:
                                # Do not use stupid 'sein'
                                if wordNext['noun']:
                                    # Append to list
                                    word_pairs.append({'source': {'word': word['orth'],
                                        'lemma': word['lemma'], 'sentence': val},
                                        'target': {'word': wordNext['orth'],
                                        'lemma': wordNext['lemma'], 'sentence': val + 1},
                                        'device': 'noun verb relation'})

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
                        word_parent = current_sentence[anaphor_parent]

                        # Loop over every noun in next sentence
                        for noun_next in nouns_next_sentence:
                            # Append
                            word_pairs.append({'source': {'word': word_parent['orth'],
                                'lemma': word_parent['lemma'], 'sentence': val},
                                'target': {'word': noun_next['orth'],
                                'lemma': noun_next['lemma'], 'sentence': val + 1},
                                'device': 'coreference'})

    return word_pairs


def calc_local_cohesion(word_pairs, sentences):
    """Calculates local cohesion
    by a probability score between 0 and 1.
    1 indicates a fully local coherent text.

    Args:
        word_pairs (dict) - All word pairs of text
        sentences (Array) - List of all sentences

    Return:
        Float - Local cohesion of text
    """

    # Get all connections also within sentences
    connections = list(set(map(lambda x: (x['source']['sentence'],
        x['target']['sentence']), word_pairs)))

    # Loop over every sentence
    # We need to count the sentences that overlap by argument
    # overlap
    for val, sentence in enumerate(sentences):
        # Do not loop over last sentence
        if val != (len(sentences) - 1):

            lemmas_current_sentence = [word['lemma'] for word in sentence
                    if word['noun']]

            lemmas_next_sentence = [word['lemma'] for word in sentences[val + 1]
                    if word['noun']]

            if bool(set(lemmas_current_sentence) & set(lemmas_next_sentence)):
                connections.append((val, val + 1))

    # Get all connections between sentences
    connections_between = list(set(filter(lambda x: x[0] != x[1], connections)))

    # If we only have one sentence there is no point in calculating
    # local cohesion. Check if zero division error occurs
    try:
        # Return local cohesion
        local_cohesion = float(len(connections_between)) / (len(sentences) - 1)
    except ZeroDivisionError:
        return {'local_cohesion': None,
                'cohSentences': None,
                'cohNotSentences': None}

    # Number of coherent sentences
    num_coh_sentences = len(connections_between)

    # Number of non-coherent sentences
    num_non_coh_sentences = (len(sentences) - 1) - num_coh_sentences

    return {'local_cohesion': local_cohesion,
            'cohSentences': num_coh_sentences,
            'cohNotSentences': num_non_coh_sentences}


def get_lemma_mapping(word_pairs):
    """Get a dictionary that stores all orthographic
    forms for a lemma.

    Args:
        word_pairs (Array) - a list of all word_pairs

    Returns:
        Dictionary - All lemma - word combinations
    """

    # Initialize dictionaries that hold the
    # mapping of a lemma to a word or of a word to a lemma
    lemma_word_dic = {}
    word_lemma_dic = {}

    # Loop over every word pair
    for pair in word_pairs:
        # Temporary store source and target
        # of current word pair
        source = pair['source']
        target = pair['target']

        # Attach each mapping of lemma and corresponding
        # word. Later we calculate the set
        if lemma_word_dic.get(source['lemma']):
            lemma_word_dic[source['lemma']].append(source['word'])
        else:
            lemma_word_dic[source['lemma']] = [source['word']]

        # Add target
        if lemma_word_dic.get(target['lemma']):
            lemma_word_dic[target['lemma']].append(target['word'])
        else:
            lemma_word_dic[target['lemma']] = [target['word']]

        # Attach each mapping of word and corresponding
        # lemma. Later we calculate the set
        if word_lemma_dic.get(source['word']):
            word_lemma_dic[source['word']].append(source['lemma'])
        else:
            word_lemma_dic[source['word']] = [source['lemma']]

        if word_lemma_dic.get(target['word']):
            word_lemma_dic[target['word']].append(target['lemma'])
        else:
            word_lemma_dic[target['word']] = [target['lemma']]

    # Build lemma dic without redundant words
    lemma_word_dic_non_redundant = {}
    word_lemma_dic_non_redundant = {}

    # Build sets of both dictionaries
    for field, words in lemma_word_dic.items():
        lemma_word_dic_non_redundant[field] = list(set(words))

    for field, words in word_lemma_dic.items():
        word_lemma_dic_non_redundant[field] = list(set(words))

    return {'lemma_word': lemma_word_dic_non_redundant,
            'word_lemma': word_lemma_dic_non_redundant}


def generateHTML(paragraph_split, word_lemma_mapping, word_cluster_index):
    """Generates the html for the editor
    """

    html_string = '';

    for paragraph in paragraph_split:
        #######################################
        # Render text for integrated group
        #######################################

        # Split text into sentences
        tokenized_sentences = sent_tokenize(paragraph.decode('utf-8'))

        # Split words within sentences
        words_split_per_sentence = [sentence.split() for sentence in tokenized_sentences]

        # Prepare html string
        paragraph_string = '<p>'

        # Loop over every sentence
        for index, sentence in enumerate(words_split_per_sentence):
            # Store cluster uf current sentence
            cluster_current = []

            # Store the end of line character
            # We need to store the character to append it
            # afterwards
            end_of_line_character = sentence[-1][-1]

            # Remove end of line characters
            words = [re.sub(r'[.\!?]', '', s) for s in sentence]

            # Loop over every word in current sentence
            for word in words:
                # We need to reset the carrier for every word otherwise
                # every word will be appended with the carrier
                carrier = None

                # Check if word ends with a special character
                if word.endswith(':') or word.endswith(',') or word.endswith(';'):
                    carrier = word[-1]
                    word = re.sub(r'[:,;]', '', word)

                # Check if there is a lemma for current word and catch
                # any KeyError
                try:
                    # Get lemma for word
                    lemma = word_lemma_mapping['word_lemma'][word][0]

                    # Get cluster number for word
                    cluster_of_word = word_cluster_index[lemma]

                    # Push cluster ot current cluster list
                    cluster_current.append(cluster_of_word)

                    # Append html string with span tag and according class
                    paragraph_string += '<span class="cluster-' + str(cluster_of_word) + '">' + word + '</span>'

                # The word does not occur in the word lemma dicitonary
                # It should not be assigned a class for highlighting
                except KeyError:
                    paragraph_string += '<span>' + word + '</span>'

                # Append carrier if it exists
                paragraph_string += carrier if carrier else ''
                paragraph_string += ' '

            ############################################################
            # Check if cluster changes for next sentence
            ############################################################
            if index != (len(words_split_per_sentence) - 1) \
                    and len(tokenized_sentences) > 1:
                # Get words for next sentence
                words_next_sentence = [re.sub(r'[.\!?]', '', s) for s in words_split_per_sentence[index + 1]]

                # Initialize cluster of next sentence
                cluster_next = []

                for word in words_next_sentence:
                    # Catch errors
                    try:
                        lemma = word_lemma_mapping['word_lemma'][word][0]

                        cluster_of_word_next_sentence = word_cluster_index[lemma]

                        cluster_next.append(cluster_of_word_next_sentence)
                    except KeyError:
                        pass

            # If we only have one sentence append only the end of line character
            if len(tokenized_sentences) <= 1:
                paragraph_string = paragraph_string[:-1]
                paragraph_string += end_of_line_character
                paragraph_string += ' '
            # We have more than one sentence
            else:
                # See if cluster of adjacent sentence differ
                cluster_changed = set(cluster_current) != set(cluster_next)

                # Append end of line character and add an empty space.
                # The empty space is necessary otherwise the next sentence
                # will directly align to the current sentence
                paragraph_string = paragraph_string[:-1]
                paragraph_string += end_of_line_character
                paragraph_string += '&#8660; ' if cluster_changed else ''
                paragraph_string += ' '

        # End paragraph
        paragraph_string += '</p>'

        html_string += paragraph_string

    return html_string


def analyzeTextCohesion(text):
    """Analyzed the cohesion of a txt.
    Args:
        text (String) - A string that is Analyzed
    Returns:
        Array - An array of word pairs
    """

    # Check if text is string or unicode
    # if type(text) is not str:
    #     raise TypeError('you did not pass a string as argument')
    #

    # Remove percent sign
    text = re.sub(r'%', '', text)
    text = re.sub(r'“', '', text)
    text = re.sub(r'–', '', text)
    text = re.sub(r'„', '', text)
    text = re.sub(r'ca\.', '', text)
    text = re.sub(r'Dr\.', 'Doktor', text)
    text = re.sub(r'St\.', 'Sankt', text)
    text = re.sub(r'bzw\.', 'beziehungsweise', text)
    text = re.sub(r'[zZ]\. ?[bB]\.', 'zum Beispiel', text)
    text = re.sub(r'usw\.', 'und so weiter', text)

    # Split text by line breaks
    paragraph_split = text.split('[LINEBREAK]')

    # Remove brackets and parenthesis from text
    text = re.sub(r"[\(\[].*?[\)\]]", "", text)

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
    tags = getPOSElement('accusative', r'.*N.(Reg|Name).Acc', tags)
    tags = getPOSElement('dative', r'.*N.(Reg|Name).Dat', tags)
    tags = getPOSElement('nominative', r'.*N.(Reg|Name).Nom', tags)
    tags = getPOSElement('genitive', r'.*N.(Reg|Name).Gen', tags)
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
    word_pairs = []

    # Build lexical overlap word pairs
    for val, sentence in enumerate(sentences):
        # Get all nouns
        nouns = [word['lemma'] for word in sentence if word['noun']]
        nouns_full = [word for word in sentence if word['noun']]
        nominatives = filter(lambda x: x['nominative'], sentence)

        # There is only one noun in the current sentence
        if len(nouns) == 1:
            # Append lonely noun
            word_pairs.append({'source': {'word': nouns_full[0]['orth'],
                'lemma': nouns_full[0]['lemma'], 'sentence': val},
                'target': {'word': nouns_full[0]['orth'], 'lemma': nouns_full[0]['lemma'], 'sentence': val},
                'device': 'single word'})

        # There are at least two nouns in the sentence
        elif len(nouns) > 1:
            # There is a nominative among the nouns
            if len(nominatives) > 0:
                # Loop over every combination of nouns in current sentence
                for subset in itertools.combinations_with_replacement(nouns_full, 2):
                    if subset[0] != subset[1]:
                        # Check if first word is nominative
                        if subset[0]['nominative']:
                            # Only combine nominatives with accusative, dative
                            # and genitive
                            if subset[1]['accusative'] or subset[1]['dative'] or \
                                subset[1]['genitive'] or subset[1]['nominative']:
                                # Append word pairs
                                word_pairs.append({'source': {'word': subset[0]['orth'],
                                    'lemma': subset[0]['lemma'], 'sentence': val},
                                    'target': {'word': subset[1]['orth'],
                                    'lemma': subset[1]['lemma'], 'sentence': val},
                                    'device': 'within sentence'})
                        # Check if second word is nominative
                        if subset[1]['nominative']:
                            # Only combine nominatives with accusative, dative,
                            # and genitive
                            if subset[0]['accusative'] or subset[0]['dative'] or \
                                subset[0]['genitive'] or subset[0]['nominative']:
                                # Append word pairs
                                word_pairs.append({'source': {'word': subset[1]['orth'],
                                    'lemma': subset[1]['lemma'], 'sentence': val},
                                    'target': {'word': subset[0]['orth'],
                                    'lemma': subset[0]['lemma'], 'sentence': val},
                                    'device': 'within sentence'})
            # There are no nominatives in the sentence
            else:
                # Loop over every combination of nouns in current sentence
                for subset in itertools.combinations_with_replacement(nouns_full, 2):
                    if subset[0] != subset[1]:
                        # Combine accusative with dative
                        if subset[0]['accusative'] and subset[1]['dative'] and \
                           subset[0]['genitive']:
                            # Append word pairs
                            word_pairs.append({'source': {'word': subset[0]['orth'],
                                'lemma': subset[0]['lemma'], 'sentence': val},
                                'target': {'word': subset[1]['orth'],
                                'lemma': subset[1]['lemma'], 'sentence': val},
                                'device': 'within sentence'})
                        elif subset[1]['accusative'] and subset[0]['dative'] and \
                             subset[1]['genitive']:
                            # Append word pairs
                            word_pairs.append({'source': {'word': subset[0]['orth'],
                                'lemma': subset[0]['lemma'], 'sentence': val},
                                'target': {'word': subset[1]['orth'],
                                'lemma': subset[1]['lemma'], 'sentence': val},
                                'device': 'within sentence'})


    # Get hypernym hyponym pairs
    # hyponym_hyper_pairs = []

    # Get coreference resolutions
    # coreferences = []

    # Get compounds
    # compounds = []

    # Get stem relations
    # stem_relations = []

    # Get hypernym hyponym pairs
    hyponym_hyper_pairs = getHypoHyperPairs(sentences, gn)

    # Get coreference resolutions
    coreferences = get_coreferences(sentences, gn)

    # Get compounds
    compounds = get_compounds(sentences)

    # Get stem relations
    stem_relations = get_stem_relations(sentences, gn)

    # Merge all word pairs
    word_pairs = word_pairs + hyponym_hyper_pairs + coreferences + compounds + \
        stem_relations

    ######################################
    # Calculate number of relations
    ######################################

    word_tuples = map(lambda x: (x['source']['lemma'], x['target']['lemma']), word_pairs)
    word_tuples = list(set([(pair['source']['lemma'], pair['target']['lemma'])
        for pair in word_pairs if pair['source']['lemma'] != pair['target']['lemma']]))

    # Calc number of sentences
    num_sentences = len(sentences)

    # Calculate local cohesion
    local_cohesion = calc_local_cohesion(word_pairs, sentences)

    # Calculate clusters
    cluster = get_clusters(word_pairs, sentences)

    # When clusters are calculated assign them to the word_pairs as
    # an additional value
    word_cluster_index = {}
    for index, single_cluster in enumerate(cluster):
        # Get words for current cluster
        source_words = map(lambda x: x['source']['lemma'], single_cluster)
        target_words = map(lambda x: x['target']['lemma'], single_cluster)

        # Concatenate sources and targets in to one array
        words = source_words + target_words

        # Assign index to word_cluster_index dict
        for word in words:
            word_cluster_index[word] = index

    # Now that we have the indexes for each cluster we can assign the index
    # to the word_pairs
    for word_pair in word_pairs:
        word_pair['cluster'] = word_cluster_index[word_pair['source']['lemma']]

    # Get dictionary of orthographic forms of all lemmas
    word_lemma_mapping = get_lemma_mapping(word_pairs)

    # Prepare data for frontend
    links = [{'source': pair['source']['lemma'],
              'target': pair['target']['lemma'],
              'device': pair['device'],
              'cluster': pair['cluster']} for pair in word_pairs]
    nodes = [{'id': word,'index': ind} for ind, word in enumerate(word_lemma_mapping['lemma_word'])]

    # Get number of concepts
    num_concepts = len(set([concept['lemma']
                for concept in tags if concept['noun'] == True]))

    # Generate html string for editor
    html_string = generateHTML(paragraph_split, word_lemma_mapping, word_cluster_index)

    return {'word_pairs': word_pairs,
            'links': links,
            'nodes': nodes,
            'numSentences': num_sentences,
            'numConcepts': num_concepts,
            'clusters': cluster,
            'numRelations': len(word_tuples),
            'numCluster': len(cluster),
            'local cohesion': local_cohesion['local_cohesion'],
            'cohSentences': local_cohesion['cohSentences'],
            'cohNotSentences': local_cohesion['cohNotSentences'],
            'lemmaWordRelations': word_lemma_mapping['lemma_word'],
            'wordLemmaRelations': word_lemma_mapping['word_lemma'],
            'wordClusterIndex': word_cluster_index,
            'numCompounds': len(compounds),
            'numCoreferences': len(coreferences),
            'numStemRelations': len(stem_relations),
            'numHypoHyper': len(hyponym_hyper_pairs),
            'html_string': html_string}
