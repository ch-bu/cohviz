# encoding: utf-8

from nltk.corpus import wordnet as wn
from itertools import combinations, chain
import re
import spacy
from langdetect import detect


class CohesionAnalyzerEnglish:

    def __init__(self, text):
        # Get language of text
        language = detect(text.decode('utf-8'))

        # English text
        if language == 'en':
            # Load spacy
            self.nlp = spacy.load('en')
        # German text
        elif language == 'de':
            # Load spacy
            self.nlp = spacy.load('de')

        # Prepare text and remove unwanted characters
        self.text = self.nlp(text.decode('utf-8').replace('[LINEBREAK]', ''))

        # Paragraphs
        self.paragraphs = text.decode('utf-8').split('[LINEBREAK]')

        # Extract sentences
        self.sents = [sent for sent in self.text.sents]

        # Word pairs
        self.word_pairs = self._generate_nouns() + self._generate_hyponyms_hyperonyms_synonyms()

        # All concepts
        self.concepts = list(set([pair['source'] for pair in self.word_pairs] +
                       [pair['target'] for pair in self.word_pairs]))

    def _generate_nouns(self):
        """Filter all nouns from sentences and
        return list of sentences with nouns"""

        word_pairs = []

        for sentence in self.sents:
            # print(sentence)

            # for token in sentence:
            #     print (token.orth_, token.dep_)

            # Get root from sentence
            root = [w for w in sentence if w.head is w][0]

            # Get subject
            try:
                subject = [child for child in list(root.children) if any(child.dep_ in s for s in ['nsubj', 'nsubjpass'])][0]
            except IndexError:
                subject = None

            # Extract nouns from sentence
            nouns = [word for word in sentence if any(word.pos_ in s for s in ["NOUN", "PROPN"])]

            # Subject is a noun
            if subject:
                if subject.pos_ != 'PRON':
                    # Build word pairs
                    for noun in nouns:
                        # Subject should not be the noun
                        if noun.lemma_ != subject.lemma_:
                            # Append word pair
                            word_pairs.append({'source': subject.lemma_, 'target': noun.lemma_})
            # There is no subject in the sentence
            else:
                # Generate all combinations
                combs = combinations(nouns, 2)

                # Loop over every combination
                for comb in combs:
                    word_pairs.append({'source': comb[0].lemma_, 'target': comb[1].lemma_})

        return word_pairs


    def _generate_hyponyms_hyperonyms_synonyms(self):
        """Generates a word pair list of hyperonyms and
        hyponyms from a given dataset"""

        word_pairs = []

        # Loop over every sentence
        for index, sentence in enumerate(self.sents):
            # Do not loop over last sentence
            if index < (len(self.sents) - 1):

                # Get all nouns from current and next sentence
                nouns_current_sentence = [noun.lemma_ for noun in sentence if any(noun.pos_ in s for s in ['PROPN', 'NOUN'])]
                nouns_next_sentence = [noun.lemma_ for noun in self.sents[index + 1] if any(noun.pos_ in s for s in ['PROPN', 'NOUN'])]

                # Loop over every noun in current sentence
                for noun in nouns_current_sentence:
                    ###############################
                    # Get hypernyms and hyponyms
                    ###############################
                    # Get all synsets of current noun
                    synsets_current_noun = [synset for synset in wn.synsets(noun)]

                    # Get synonyms
                    synonyms = [lemma.name() for synset in synsets_current_noun for lemma in synset.lemmas()]

                    # Get all hyponyms and hyperonyms from all synsets
                    hyponyms_current_noun = [synset.hyponyms() for synset in synsets_current_noun]
                    hypernyms_current_noun = [synset.hypernyms() for synset in synsets_current_noun]

                    # Get all synsets of hyperonyms and hypernyms
                    synsets = [synset for synsets in (hyponyms_current_noun + hypernyms_current_noun) for synset in synsets]

                    # Get all lemmas
                    hypernyms_hyponyms = ([lemma.name().replace('_', ' ') for synset in synsets for lemma in synset.lemmas()])

                    ################################
                    # Connect to next sentence
                    ################################
                    sentences_shared_elements = list(set(hypernyms_hyponyms).intersection(nouns_next_sentence))
                    shared_synonym = list(set(synonyms).intersection(nouns_next_sentence))

                    # There are hyponyms and hypernyms
                    if len(sentences_shared_elements) > 0:
                        print(hypernyms_hyponyms)
                        # print(sentences_share_element)
                        for shared_element in sentences_shared_elements:
                            word_pairs.append({'source': noun, 'target': shared_element})

                    # There are synonyms
                    if len(shared_synonym) > 0:
                        print(synonyms)
                        for synonym in shared_synonym:
                            word_pairs.append({'source': noun, 'target': synonym})

        return word_pairs


    def _calculate_number_relations(self):
        """Calculates the number of relations"""

        # Make tuples from word_pairs
        tuples = map(lambda x: (x['source'], x['target']), self.word_pairs)

        # Remove duplicates
        tuples = list(set([(pair[0], pair[1])
            for pair in tuples if pair[0] != pair[1]]))

        return len(tuples)


    def _get_clusters(self):
        """Calculates the number of computed
        clusters"""

        # If we only have one sentence return word pairs
        # as single cluster
        if len(self.sents) == 1:
            return self.word_pairs

        # Initialize clusters. The cluster
        # later stores all clusters as a list containing
        # the word pair dictionaries
        clusters = []

        # Store all words that have already been
        # assigned to a cluster
        assigned_words = []

        # Loop over every word pair
        for num in range(0, len(self.word_pairs)):
            # Store all words that are stored in the current cluster
            current_word_pair = [self.word_pairs[num]['source'],
                    self.word_pairs[num]['target']]

            # Only assign a new cluster if the current word pair has
            # not already been processed
            if (not bool(set(current_word_pair) & set(assigned_words))):
                # Init current cluster
                current_cluster = [self.word_pairs[num]]

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
                    for num_again in range(0, len(self.word_pairs)):
                        # Word pairs do not match
                        if num_again not in index_pairs_added:
                            # Store both words of current pair in list
                            iter_word_pair = [self.word_pairs[num_again]['source'],
                                    self. word_pairs[num_again]['target']]

                            # Lemmas in current cluster
                            current_cluster_lemma_source = map(lambda x: x['source'], current_cluster)
                            current_cluster_lemma_target = map(lambda x: x['target'], current_cluster)

                            # Get all words in current cluster
                            current_cluster_lemma = current_cluster_lemma_source + \
                                        current_cluster_lemma_target

                            # Both pairs share an element
                            shared_element = bool(set(current_cluster_lemma) & set(iter_word_pair))

                            # If they share an element append to current cluster
                            if shared_element:
                                # Append pair to current cluster
                                current_cluster.append(self.word_pairs[num_again])

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


    def _get_word_cluster_index(self, cluster):
        """Generate a dictionary that
        has the words as key and the cluster number
        as value"""

        # When clusters are calculated assign them to the word_pairs as
        # an additional value
        word_cluster_index = {}

        # Loop over every cluster
        for index, single_cluster in enumerate(cluster):
            # Get words for current cluster
            source_words = map(lambda x: x['source'], single_cluster)
            target_words = map(lambda x: x['target'], single_cluster)

            # Concatenate sources and targets in to one array
            words = source_words + target_words

            # Assign index to word_cluster_index dict
            for word in words:
                word_cluster_index[word] = index

        return word_cluster_index


    def _get_lemma_word_mapping(self, nodes):
        """Returns a dictionary with the lemma as key and the
        inflected words as values"""

        # Init mapping
        mapping = {}

        # Loop over every word in text
        for token in self.text:
            # Word is part of nodes for visualization
            if token.lemma_ in nodes:
                # We have already assigned this word to a key
                if token.lemma_ in mapping:
                    # Avoid duplicates
                    if token.orth_ not in mapping[token.lemma_]:
                        mapping[token.lemma_].append(token.orth_)
                # This word is knew, let's start a knew key
                else:
                    mapping[token.lemma_] = [token.orth_]

        return mapping


    def _get_word_lemma_mapping(self, nodes):
        """Returns a dictionary with the word as a key
        and the lemma as a value"""

        mapping = {}

        # Loop over every word in text
        for token in self.text:
            # Word ist part of nodes for visualization
            if token.lemma_ in nodes:
                # We have already assigned this word to a key
                if token.orth_ in mapping:
                    # Avoid duplicates
                    if token.lemma_ not in mapping[token.orth_]:
                        mapping[token.orth_].append(token.lemma_)
                # This word is knew, let's start a knew key
                else:
                    mapping[token.orth_] = [token.lemma_]

        return mapping


    def _get_html_string(self, word_lemma_mapping, word_cluster_index):
        """Generates an html string with spans for each word in order
        to signal the mapping between visualization and text

        Args:
            word_lemma_mapping (dict) - A dict with words as key and lemmas as values
            word_cluster_index (dict) - Words as key and int of cluster as value

        Returns:
            String - An html formatted string
        """

        html_string = '';

        for paragraph in self.paragraphs:
            #######################################
            # Render text for integrated group
            #######################################

            # Split text into sentences
            tokens = self.nlp(paragraph)
            tokenized_sentences = [sent for sent in tokens.sents]

            # for sentence in tokenized_sentences:
            #     print sentence.orth_.split()

            # Split words within sentences
            words_split_per_sentence = [sentence.orth_.split() for sentence in tokenized_sentences]

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
                        lemma = word_lemma_mapping[word][0]

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
                            lemma = word_lemma_mapping[word][0]

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


    def get_data_for_visualization(self):
        """Get all data for get_data for visualization"""

        # Get clusters
        cluster = self._get_clusters()

        # Create dictionary of words and it's corresponding clusters
        word_cluster_index = self._get_word_cluster_index(cluster)

        # Get unique nodes
        nodes = map(lambda x: [x['source'], x['target']], self.word_pairs)
        nodes_list = list(set(list(chain(*nodes))))
        nodes_dict = [{'id': word, 'index': ind} for ind, word, in enumerate(nodes_list)]

        # Generate dict with lemma as key and orth as value
        lemma_word_mapping = self._get_lemma_word_mapping(nodes_list)

        # Generate dict with orth as key and lemma as value
        word_lemma_mapping = self._get_word_lemma_mapping(nodes_list)

        # Generate html string
        html_string = self._get_html_string(word_lemma_mapping, word_cluster_index)


        return {'links': self.word_pairs,
                'nodes': nodes_dict,
                'numSentences': len(self.sents),
                'numConcepts': len(nodes),
                'clusters': cluster,
                'lemmaWordRelations': lemma_word_mapping,
                'wordLemmaRelations': word_lemma_mapping,
                'numRelations': self._calculate_number_relations(),
                'numCluster': len(cluster),
                'numSentences': len(self.sents),
                'numConcepts': len(self.concepts),
                'wordClusterIndex': word_cluster_index,
                'html_string': html_string}
