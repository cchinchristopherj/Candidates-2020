# Required libraries
import requests
import csv
import numpy as np
from bs4 import BeautifulSoup
import re
import json
import copy

# Web scraper for Axios main web page
# Use the requests library to download the HTML contents of the main page 
page_main = requests.get("https://www.axios.com/2020-presidential-election-candidate-profiles1552432119-facfee57-8089-4f14-bbdf-dc44ffa0ea4a.html")
# Use the BeautifulSoup library to parse the downloaded HTML document
soup_main = BeautifulSoup(page_main.content,'html.parser')
# Find the div containing links to web pages for each Democratic candidate
links = soup_main.select("div#hidden-facfee57-8089-4f14-bbdf-dc44ffa0ea4a ul:nth-of-type(1) li.StoryBody__item--1cHYD a")
# Array of candidate names
candidate_names = []
# Dictionary of data for each candidate to be converted into .json
json_obj = dict()
# For every link to a web page for a Democratic candidate perform the following
for i in range(len(links)):
    link = links[i]
    # Use the requests library to download the HTML contents of the candidate page 
    page = requests.get(link['href'])
    # Use the BeautifulSoup library to parse the downloaded HTML document
    soup = BeautifulSoup(page.content,'html.parser')
    # Find the bullet points in the "Key Facts" section of the candidate page
    key_facts = soup.select("div.StoryBody__root--2VihO h2:nth-of-type(1) + ul li")
    # Find the bullet points in the "Key Issues" section of the candidate page
    key_issues = soup.select("div.StoryBody__root--2VihO h2:nth-of-type(2) + ul li")
    # Find the bullet points in the "Key Criticisms" section of the candidate page
    key_criticisms = soup.select("div.StoryBody__root--2VihO h2:nth-of-type(3) + ul li")
    # Select the header
    header = soup.select("h1")
    # One of the candidate web pages has a header with a different format than the other pages
    # Extract the candidate's name from the header differently for this page than the others
    check_name = re.split(' ',header[0].text)
    if(check_name[0] == 'Everything'):
        name = ' '.join(check_name[-2:])
    else:
        name = re.split(':',header[0].text)[0]
    # The name variable holds the candidate's name extracted from the header
    name = re.sub(' ','_',name)
    name = re.sub('á','a',name)
    # Add the candidate name to the array "candidate_names"
    candidate_names.append(name)
    # Add a sub-dictionary to the json_obj dictionary, with key corresponding to the current candidate's name
    json_obj[name] = dict()
    for j in range(1,4):
        # Each key section, i.e. "Key Facts", "Key Issues", "Key Criticisms", is identified using integers 1,2, and 3
        # respectively in the following selection
        key_section = soup.select("div.StoryBody__root--2VihO h2:nth-of-type(" + str(j) + ") + ul li")
        # For every bullet point in a key section perform the following
        for k in range(len(key_section)):
            # If the bullet point contains bold text perform the following
            if (key_section[k].select("strong") != []):
                # The bold text becomes the column name 
                col_name = key_section[k].contents[0].text
                # "col_value" initially contains the full text of the bullet point
                col_value = key_section[k].text
                # Use re.split() to to set "col_value" to the text following the bold text
                col_value = re.split(col_name,col_value)[1]
                col_value = re.sub('—','-',col_value)
                # If the key section is "Key Criticisms", pre-pend a '*' to the column name
                if(j==3):
                    col_name = "*"+col_name
                # Add a sub-dictionary to json_obj[name] where the key is "col_name" and value is "col_value"
                json_obj[name][col_name.strip(':, ')] = col_value.strip(':, ')
            # If the key section is "Key Criticisms" and there is no bold text in a bullet point, set "col_name"
            # to "*Criticism 1", "*Criticism 2", etc. depending on the index of the bullet point in the list of 
            # key criticisms
            elif ((key_section[k].select("strong") == []) and (j==3)):
                col_name = '*Criticism '+str(k+1)
                col_value = key_section[k].text
                col_value = re.sub('—','-',col_value)
                json_obj[name][col_name] = col_value.strip(':, ')
