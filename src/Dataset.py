from os import listdir
from stringEditAlgs import *


# TODO class should store all the sequences/scanpaths instead of receiving them via function arguments
# TODO the same goes for error area - once calculated set it as property
class Dataset:
    """Common class for grouping a set of scanpaths together"""

    def __init__(self, folder_path_scanpaths, file_path_aoi, file_path_visual, website_name):
        # Initialize attributes
        self.file_path_aoi = file_path_aoi
        self.file_path_visual = file_path_visual
        self.folder_path_scanpaths = folder_path_scanpaths
        self.data_file_format = '.txt'
        self.website_name = website_name
        # Data holding objects
        self.participants = {}
        self.aois = []
        # Fill the data holding objects
        self.load_participants()
        self.load_aois()

    def load_participants(self):
        # Fetch all files in specified folder
        files_list = listdir(self.folder_path_scanpaths)

        for filename in files_list:
            if filename.endswith(self.data_file_format):
                try:
                    fo = open(self.folder_path_scanpaths + filename, "r")
                except:
                    print "Failed to open specified file - skipping to next one"
                    continue
                act_file_content = fo.read()

                act_file_lines = act_file_content.split('\n')
                act_file_data = []

                # Read the file by lines (skip the first one with description)
                for y in range(1, len(act_file_lines) - 1):
                    try:
                        # If the page name argument matches the page name specified in file
                        if act_file_lines[y].index(self.website_name) > 0:
                            # Read the data in columns by splitting via tab character
                            act_file_data.append(act_file_lines[y].split('\t'))
                    except:
                        print "Invalid data format - line will be skipped"
                        continue

                # Return object containing array of fixations (each fixation is also an array)
                participant_identifier = filename.split(".txt")[0]
                self.participants[participant_identifier] = act_file_data

    def load_aois(self):
        try:
            fo = open(self.file_path_aoi, "r")
        except:
            print "Failed to open file containing areas of interest"
        aoi_file = fo.read()
        file_lines = aoi_file.split('\n')

        # Read the file by lines and remember Identifier, X-from, X-length, Y-from, Y-length, ShortID
        for x in range(0, len(file_lines)):
            temp = file_lines[x].split(' ')
            self.aois.append([temp[0], temp[1], temp[2], temp[3], temp[4], temp[5]])

    def load_visuals(self):
        print 'hello'

    def format_sequences(self, sequences):
        """
        {'01': [[A, 150], [B, 250]], '02': ...} gets transformed into:
        [{'identifier': '01', 'fixations': [[A, 150], [B, 250]]}, {'identifier': '02' ... }]
        """
        formatted_sequences = []
        keys = sequences.keys()
        for it in range(0, len(sequences)):
            act_rec = {
                'identifier': keys[it],
                'fixations': sequences[keys[it]]
            }
            formatted_sequences.append(act_rec)

        return formatted_sequences

    def get_max_similarity(self, scanpaths):
        """ Function calculates most similiar pair for each scanpath in the set """
        for scanpath in scanpaths:
            # Create empty max_similarity object
            max_similar = {}
            max_similar['identifier'] = ''
            max_similar['value'] = -1
            # Iterate through previously calculated similarity values of given scanpath
            for similarity_iter in scanpath['similarity']:
                similarity_val = scanpath['similarity'][similarity_iter]
                if similarity_val > max_similar['value']:
                    max_similar['value'] = similarity_val
                    max_similar['identifier'] = similarity_iter
            # Assign max_similarity object to scanpath (in JSON-style)
            scanpath['maxSimilarity'] = max_similar

    def get_min_similarity(self, scanpaths):
        """ Function calculates most similar pair for each scanpath in the set """
        for scanpath in scanpaths:
            # Create empty max_similarity object
            min_similar = {}
            min_similar['identifier'] = ''
            min_similar['value'] = 101
            # Iterate through previously calculated similarity values of given scanpath
            for similarity_iter in scanpath['similarity']:
                similarity_val = scanpath['similarity'][similarity_iter]
                if similarity_val < min_similar['value']:
                    min_similar['value'] = similarity_val
                    min_similar['identifier'] = similarity_iter
            # Assign max_similarity object to scanpath (in JSON-style)
            scanpath['minSimilarity'] = min_similar

    def get_edit_distances(self, scanpaths):
        # Store scanpaths as an array of string-converted original scanpaths
        scanpath_strs = convert_to_strs(scanpaths)

        # Calculate the edit distances
        # The order of records in scanpaths and scanpath_strs must be the same!
        calc_mutual_similarity(scanpath_strs)

        for i_first in range(0, len(scanpath_strs)):
            # Save the calculations to the original scanpaths object
            scanpaths[i_first]['similarity'] = scanpath_strs[i_first]['similarity']
