# encoding: utf-8

from nltk.corpus import wordnet as wn
from itertools import combinations, permutations, chain, repeat, product
from collections import Counter
import re
import spacy
import time

class CohesionAnalyzerEnglish:

    def __init__(self, nlp):

        # Save model as variable for whole class
        self.nlp = nlp

    def _preprocess_text(self, text):

        # Get paragraphs
        paragraphs = text.split('[LINEBREAK]')

        # Remove parenthesis in the whole text
        text_nlp = text.replace('[LINEBREAK]', '')
        text_nlp = re.sub("([\(\[]).*?([\)\]])", "", text_nlp)
        text_nlp = re.sub("'\"", "", text_nlp)
        text_nlp = re.sub('\n', ' ', text_nlp)

        # Prepare text and remove unwanted characters
        text = self.nlp(text_nlp)

        # Extract sentences
        sentences = [sent for sent in text.sents]

        return text_nlp, sentences, paragraphs


    def _generate_nouns(self, sentences):
        """Filter all nouns from sentences and
        return list of sentences with nouns"""

        word_pairs = []
        lemma_to_word = {}
        visword_to_word = {}
        subjects = []
        objects = []
        word_dict = {}

        def append_to_word_pairs(zero, one, device):
            """A little helper function to avoid redundancy"""
            word_pairs.append(
              {'source': zero.lemma_,
               'target': one.lemma_,
               'device': device})

        # Loop over every sentence
        for index, sentence in enumerate(sentences):
            # Get noun chunks
            noun_chunks = filter(lambda x: x.root.prob < -7,
                list(sentence.noun_chunks))

            nouns = [noun for noun in sentence if noun.pos_ in ['NOUN', 'PROP']]

            # Build dict with lemma
            for word in nouns:
                # Save exact orthographic text for mouse over
                if visword_to_word.get(word.lemma_):
                    if not word.orth_ in visword_to_word[word.lemma_]:
                        visword_to_word[word.lemma_].append(word.orth_)
                else:
                    visword_to_word[word.lemma_] = [word.orth_]

                # Save lemma to word connection
                if lemma_to_word.get(word.lemma_):
                    if not word.orth_ in lemma_to_word[word.lemma_]:
                        lemma_to_word[word.lemma_].append(word.orth_)
                else:
                    lemma_to_word[word.lemma_] = [word.orth_]

            # Get subjects
            subjects_cur = list(set([s for s in nouns
                if s.dep_ in ['nsubj', 'csubj', 'nsubjpass', 'ROOT']]))
            subjects += subjects_cur

            # Get objects
            objects_cur = [o for o in nouns
                if o.dep_ in ['dobj', 'obj', 'iobj', 'pobj', 'attr', 'conj']]
            objects += objects_cur

            # There are multiple of both
            if len(subjects_cur) > 0 and len(objects_cur) > 0:
                # Add all word pairs
                for pair in list(product(subjects_cur, objects_cur)):
                    # Append
                    append_to_word_pairs(pair[0], pair[1], 'within')
            # We only have only subject
            elif len(subjects_cur) == 1 and len(objects_cur) == 0:
                # Append
                append_to_word_pairs(subjects_cur[0], subjects_cur[0], 'within')
            # We have only one object
            elif len(subjects_cur) == 0 and len(objects_cur) == 1:
                # Append
                append_to_word_pairs(objects_cur[0], objects_cur[0], 'within')
            # We have multiple subjects
            elif len(subjects_cur) > 0 and len(objects_cur) == 0:
                # Combine word pairs
                for pair in list(combinations(subjects_cur, 2)):
                    # Append
                     append_to_word_pairs(pair[0], pair[1], 'within')
            # We have multiple objects
            elif len(subjects_cur) == 0 and len(objects_cur) > 0:
                # Combine word pairs
                for pair in list(combinations(objects_cur, 2)):
                    # Append
                     append_to_word_pairs(pair[0], pair[1], 'within')


            # Lets look at the next sentence if there is a link between the two
            if index < (len(sentences) - 1):
                ################################################
                ## Combine semantic related words
                ################################################

                # Get noun chunks of next sentence
                nouns_next = [noun for noun in sentences[index + 1] if noun.pos_ in ['NOUN', 'PROP']]

                # Combine all chunks between two sentences
                my_combinations = list(product(nouns, nouns_next))

                # Calculate similarity between pairs
                similarity_pairs = [(comb[0], comb[1], comb[0].similarity(comb[1]))
                    for comb in my_combinations]

                # We are only interested in pairs with a high similarity
                similarity_filter = filter(lambda x: x[2] > .59, similarity_pairs)

                # We have found chunks that are similar
                if len(similarity_filter) > 0:
                    # Loop over every pair and append
                    for pair in similarity_filter:
                        # Do not add pairs with same orthographie
                        if pair[0].lemma_ != pair[1].lemma_:
                            append_to_word_pairs(pair[0], pair[1], 'between')

                #####################################################
                ## Get hypernyms and hyponyms
                #####################################################

                # Loop over every noun in current sentence
                for noun in nouns:
                    ###############################
                    # Get hypernyms and hyponyms
                    ###############################
                    # Get all synsets of current noun
                    synsets_current_noun = [synset for synset in wn.synsets(noun.orth_)]

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
                    # sentences_share_element = bool(set(hypernyms_hyponyms) & set(nouns_next_sentence))
                    sentences_shared_elements = list(set(hypernyms_hyponyms).intersection(nouns_next))

                    if len(sentences_shared_elements) > 0:
                        # print(sentences_share_element)
                        for shared_element in sentences_shared_elements:
                            word_pairs.append(
                              {'source': noun,
                               'target': shared_element,
                               'device': 'between'})

        # Make set of lemma to word
        return word_pairs, subjects, objects, lemma_to_word, visword_to_word


    def _get_clusters(self, sentences, word_pairs):
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
            current_word_pair = [word_pairs[num]['source'],
                                 word_pairs[num]['target']]

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
                            iter_word_pair = [word_pairs[num_again]['source'],
                                    word_pairs[num_again]['target']]

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


    def _get_html_string(self, node_list, word_cluster_index, paragraphs, visword_to_word):
        """Generates an html string with spans for each word in order
        to signal the mapping between visualization and text

        Args:
            word_lemma_mapping (dict) - A dict with words as key and lemmas as values
            word_cluster_index (dict) - Words as key and int of cluster as value

        Returns:
            String - An html formatted string
        """

        # Init string to return
        html_string = ''

        # Loop over every paragraph in text
        for paragraph in paragraphs:
            # Start string
            html_string += '<p>'

            # Divide text into sentences
            tokens = self.nlp(paragraph)
            tokenized_sentences = [sent for sent in tokens.sents]

            # Loop over every sentence
            for index, sent in enumerate(tokenized_sentences):
                # Do not look at the last sentence
                if index != (len(tokenized_sentences) - 1):
                    # Get cluster of current sentence
                    indexes_cur_sentence = [word_cluster_index[node] for node in node_list if sent.text.find(visword_to_word[node][0]) != -1]
                    indexes_next_sentence = [word_cluster_index[node] for node in node_list if tokenized_sentences[index + 1].text.find(visword_to_word[node][0]) != -1]

                    # Get most common cluster of current sentence
                    most_common_cluster_cur = Counter(indexes_cur_sentence).most_common(1)
                    most_common_cluster_next = Counter(indexes_next_sentence).most_common(1)

                    # Get cluster for each sentence
                    cluster_cur = -1 if len(most_common_cluster_cur) == 0 else most_common_cluster_cur[0][0]
                    cluster_next = -1 if len(most_common_cluster_next) == 0 else most_common_cluster_next[0][0]

                    # Did the cluster change?
                    cluster_changed = False if cluster_cur == cluster_next else True

                    # Append sentence to string
                    # Loop over every word
                    sentence = sent.text

                    # Loop over every word we have
                    for node in node_list:
                        # The word is in the current cluster
                        if word_cluster_index[node] == cluster_cur:
                            # Loop over every possible word for word in visualization
                            for real_word in list(set(visword_to_word[node.lower()])):
                                # Change to span element
                                sentence = sentence.replace(real_word,
                                    '<span class="cluster-' +
                                    str(cluster_cur) + '">' +
                                    real_word + '</span>')

                    # Change html_string accordingly
                    html_string += sentence + ' '

                    # Add cluster change symbol
                    html_string = html_string + '&#8660; ' if cluster_changed else html_string
                # Append last sentence
                else:
                    sentence = sent.text

                    # Loop over every word we have
                    for node in node_list:
                        # The word is in the current cluster
                        if word_cluster_index[node] == cluster_next:

                            # Loop over every possible word for word in visualization
                            for real_word in list(set(visword_to_word[node.lower()])):
                                # Change to span element
                                sentence = sentence.replace(real_word,
                                    '<span class="cluster-' +
                                    str(cluster_next) + '">' +
                                    real_word + '</span>')

                    html_string += sentence

            # Finish paragraph
            html_string += '</p>'

        # Remove line breaks
        html_string = html_string.replace('\n', '')

        return html_string


    def _calculate_number_relations(self, word_pairs):
        """Calculates the number of relations"""

        # Make tuples from word_pairs
        tuples = map(lambda x: (x['source'], x['target']), word_pairs)

        # Remove duplicates
        tuples = list(set([(pair[0], pair[1])
            for pair in tuples if pair[0] != pair[1]]))

        return len(tuples)


    def get_data_for_visualization(self, text):
        """Get all data for get_data for visualization"""

        # Preprocess text
        text_nlp, sentences, paragraphs = self._preprocess_text(text)

        # Generate word pairs
        word_pairs, subjects, objects, lemma_to_word, visword_to_word \
            = self._generate_nouns(sentences)

        # Get clusters
        cluster = self._get_clusters(sentences, word_pairs)

        # Create dictionary of words and it's corresponding clusters
        word_cluster_index = self._get_word_cluster_index(cluster)

        # Calculate number of Relations
        numRelations = self._calculate_number_relations(word_pairs)

        # All concepts
        concepts = list(set([pair['source'] for pair in word_pairs] +
                       [pair['target'] for pair in word_pairs]))

        # Get unique nodes
        nodes = map(lambda x: [x['source'], x['target']], word_pairs)
        nodes_list = list(set(list(chain(*nodes))))
        nodes_dict = [{'id': word, 'index': ind} for ind, word, in enumerate(nodes_list)]

        # Generate html string
        html_string = self._get_html_string(nodes_list, word_cluster_index,
            paragraphs, visword_to_word)

        # return self.word_pairs
        return {'links': word_pairs,
                'lemmaWord': lemma_to_word,
                'nodes': nodes_dict,
                'numSentences': len(sentences),
                'numConcepts': len(nodes),
                'clusters': cluster,
                'numRelations': numRelations,
                'numCluster': len(cluster),
                'numSentences': len(sentences),
                'numConcepts': len(concepts),
                'wordClusterIndex': word_cluster_index,
                'html_string': html_string}
