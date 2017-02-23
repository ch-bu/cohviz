# encoding: utf-8

import re
import os
import itertools
import constants
import subprocess
import enchant
import string
import random
from more_itertools import unique_everseen
# https://github.com/wroberts/pygermanet#setup
from pygermanet import load_germanet
from enchant.checker import SpellChecker
from collections import Counter


class CoherenceAnalyzer:

    def __init__(self, text):

        # self.text is string
        if type(text) == str or isinstance(text, unicode):
            self.text = self.replace_unwanted_chars(text.strip())

            # Check if string is empty
            if not self.text:
                raise ValueError('You string is empty.')

            self.add_dot()
            # self.spellcheck_text()
            self.tags = self.get_tags()[0]
            self.word_pairs = self.get_word_pairs()
            self.lemmaDic = self.get_tags()[1]

        # self.text is not a string
        else:
            raise TypeError('self.text is not a string')

    def replace_unwanted_chars(self, text):
        """
        Replaces chars that mess up the data
        analysis
        """

        new_text = text
        # replacements = [r'[Bb]sp\.?\:?',
        #                 r'[Dd]\.?[Hh]\.?',
        #                 r'[zZ]\.?[Bb]\.?']

        abbreviations = [(r'[Bb]sp\.?\:?', 'beispielsweise'),
                         (r'[Dd]\.?[Hh]\.?', 'das heisst'),
                         (r'[zZ]\.?[Bb]\.?', 'zum Beispiel'),
                         (r'v\.\s[Cc]hr\.', 'vor Christus'),
                         (r'[Bb]zw\.', 'beziehungsweise'),
                         (r'ca\.', 'circa'),
                         (r'u\.a', 'unter anderem'),
                         (r'usw?\.', 'und so weiter')]

        for abbreviation in abbreviations:
            new_text = re.sub(abbreviation[0], abbreviation[1], new_text)

        return new_text

    def add_dot(self):
        """
        Adds a dot at the end of the text if no end of line character
        can be found
        """

        # List of end_of_line_characters
        end_of_line_chars = ['.', '!', '?']

        # Check if last character in self.text is not an end-of-line-character
        if not self.text[-1:] in end_of_line_chars:
            # Add dot to self.text if true
            self.text += '.'

    def get_words(self):
        """
        Returns dict with words and counts
        from pairs
        """

        words = {}
        pairs = self.word_pairs

        for pair in pairs:
            # print(pair)
            try:
                words[pair[0]] = \
                    words[pair[0]] + 1
            except KeyError:
                words[pair[0]] = 1

            try:
                words[pair[1]] \
                    = words[pair[1]] + 1
            except KeyError:
                words[pair[1]] = 1

        return words

    def spellcheck_text(self):
        """
        Spellcheckes text and saves spellchecked text in
        self.text.
        """

        # Variable declaration
        errors = list()  # spelling errors
        chkr = SpellChecker('de_DE')  # spellchecker for whole text
        dic = enchant.Dict('de_DE')  # enchant dict

        # Run spellchecker over whole text
        chkr.set_text(self.text)

        # Loop over every error
        for err in chkr:
            # Save error in errors list
            errors.append(err.word)

        # There are errors
        if len(errors) > 0:
            # Replace errors with proper word
            for error in errors:

                # Check if there is a substitute
                try:
                    self.text = self.text.replace(error, dic.suggest(error)[0])
                except IndexError:
                    pass

    def remove_synonyms(self, tags_from_function, g):
        """
        Removes synonymes from self.tags

        Returns:
                Tags without synonyms
        """

        # List of tags
        tags = tags_from_function

        # List of all words
        words = [tag[0] for tag in tags if tag[0] != '.']

        # Count of all words
        count = dict(Counter(words))

        # Loop over every combination of words
        for comb in itertools.combinations(count.keys(), 2):

            try:
                # Calculate Jiang-Conrath distance
                dist = g.synsets(comb[0])[0].dist_jcn(g.synsets(comb[1])[0])

                # We found a synonym
                if dist == 0:

                    # First word occurs more often
                    if count[comb[0]] > count[comb[1]]:
                        most_freq_word = comb[0]
                    # Second word occurs more often
                    elif count[comb[1]] > count[comb[0]]:
                        most_freq_word = comb[1]
                    # Words occurences don't differ
                    else:
                        most_freq_word = comb[0]

                    # Loop over tags
                    for tag in tags:
                        # Assign tag[0] to most_frequent_word
                        if tag[0] == comb[0] or tag[0] == comb[1]:
                            tag[0] = most_freq_word

            except IndexError:
                pass

        return tags

    def get_tags(self):
        """
        Generates tags from string.

        Takes a text as input and extracts nominatives using RFTagger.

        Args:
                None

        Returns:
                List with tags
        """

        # Create directory temp if not existent
        if not os.path.exists(constants.temp_dir):
            os.makedirs(constants.temp_dir)

        # Create random string
        rand_string = ''.join(random.choice(string.ascii_lowercase +
                                            string.digits) for _ in range(15))

        # Path for text files
        tokens = constants.temp_tokens + "_" + rand_string + ".txt"
        curr_text = constants.temp_text + "_" + rand_string + ".txt"

        # Save text to file
        f = open(curr_text, 'w')
        #f = open(constants.temp_text, 'w')
        f.write(self.text)
        f.close()

        # Tokenize
        f = open(tokens, 'w')
        subprocess.call(
            [constants.tokenizer, curr_text], stdout=f, shell=False)
        f.close()

        # Tag Tokens from temp_tokens
        f = open(constants.temp_tags + "_" + rand_string + ".txt", 'w')
        subprocess.call([constants.rftagger, constants.german_par,
                         tokens], stdout=f, shell=False)
        f.close()

        # Read tags from file
        f = open(constants.temp_tags + "_" + rand_string + ".txt", 'r')
        tags = f.readlines()
        f.close()

        # Regular Expression
        regex = re.compile(r'.*N.Name.*|.*N.Reg.*|.*SYM.Pun.Sent')

        # Filtered tags
        filtered_tags = [regex.match(tag).string for tag in tags
                         if regex.match(tag) is not None]

        # Split tags in lists
        splited_tags = [str.split(tag, '\t') for tag in filtered_tags]

        # Load germanet
        g = load_germanet()

        # Build Lemmas
        splited_tags_lemma = [[g.lemmatise(tag[0].decode('utf-8'))[0], tag[0],
                               tag[1]] for tag in splited_tags]

        # Build empty dictionary with lemmas as key
        lemmaDic = {key: [] for [key, value, token] in splited_tags_lemma}

        # Fill the dictionary with all values
        [lemmaDic[key].append(value.decode('utf-8')) for [key, value, token] in
            splited_tags_lemma if value not in lemmaDic[key]]

        # Update self.tags
        tags = splited_tags_lemma

        # tags = self.remove_synonyms(tags, g)

        # Remove files
        os.remove(curr_text)
        os.remove(tokens)
        os.remove(constants.temp_tags + "_" + rand_string + ".txt")

        return (tags, lemmaDic)

    def get_sentences(self):
        """
        Returns sentences from text
        """

        sentence_list = list()
        curr_sentence = list()
        regex_sym = re.compile(r'.*SYM.*')
        tags = self.tags

        # Loop over every nominative
        for item in tags:
            # Item is not an end-of-line character
            if not re.match(regex_sym, item[2]) is not None:
                # TODO: lemmatize item[0]
                curr_sentence.append(item[0])
            # Item is an end-of-line-character
            else:
                sentence_list.append(curr_sentence)
                curr_sentence = list()

        # Return list with sentences
        return sentence_list

    def get_num_sentences(self):
        """
        Returns number of sentences in get_tags
        """

        return len(self.get_sentences())

    def get_coherence_sentences(self):
        """"
        Calculates number of coherent sentences and
        non-coherent sentences from text.
        """

        # Get sentences
        sentences = self.get_sentences()
        num_sentences = self.get_num_sentences()

        if num_sentences <= 1:
            raise ValueError("You do not have enough sentences")

        # Initialize variable
        num_coh = 0
        num_not_coh = 0

        # Check if text has at least 2 sentences
        if num_sentences > 1:

            # Calcuate num coherent and non-coherent sentences
            for sentence in range(0, num_sentences):

                # Before last sentence is reached
                if sentence == num_sentences - 1:
                    pass
                else:
                    # overlap true if two adjacent sentences share a word
                    overlap = bool(set(sentences[sentence])
                                   & set(sentences[sentence + 1]))

                    # Update overlapping sentences
                    if overlap:
                        num_coh = num_coh + 1
                    # Update non-overlapping sentences
                    else:
                        num_not_coh = num_not_coh + 1

        # Return dict with coherence sentences
        return {"coh_sen": num_coh, "coh_not_sen": num_not_coh}

    def append_word_pairs(self, word_pairs, list1, list2):
        """
        Combine all possible combinations of
        two lists without repetition
        """

        pairs = word_pairs

        # List1 one consists of more than 1 element
        if len(list1) > 1:
            for word1 in list1:
                for word2 in list2:
                    pairs.append((word1, word2))

        # List1 contains 1 element
        elif len(list1) == 1:
            for word in list2:
                pairs.append((list1[0], word))

        return pairs

    def get_clusters(self):
        """
        Calculates the number of clusters based on
        word pairs
        """

        # Initialize Clusters
        clusters = []
        tempClusters = []
        found = True
        pairs = self.word_pairs

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

                # Found set to faulse
                found = False

                # Loop over every word pair again
                for num_again in range(0, len(pairs)):

                    # Word pairs do not match
                    if num != num_again:

                        # Initialize temporary source and target
                        tempSource = pairs[num_again][0]
                        tempTarget = pairs[num_again][1]

                        # Temporary Array
                        tempArray = [tempSource, tempTarget]

                        # Temporary sources and targets in array position
                        tempPosSource = tempSource in tempClusters
                        tempPosTarget = tempTarget in tempClusters

                        # if (source or target) == "Moskito":
                        #     print(tempSource)
                        #     print(tempTarget)
                        #     print(tempPosSource)
                        #     print(tempPosTarget)
                        # print(self.lemmaDic[tempTarget])

                        # Either of the two is in tempClusters
                        if tempPosSource or tempPosTarget:


                            # print("\n")
                            # print(tempSource + " - " + str(tempPosSource))
                            # print(tempTarget + " - " + str(tempPosTarget))
                            # print("\n")

                            # TempSource is in tempClusters
                            if tempPosSource:
                                # TempTarget ist not in tempClusters
                                if not tempPosTarget:
                                    found = True
                                    # Loop over every word for lemma and
                                    # append to list
                                    # print(tempTarget)
                                    # for value in self.lemmaDic[tempTarget]:
                                    #     # print(value.decode('utf-8'))
                                    #     tempClusters.append(value.decode('utf-8'))

                                    # for value in self.lemmaDic[tempSource]:
                                    #     # print(tempSource)
                                    #     # print(value.decode('utf-8'))
                                    #     tempClusters.append(value.decode('utf-8'))

                                    tempClusters.append(tempTarget)

                            # TempTarget is in tempClusters
                            if tempPosTarget:
                                # TempSource is not in tempClusters
                                if not tempPosSource:
                                    # print(tempSource)
                                    found = True
                                    # for value in self.lemmaDic[tempSource]:
                                    #     # print(tempSource)
                                    #     # print(value.decode('utf-8'))
                                    #     tempClusters.append(value.decode('utf-8'))

                                    # for value in self.lemmaDic[tempTarget]:
                                    #     # print(value.decode('utf-8'))
                                    #     tempClusters.append(value.decode('utf-8'))
                                    tempClusters.append(tempSource)

            # Remove duplicates from tempClusters
            tempClusters = list(unique_everseen(tempClusters))
            # print(tempClusters)

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
                            # # We have to manually add the missing items
                            # # that have not been lematized
                            # inTempNotCurrent = set(tempClusters) - set(currentCluster)
                            # clusters[cluster] = currentCluster + list(inTempNotCurrent)

                            clusterIn = True
                            break

                # tempClusters does not exist yet in clusters
                if not clusterIn:
                    # for value in self.lemmaDic[source]:
                    #     tempClusters.append(value.decode('utf-8'))

                    # tempClusters = list(unique_everseen(tempClusters))

                    clusters.append(tempClusters)

            # Clusters is empty
            else:
                # print(tempClusters)
                # print(source)
                # print(target)
                # for value in self.lemmaDic[source]:
                #     tempClusters.append(value.decode('utf-8'))

                # tempClusters = list(unique_everseen(tempClusters))

                # for value in self.lemmaDic[target]:
                #     tempClusters.append(value.decode('utf-8'))
                # print(tempClusters)
                # print(tempClusters)
                clusters.append(tempClusters)

        return clusters

    def get_whole_clusters(self):
        """
        Returns the whole list of clusters
        """

        clusters = self.get_clusters()

        for i in range(0, len(clusters)):
            for word in clusters[i]:
                nonLemmas = [w for w in self.lemmaDic[word]]
                clusters[i] = list(unique_everseen(clusters[i] + nonLemmas))

                # clusters[i].remove(word)
                # print(self.lemmaDic[word])
                lengthDic = len(self.lemmaDic[word])
                currArray = self.lemmaDic[word]

                # if lengthDic >= 1:
                #     if lengthDic == 1:
                #         if currArray[0] != word:
                #             clusters[i].remove(word)
                #     else:
                #         clusters[i].remove(word)

        return clusters

    def get_num_clusters(self):
        """
        Returns number of clusters in text
        """

        return len(self.get_clusters())

    def get_num_concepts(self):
        """
        Calculates the oncepts in the text
        """

        # Inititialize empty list
        concepts = []
        pairs = self.word_pairs

        for pair in pairs:
            first = pair[0]
            second = pair[1]

            concepts.append(first)
            concepts.append(second)

        num_concepts = len(list(unique_everseen(concepts)))

        return num_concepts

    def get_word_pairs(self):
        """
        Generates word pairs in order to calculate breaks and
        number of concepts
        """

        tags = self.tags

        # Regular expressions
        regex_nom = re.compile(r'.*Nom.*')
        regex_acc = re.compile(r'.*Acc.*')
        regex_gen = re.compile(r'.*Gen.*')
        regex_dat = re.compile(r'.*Dat.*')
        regex_sym = re.compile(r'.*SYM.*')

        # Initialize word-pairs and noun lists
        word_pairs = []
        nom = []
        acc = []
        dat = []
        gen = []

        # Loop over splited_tags
        for tag in tags:

            # tag is nominativ
            if re.match(regex_nom, tag[2]) != None:
                nom.append(tag[0])
            # tag is accusative
            elif re.match(regex_acc, tag[2]) != None:
                acc.append(tag[0])
            # tag is dativ
            elif re.match(regex_dat, tag[2]) != None:
                dat.append(tag[0])
            # tag is genitive
            elif re.match(regex_gen, tag[2]) != None:
                gen.append(tag[0])
            # tag is dot
            elif re.match(regex_sym, tag[2]) != None:

                # Remove duplicates
                nom = sorted(set(nom))
                acc = sorted(set(acc))
                dat = sorted(set(dat))
                gen = sorted(set(gen))

                # There is at least a dative
                if len(dat) > 0:
                    # There is at least an accusative
                    if len(acc) > 0:
                        # Accusative - Dative
                        word_pairs = self.append_word_pairs(word_pairs,
                                                            dat, acc)

                # There is at least 1 nominative
                if len(nom) > 0:
                    # There is just one nominativ
                    if len(nom) == 1:
                        word_pairs = self.append_word_pairs(word_pairs,
                                                            nom, nom)

                    # There is at least an accusative
                    if len(acc) > 0:
                        # Nominativ - Accusative
                        word_pairs = self.append_word_pairs(word_pairs,
                                                            nom, acc)

                    # There is at least a dativ
                    if len(dat) > 0:
                        # Nominativ - Dative
                        word_pairs = self.append_word_pairs(word_pairs,
                                                            nom, dat)

                    # There is at least a genitiv
                    if len(gen) > 0:
                        # Nominativ - Genitive
                        word_pairs = self.append_word_pairs(word_pairs,
                                                            nom, gen)

                    # There are at least 2 nominatives
                    if len(nom) > 1:
                        # Nominative - Nominativ
                        nom_nom = itertools.combinations(nom, 2)
                        for pair in nom_nom:
                            word_pairs.append(pair)

                # Reinitialize lists
                nom = []
                acc = []
                dat = []
                gen = []

        word_list = []

        # Append tuples to word_list
        for pair in set(word_pairs):
            word_list.append((pair[0], pair[1]))

        # Return word_list
        return word_list


