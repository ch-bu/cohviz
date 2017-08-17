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
        subjects = []
        word_dict = {}

        start_time = time.time()


        for index, sentence in enumerate(sentences):
            # Get noun chunks
            noun_chunks = filter(lambda x: x.root.prob < -7, list(sentence.noun_chunks))

            # print [(token, token.root.prob) for token in noun_chunks]

            try:
                # Get first subject
                subject = [sub for sub in noun_chunks if any(sub.root.dep_ for s in ['nsubj', 'csubj', 'nsubjpass'])][0]
                # Append subject to list
                subjects.append(subject)
            except:
                subject = None

            # We only have one noun chunk
            if len(noun_chunks) == 1:
                # Add chunk to dic it not existent
                if not noun_chunks[0].root.lemma_ in word_dict:
                    word_dict[noun_chunks[0].root.lemma_] = noun_chunks[0].orth_

                # Append
                word_pairs.append(
                  {'source': word_dict[noun_chunks[0].root.lemma_],
                   'target': word_dict[noun_chunks[0].root.lemma_],
                   'device': 'within'})
            # There is a subject in the current sentence
            elif subject:
                # Subject not a pronoun
                if subject.root.pos_ != 'PRON':
                    # Combine subject with noun_chunks
                    for chunk in noun_chunks:
                        # Do not combine the same chunk
                        if chunk.orth_ != subject.orth_ \
                            and chunk.root.pos_ != 'PRON':
                            # We already stored a subject with the same root
                            if subject.root.lemma_ in word_dict:
                                # We alredy stored the noun chunk
                                if chunk.root.lemma_ in word_dict:
                                    word_pairs.append(
                                      {'source': word_dict[subject.root.lemma_],
                                       'target': word_dict[chunk.root.lemma_],
                                       'device': 'within'})
                                # The noun chunk is new to us
                                else:
                                    # Store word in dict
                                    word_dict[chunk.root.lemma_] = chunk.orth_
                                    word_pairs.append(
                                      {'source': word_dict[subject.root.lemma_],
                                       'target': chunk.orth_,
                                       'device': 'within'})
                            # We haven't stored the current subject
                            else:
                                word_dict[subject.root.lemma_] = subject.orth_
                                word_pairs.append({'source': subject.orth_,
                                                   'target': chunk.orth_,
                                                   'device': 'within'})
                # The subject is a pronoun and we have only one noun phrase
                elif subject.root.pos_ == 'PRON':
                    if len(noun_chunks) == 2:
                        if not noun_chunks[1].root.lemma_ in word_dict:
                            word_dict[noun_chunks[1].root.lemma_] = noun_chunks[1].orth_

                        # Append
                        word_pairs.append({'source': word_dict[noun_chunks[1].root.lemma_],
                                           'target': word_dict[noun_chunks[1].root.lemma_],
                                           'device': 'within'})
                    # There are multiple noun_chunks
                    elif len(noun_chunks) > 2:
                        # Get all combinations
                        no_sub_combinations = combinations(noun_chunks, 2)

                        # There are combinations
                        if no_sub_combinations:
                            # Add all combinations
                            for comb in no_sub_combinations:
                                if comb[0].root.pos_ != 'PRON' \
                                    and comb[1].root.pos_ != 'PRON':
                                    if comb[0].root.lemma_ in word_dict:
                                        if comb[1].root.lemma_ in word_dict:
                                            word_pairs.append({'source': word_dict[comb[0].root.lemma_],
                                                               'target': word_dict[comb[1].root.lemma_],
                                                               'device': 'between'})

                                        else:
                                            word_dict[comb[1].root.lemma_] = comb[1].orth_
                                            word_pairs.append({'source': word_dict[comb[0].root.lemma_],
                                                               'target': comb[1].orth_,
                                                               'device': 'between'})
                                    else:
                                        word_dict[comb[0].root.lemma_] = comb[0].orth_
                                        word_pairs.append({'source': comb[0].orth_,
                                                           'target': comb[1].orth_,
                                                           'device': 'between'})
            # No subject is in the current sentence
            elif not subject:
                no_sub_combinations = combinations(noun_chunks, 2)
                # There are combinations
                if no_sub_combinations:
                    # Add all combinations
                    for comb in no_sub_combinations:
                        if comb[0].root.pos_ != 'PRON' \
                            and comb[1].root.pos_ != 'PRON':
                            if comb[0].root.lemma_ in word_dict:
                                if comb[1].root.lemma_ in word_dict:
                                    word_pairs.append({'source': word_dict[comb[0].root.lemma_],
                                                       'target': word_dict[comb[1].root.lemma_],
                                                       'device': 'between'})

                                else:
                                    word_dict[comb[1].root.lemma_] = comb[1].orth_
                                    word_pairs.append({'source': word_dict[comb[0].root.lemma_],
                                                       'target': comb[1].orth_,
                                                       'device': 'between'})
                            else:
                                word_dict[comb[0].root.lemma_] = comb[0].orth_
                                word_pairs.append({'source': comb[0].orth_,
                                                   'target': comb[1].orth_,
                                                   'device': 'between'})


            # Lets look at the next sentence if there is a link between the two
            if index < (len(sentences) - 1):
                # Get noun chunks of next sentence
                noun_chunks_next = list(sentences[index + 1].noun_chunks)

                # Combine all chunks between two sentences
                # my_combinations = list(zip(r, p)) for (r, p) in zip(repeat(noun_chunks), permutations(noun_chunks_next))
                # my_combinations = list(combinations(noun_chunks + noun_chunks_next, 2))
                my_combinations = list(product(noun_chunks, noun_chunks_next))

                print 'length of combinations: %i' % len(list(my_combinations))

                print my_combinations

                # Calculate similarity between pairs
                similarity_pairs = [(comb[0], comb[1], comb[0].similarity(comb[1])) for comb in my_combinations]

                print similarity_pairs

                # We are only interested in pairs with a high similarity
                similarity_filter = filter(lambda x: x[2] > .76, similarity_pairs)

                # We have found chunks that are similar
                if len(similarity_filter) > 0:
                    # Loop over every pair and append
                    for pair in similarity_filter:
                        # Do not add pairs with same orthographie
                        if pair[0].orth_ != pair[1].orth_:
                            try:
                                # Check if root already exists
                                if pair[0].root.lemma_ in word_dict:
                                    if not pair[1].root.lemma_ in word_dict:
                                        word_dict[pair[1].root.lemma_] = pair[1].orth_
                                else:
                                    if not pair[1].root.lemma_ in word_dict:
                                        word_dict[pair[1].root.lemma_] = pair[1].orth_

                                    word_dict[pair[0].root.lemma_] = pair[0].orth_

                                # Append word pairs
                                word_pairs.append(
                                  {'source': word_dict[pair[0].root.lemma_],
                                   'target': word_dict[pair[1].root.lemma_],
                                   'device': 'between'})
                            except AttributeError:
                                pass

        print("--- Nouns: %s seconds ---" % (time.time() - start_time))

        return word_pairs, subjects


    def _get_clusters(self, sentences, word_pairs):
        """Calculates the number of computed
        clusters"""


        start_time = time.time()
        print '--- Start clusters ---'

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

                    print 'found at start of while loop: %s' % found
                    # Found set to false
                    found = False

                    print 'length of word_pairs: %i' % len(word_pairs)

                    # Loop over every word pair again
                    for num_again in range(0, len(word_pairs)):

                        # print 'look at (%s, %s)' % (word_pairs[num_again]['source'],
                        #                             word_pairs[num_again]['target'])

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

                    print 'found at end of while loop: %s' % found

                # Append current cluster to all clusters
                clusters.append(current_cluster)

        print("--- Number Clusters: %s seconds ---" % (time.time() - start_time))

        return clusters


    def _get_word_cluster_index(self, cluster):
        """Generate a dictionary that
        has the words as key and the cluster number
        as value"""

        start_time = time.time()

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

        print("--- Number Cluster Index: %s seconds ---" % (time.time() - start_time))

        return word_cluster_index


    def _get_html_string(self, node_list, word_cluster_index, paragraphs):
        """Generates an html string with spans for each word in order
        to signal the mapping between visualization and text

        Args:
            word_lemma_mapping (dict) - A dict with words as key and lemmas as values
            word_cluster_index (dict) - Words as key and int of cluster as value

        Returns:
            String - An html formatted string
        """

        start_time = time.time()

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
                    indexes_cur_sentence = [word_cluster_index[node] for node in node_list if sent.text.find(node) != -1]
                    indexes_next_sentence = [word_cluster_index[node] for node in node_list if tokenized_sentences[index + 1].text.find(node) != -1]

                    # Get most common cluster of current sentence
                    most_common_cluster_cur = Counter(indexes_cur_sentence).most_common(1)
                    most_common_cluster_next = Counter(indexes_next_sentence).most_common(1)

                    # Get cluster for each sentence
                    cluster_cur = -1 if len(most_common_cluster_cur) == 0 else most_common_cluster_cur[0][0]
                    cluster_next = -1 if len(most_common_cluster_next) == 0 else most_common_cluster_next[0][0]

                    # Did the cluster change?
                    cluster_changed = False if cluster_cur == cluster_next else True

                    # Append sentence to string
                    html_string += sent.text + ' '

                    # Add cluster change symbol
                    html_string = html_string + '&#8660; ' if cluster_changed else html_string
                # Append last sentence
                else:
                    html_string += sent.text

            # Finish paragraph
            html_string += '</p>'

        # Replace strings with
        for node in node_list:
            # Get cluster
            cluster = word_cluster_index[node]

            # Change to span element
            html_string = html_string.replace(node, '<span class="cluster-' + str(cluster) + '">' + node + '</span>')

        print("--- Html Index: %s seconds ---" % (time.time() - start_time))

        return html_string


    def _calculate_number_relations(self, word_pairs):
        """Calculates the number of relations"""

        start_time = time.time()

        # Make tuples from word_pairs
        tuples = map(lambda x: (x['source'], x['target']), word_pairs)

        # Remove duplicates
        tuples = list(set([(pair[0], pair[1])
            for pair in tuples if pair[0] != pair[1]]))

        print("--- Number Relations Index: %s seconds ---" % (time.time() - start_time))

        return len(tuples)


    def get_data_for_visualization(self, text):
        """Get all data for get_data for visualization"""

        # Preprocess text
        text_nlp, sentences, paragraphs = self._preprocess_text(text)

        # Generate word pairs
        word_pairs, subjects = self._generate_nouns(sentences)

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
        html_string = self._get_html_string(nodes_list, word_cluster_index, paragraphs)

        # return self.word_pairs
        return {'links': word_pairs,
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
