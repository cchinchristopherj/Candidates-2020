2020 Democratic Presidential Candidates
=========================

The 2020 presidential election is one of the most anticipated events of American political discourse, serving as not only a lightning rod for debate regarding contemporary critical issues, but also rallying cry for Democratic candidates seeking to pose a significant challenge to presidential incumbent, Donald Trump. In our politically-charged climate of media distrust, data (statistics, facts, and figures) will be some of the most critical and influential means of swaying voter opinion. The purpose of this project was to effectively distill and convey the enormous amount of data on the contending Democratic presidential candidates for voters to make the most informed decision come election time. 

Due to the wide variety in type and topic of relevant data, it is crucial to successfully orient viewers through the different datasets to form a cohesive overall narrative. A popular means of achieving this goal in many top news organizations is a scroller, a form of interactive storytelling in which the user moves through distinct sections, each containing guiding narrative text and an accompanying visualization. A scroller with six sections and visualizations was developed to tell the data-driven story of the 2020 Democratic presidential candidates: 

1. Voter Choice Percentages (Pie Chart)
2. Favorability Percentages (Diverging Stacked Bar Chart)
3. State Ties (Geographical Map)
4. Background/Experience (Network Graph)
5. Stances on Critical Issues (Hierarchical Bubble Chart)
6. Key Criticisms (Expandable Bubble Chart)

Voter Choice Percentages
=========================

The Morning Consult conducted 15,770 interviews, between April 29 and May 5, of registered Democratic primary voters regarding their top choice for the Democratic candidacy. The data was scraped from the Morning Consult website and organized into a pie chart in order to most effectively display the relative proportions of voters backing each candidate. In addition to arc size, a blue-yellow color scale is used to emphasize percentage magnitudes (with blue representing a higher magnitude).

The default visualization, for simplicity, displays only data for candidates with a voter choice percentage of 2% or higher, with data on all other candidates placed into the “Other” category. This category can be clicked to reveal additional information on each constituent candidate.

Default Visualization
-------------------------