# Use the csv library to open a new .csv file for writing
with open('candidates.json', 'w') as jsonfile:  
    # Convert json_obj containing candidate data into a .json file
    json.dump(json_obj,jsonfile)
# Use the csv library to open a new .csv file for writing
with open('names.csv', 'w') as csvfile:
    writer = csv.writer(csvfile)
    # Create one row in the .csv file containing names of all the candidates
    writer.writerow(candidate_names)

# Web scraper for Morning Consult web page
# Use the requests library to download the HTML contents of the page 
page_main = requests.get("https://morningconsult.com/2020-democratic-primary/")
# Use the BeautifulSoup library to parse the downloaded HTML document
soup_main = BeautifulSoup(page_main.content,'html.parser')
# Find the div containing names of all the candidates in the "Who's Leading Now" section of the page
primary_names = soup_main.select("div#content-00 div.ranking div.ranking__info div.ranking__name")
# Format the names of candidates
primary_names_list = [re.search("[^\n\t]+",el.text)[0].strip().replace(" ","_") for el in primary_names]
# Find the div containing voter choice percentages for each candidate
primary_ranks = soup_main.select("div#content-00 div.ranking div.ranking__info div.ranking__bar")
# Format the voter choice percentages
primary_ranks_list = [re.search("[^\n\t]+",el.text)[0].strip() for el in primary_ranks]
# Create an array of sub-arrays, in which each sub-array contains the name of a candidate and corresponding voter
# choice percentage
primary = [[primary_names_list[i],primary_ranks_list[i]] for i in range(len(primary_names_list))]

# Find the div containing names of all the candidates in the "Tracking Name Recognition and Favorability" section of 
# the page
favorability_names = soup_main.select("div.ranking.ranking-favorability div.ranking__info div.ranking__name")
# Format the names of candidates
favorability_names_list = [re.search("[^\n\t]+",el.text)[0].strip().replace(" ","_") for el in favorability_names]
# Find the div containing favorability percentages for each candidate
favorability_ranks = soup_main.select("div.ranking.ranking-favorability div.ranking__info div.ranking__bar-group span.ranking__positive")
# Format the favorability percentages 
favorability_ranks_list = [re.search("[^\n\t]+",el.text)[0].strip() for el in favorability_ranks]
# Create an array of sub-arrays, in which each sub-array contains the name of a candidate and corresponding
# favorability percentage
favorability = [[favorability_names_list[i],favorability_ranks_list[i]] for i in range(len(favorability_names_list))]

# Find the div containing unfavorability percentages for each candidate
unfavorability_ranks = soup_main.select("div.ranking.ranking-favorability div.ranking__info div.ranking__bar-group span.ranking__negative")
# Format the unfavorability percentages
unfavorability_ranks_list = [re.search("[^\n\t]+",el.text)[0].strip() for el in unfavorability_ranks]
# Create an array of sub_arrays, in which each sub-array contains the name of a candidate and corresponding
# unfavorability percentage
unfavorability = [[favorability_names_list[i],unfavorability_ranks_list[i]] for i in range(len(favorability_names_list))]

# Create a "final" array to convert into a .csv file that contains both voter choice percentage, favorability
# percentage, and unfavorability percentage data
# Initialize "final" as a copy of "primary"
final = copy.deepcopy(primary)
for i in range(len(primary)):
    for j in range(len(favorability)):
        # If the candidate name in "primary" matches the candidate name in "favorability," append the corresponding 
        # favorability percentage and unfavorability percentage data to the current element of "final"
        if(primary[i][0]==favorability[j][0]):
            final[i].append(favorability[j][1])
            final[i].append(unfavorability[j][1])
# If all three percentages (voter choice percentage, favorability percentage, and unfavorability percentage) are not
# available, delete the corresponding entry in "final"
for i in range(len(final)):
    if len(final[i])==2:
        final.pop(i)
        i = i-1
        
# Use the csv library to open a new .csv file for writing     
with open('ranks.csv', 'w') as csvfile:
    writer = csv.writer(csvfile)
    # Header for csv file
    writer.writerow(['Name','Primary','Favorability','Unfavorability'])
    # Add elements from "final" as rows in the .csv file
    for i in range(len(final)):
        writer.writerow(final[i])