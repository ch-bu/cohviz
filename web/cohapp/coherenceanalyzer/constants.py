# coding: utf8

import os

# File_path
file_path = os.path.dirname(os.path.realpath(__file__))

# RFTagger variables
tokenizer = file_path + "/RFTagger/cmd/tokenize.perl"
rftagger = file_path + "/RFTagger/bin/rft-annotate"
german_par = file_path + "/RFTagger/lib/german.par"

# Temporary files
temp_text = file_path + "/temp/text"
temp_tokens = file_path + "/temp/tokens"
temp_tags = file_path + "/temp/tags"
temp_dir = file_path + "/temp"

# Debug files
debug = file_path + "/temp/debug.txt"