# text = """Ein Baum ist keine Wurzel. Moskitos
#     sind böse. In diesem Haus gibt es Bäume. Eine Mauer muss so
#     sein. Andreas ist toll."""

# # text = """
# #     Eine unterhaltsame Sportart, die das Potenzial in sich birgt, ein 
# #     Vereinsleben auf nie dagewesene Weise mit Saufen zu 
# #     verknüpfen.
# #     Man begegnet diesem Sport auf den Zeltplätzen diverser Festivals, da diese Form des 
# #     Alkoholkonsums sehr viel Unrat hervorbringt und somit 
# #     prima ins Konzept solcher Veranstaltungen passt.
# #     Um eine Runde zu spielen, bauen zwei Mannschaften eine 
# #     Reihe leerer Bierdosen zwischen sich auf und entfernen 
# #     sich zunächst jeweils 4 Meter davon. Anschließend beginnen 
# #     sich die Teams abwechselnd, Saufzeit zu verschaffen, indem 
# #     sie mit einem leichten Wurfgerät die leeren Dosen in der 
# #     Mitte zu Fall bringt und die eigenen Bierdosen aussaufen, 
# #     bis die gegnerische Mannschaft die Dosenreihe wieder aufstellen 
# #     und hinter ihre eigene Grundlinie zurückkehren konnte.
# #     Das Team, das auf diese Weise zuerst alle seine Dosen 
# #     komplett ausgesoffen hat, geht als Sieger des Spiels 
# #     hervor. Traditionell wird ein solcher Sieg zum Anlass genommen, 
# #     Mutmaßungen über die unzureichende Größe der Genitalien der 
# #     Verlierer anzustellen. Somit wird klar, wie sich säuferische 
# #     Fähigkeiten unmittelbar auf die gesellschaftliche Akzeptanz einer 
# #     Person niederschlagen. Laufen-Saufen ist die optimierte Form 
# #     von des recht bekannten Flunkyball."""

# c = CoherenceAnalyzer(text)
# print(c.get_whole_clusters())
