import { fetchJSON, renderProjects } from "../global.js";
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

/* loading project data to html */
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

let title = document.querySelector('.projects-title')
title.prepend(`${projects.length} `)

let currentFilters  = {year: '', query: ''}; // keeps track of current filters being applied
function applyFilter(year, query) {
    // returns a filtered version of projects that filters on both year and query
    let queryFiltered = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });

    if(year != '') {
        let yearFiltered = queryFiltered.filter((project) => {
            return project.year.includes(year);
        })
        return yearFiltered
    }

    return queryFiltered;
}

/* plotting helpers */
let selectedIndex = -1;
function renderPieChart(projectsGiven) {
    let arcGenerator = d3.arc().innerRadius(10).outerRadius(50)
    let colors = d3.scaleOrdinal(d3.schemeTableau10); // specifying color scale

    // re-calculate rolled data
    let rolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year,
    );

    // re-calculate data
    let data = rolledData.map(([year, count]) => {
        return { value: count, label: year };
    });
    // re-calculate slice generator, arc data, arc, etc
    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data); // audtomatically generates the angles we need
    let arcs = arcData.map((d) => arcGenerator(d)); // turns the list of angles into svg paths
    
    // clear up paths and legends
    let plot = d3.select('#projects-plot');
    let legend = d3.select('.legend');
    plot.selectAll('path').remove();;
    legend.selectAll('li').remove();

    if(!projectsGiven || projectsGiven.length == 0){ // incase query returns nothing
        let arc = arcGenerator({startAngle: 0, endAngle: 2 * Math.PI});
        plot.append('path').attr('d', arc).attr('fill', colors(0));
        legend.append('li').html(`No Data to Display`)

        return;
    }

    console.log(data);

    /* interactive chart */
    arcs.forEach((arc, i) => { // redraw the plot
        plot
            .append('path')
            .attr('d', arc)
            .attr('fill', colors(i)) 
            .attr('class', 
                //newData[idx].label === selectedYear ? 'selected' : ''
                // filter idx to find correct pie slice and apply CSS from above
                selectedIndex == i ? 'selected' : ''
            )
            .on('click', () => {
                selectedIndex = selectedIndex === i ? -1 : i; // facilitate deselection
                currentFilters.year = selectedIndex === -1 ? '' : data[selectedIndex].label;
                
                plot
                    .selectAll('path')
                    .attr('class', (_, idx) => (
                        // filter idx to find correct pie slice and apply CSS from above
                        selectedIndex == idx ? 'selected' : ''
                    ));
                
                legend
                    .selectAll('li')
                    .attr('class', (_,idx) => (
                        selectedIndex == idx ? 'selected' : ''
                    ));
                
                if (selectedIndex === -1) {
                    let filteredProjects = applyFilter('', currentFilters.query);
                    renderProjects(filteredProjects, projectsContainer, 'h2');
                } else {
                    let filteredProjects = projects.filter((project) => {
                        return project.year.includes(data[selectedIndex].label);
                    })
                    filteredProjects = applyFilter(currentFilters.year, currentFilters.query);
                    renderProjects(filteredProjects, projectsContainer, 'h2');
                }
            });
    });
    
    data.forEach((d, idx) => {
        legend
            .append('li')
            .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
    });

}


/* d3 pie chart */
renderPieChart(projects);

/* interactive querying */
let query = '';
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
    // update query value
    query = event.target.value;
    currentFilters.query = query;

    // filter the projects
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });
    let yearFilteredProjects = applyFilter(currentFilters.year, currentFilters.query);

    // render updated projects
    renderProjects(yearFilteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
});