![pie_main](https://github.com/cchinchristopherj/Candidates-2020/blob/master/screenshots/pie_main.png)

User Interactivity: Step 1
-------------------------

![pie_1](https://github.com/cchinchristopherj/Candidates-2020/blob/master/screenshots/pie_1.png)

User Interactivity: Step 2
-------------------------

![pie_2](https://github.com/cchinchristopherj/Candidates-2020/blob/master/screenshots/pie_2.png)

Favorability Percentages
=========================

The Morning Consult’s interviews also contained information on candidate name recognition and favorability, with each interview participant selecting whether they had a “Favorable” impression, “Unfavorable” impression, or “No Opinion” of each candidate. (Note that “No opinion” could also be due to never having heard of the candidate’s name/proposed policies). The data therefore corresponds to a 3 point scale centered around 0, since there is one positive category (“Favorable”), one negative category (“Unfavorable”), and one neutral category (“Never Heard Of/No Opinion”). 

A stacked bar chart would be an excellent visualization for this type of data, since the stacked bars would show the contribution of each category. However, an even more optimal visualization is a diverging stacked bar chart, a variation on the standard form in which the x axis is shifted to display both negative and positive values (instead of 0 to 100). This slight modification makes diverging stacked bar charts ideal choices for depicting data for 3 point scales, as the neutral/positive/ negative nature of each category is visually emphasized by its position on either side of the central 0 line.

The data was once again scraped from the Morning Consult website and organized into a diverging stacked bar chart. As in the pie chart of the preceding section, a blue-yellow color scale is implemented: here, blue represents “Favorable”, green represents “Never Heard Of/No Opinion”, and yellow represents “Unfavorable”.

Default Visualization
-------------------------

![rank_main](https://github.com/cchinchristopherj/Candidates-2020/blob/master/screenshots/rank_main.png)

User Interactivity: Step 1
-------------------------

![rank_1](https://github.com/cchinchristopherj/Candidates-2020/blob/master/screenshots/rank_1.png)

State Ties
=========================

Axios also devotes a section of their website to information on the Democratic candidates, with each candidate page containing sections on key facts, stances on key issues, and key criticisms, the data for which is scraped and visualized in the current and subsequent sections. In this section, geographical data from the “key facts” is depicted on a map of the US - concretely, candidate icons are placed on the states that candidates were born in, or the states that candidates worked in, depending on which of the two buttons below the map is toggled by the user. The user also has the option of adding/removing icons from the map through selecting/de-selecting images of candidates in the upper grid.

Default Visualization
-------------------------

![map_main](https://github.com/cchinchristopherj/Candidates-2020/blob/master/screenshots/map_main.png)

User Interactivity: Step 1
-------------------------

![map_1](https://github.com/cchinchristopherj/Candidates-2020/blob/master/screenshots/map_1.png)

User Interactivity: Step 2
-------------------------

![map_2](https://github.com/cchinchristopherj/Candidates-2020/blob/master/screenshots/map_2.png)

User Interactivity: Step 3
-------------------------

![map_3](https://github.com/cchinchristopherj/Candidates-2020/blob/master/screenshots/map_3.png)

User Interactivity: Step 4
-------------------------

![map_4](https://github.com/cchinchristopherj/Candidates-2020/blob/master/screenshots/map_4.png)

Background/Experience
=========================

The key facts sections of the Axios website also contains information on the background and work experience associated with each Democratic candidate. For simplicity these experiences were divided into four main categories: political, legal, entrepreneurial, and military, so that viewers could make connections between candidates despite the diverse and disparate natures of their career histories. A network graph was designed to depict these shared career experiences using a node/link topology and unified color scheme. Specifically, a blue “political” category node, yellow “legal” category node, green “entrepreneurial” category node, and red “military” category node are placed at the four corners of the graph. Links of the same colors extend from these nodes to images of the candidates if those candidates have experience in the corresponding categories. For example, three red links extend from the red “military” category node to the three candidates who have military experience and four yellow links extend from the yellow “legal” category node to the four candidates who have legal experience. 

(One can also view the color of links extending from each candidate image as a representation of the experience categories associated with the candidate’s career history. For instance, a blue link and yellow link extend from the image of candidate Kamala Harris, indicating her career includes legal and political work experience).

With respect to plot interactivity, the user can click on a category node to highlight only candidates with experience in the corresponding category. The user can also click on a candidate image to display a tooltip with the candidate’s associated work experience and hide all other candidate images.

Default Visualization
-------------------------

![tree_main](https://github.com/cchinchristopherj/Candidates-2020/blob/master/screenshots/tree_main.png)

User Interactivity: Step 1
-------------------------

![tree_1](https://github.com/cchinchristopherj/Candidates-2020/blob/master/screenshots/tree_1.png)

User Interactivity: Step 2
-------------------------

![tree_2](https://github.com/cchinchristopherj/Candidates-2020/blob/master/screenshots/tree_2.png)

User Interactivity: Step 3
-------------------------

![tree_3](https://github.com/cchinchristopherj/Candidates-2020/blob/master/screenshots/tree_3.png)

Stances on Critical Issues
=========================

In the key issues sections of the Axios website, candidates’ stances on a wide variety of critical issues facing the US today are described in detail. As in the previous section, these key issues were divided into eleven main categories to simplify analysis: technology, abortion, gun control, immigration, drugs, social issues, education, environment, justice, economy, and health care. In developing the associated visualization, the primary motivation was simulating debate between candidates on these key issues of interest, and a hierarchical bubble chart was chosen to achieve this goal: the first hierarchical level visible to the viewer contains eleven bubbles for each of the key issues. Upon selection of one of these key issues of interest, the chart zooms into the second hierarchical level, which contains a cluster of bubbles of candidates who have a stance on the current key issue. Upon selection of one of these candidates of interest, the chart then zooms into the third hierarchical level, which contains additional information on the current candidate’s key issue positions. The viewer, in this way, can simulate debate between candidates and view different candidates’ opinions on the same critical issue by selecting different candidate bubbles within the same critical issue bubble.

Default Visualization
-------------------------

![zoom_main](https://github.com/cchinchristopherj/Candidates-2020/blob/master/screenshots/zoom_main.png)

User Interactivity: Step 1
-------------------------

![zoom_1](https://github.com/cchinchristopherj/Candidates-2020/blob/master/screenshots/zoom_1.png)

User Interactivity: Step 2
-------------------------

![zoom_2](https://github.com/cchinchristopherj/Candidates-2020/blob/master/screenshots/zoom_2.png)

User Interactivity: Step 3
-------------------------

![zoom_3](https://github.com/cchinchristopherj/Candidates-2020/blob/master/screenshots/zoom_3.png)

Key Criticisms
=========================

Finally, the key criticisms sections of the Axios website feature lists of popular criticisms of each candidate. Due to the highly individual nature of each of these lists, key criticisms were not divided into common categories as in the previous sections. Instead, an expandable bubble chart was used to associate each list of criticisms uniquely with each candidate, one bubble per candidate, with the size and color of bubbles corresponding to the number of criticisms. (Larger and darker blue bubbles represent a higher number of criticisms, while smaller and lighter blue bubbles represent a smaller number of criticisms). Each candidate bubble can further be clicked to reveal the associated bullet-point list of criticisms and each of these bullet points, in turn, can be clicked to reveal more information on the current key criticism of interest.

Default Visualization
-------------------------

![grid_main](https://github.com/cchinchristopherj/Candidates-2020/blob/master/screenshots/grid_main.png)

User Interactivity: Step 1
-------------------------

![grid_1](https://github.com/cchinchristopherj/Candidates-2020/blob/master/screenshots/grid_1.png)

User Interactivity: Step 2
-------------------------

![grid_2](https://github.com/cchinchristopherj/Candidates-2020/blob/master/screenshots/grid_2.png)

User Interactivity: Step 3
-------------------------

![grid_3](https://github.com/cchinchristopherj/Candidates-2020/blob/master/screenshots/grid_3.png)

Data
=========================

The data itself consisted of publicly available .csv and .json files drawn from two different sources:

- State-level presidential election returns from 1976 to 2016 "1976-2016-president.csv": [U.S. President 1976-2016](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/42MVDX). 
- GeoJSON for US States "us-states.json": [Basic US State Map - D3](https://gist.github.com/michellechandra/0b2ce4923dc9b5809922)

Data was also scraped from two different websites to create three new datasets:

- Names of all Democratic Presidential Candidates: [What you need to know about the 2020 presidential candidates, in under 500 words](https://www.axios.com/2020-presidential-election-candidate-profiles1552432119-facfee57-8089-4f14-bbdf-dc44ffa0ea4a.html)
- Key Facts, Key Issues, Key Criticisms for all Candidates: [What you need to know about the 2020 presidential candidates, in under 500 words](https://www.axios.com/2020-presidential-election-candidate-profiles1552432119-facfee57-8089-4f14-bbdf-dc44ffa0ea4a.html)
- Voter Choice and Favorability Percentages for all Candidates: [The State of the Democratic Primary](https://morningconsult.com/2020-democratic-primary/)

Correct Usage - Scroller
=========================

Click [here](https://cchinchristopherj.github.io/Candidates-2020/) to access the final scroller.

Initial Display
-------------------------

![scroller_main](https://github.com/cchinchristopherj/Candidates-2020/blob/master/screenshots/scroller_main.png)

User Interactivity: Step 1
-------------------------

![scroller_1](https://github.com/cchinchristopherj/Candidates-2020/blob/master/screenshots/scroller_1.png)

Correct Usage - Web scraper
=========================

If you would like to run the web scraper program to convert raw data from the [Axios website](https://www.axios.com/2020-presidential-election-candidate-profiles1552432119-facfee57-8089-4f14-bbdf-dc44ffa0ea4a.html) and [Morning Consult website](https://morningconsult.com/2020-democratic-primary/) into the .csv and .json files cited previously, run the following command:

        python axios_morningconsult_scraper.py
