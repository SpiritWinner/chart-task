import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import extractUniqueSkills from "./utils";

const Graph = ({ data }) => {
  const [selectedCompetence, setSelectedCompetence] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);

  const uniqueSkills = extractUniqueSkills(data);

  useEffect(() => {
    drawGraph();
  }, [data, selectedCompetence, selectedSkill]);

  const extractSkills = (skillName) => {
    return data.filter(competence => competence.mainSkills.includes(skillName) || competence.otherSkills.includes(skillName));
  };

  const drawGraph = () => {
   
    d3.select("#skillGraphContainer").selectAll("*").remove();

    const svg = d3.select("#skillGraphContainer").append("svg")
      .attr("width", 1920)
      .attr("height", 1000);

    const radius = 350;
    const centerX = 960;
    const centerY = 450;

    const skillAngles = d3.scaleLinear()
      .domain([0, uniqueSkills.length])
      .range([0, 2 * Math.PI]);

    const competenceAngles = d3.scaleLinear()
      .domain([0, data.length])
      .range([0, 2 * Math.PI]);

    const skills = svg.selectAll(".skill")
      .data(uniqueSkills)
      .enter()
      .append("g")
      .attr("class", "skill")
      .attr("transform", (d, i) => `translate(${centerX + radius * Math.cos(skillAngles(i))}, ${centerY + radius * Math.sin(skillAngles(i))})`)
      .on("click", (event, data) => {
        setSelectedCompetence(null);
        setSelectedSkill(data);
      });

    const competences = svg.selectAll(".competence")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "competence")
      .attr("transform", (d, i) => `translate(${centerX + (radius / 2) * Math.cos(competenceAngles(i))}, ${centerY + (radius / 2) * Math.sin(competenceAngles(i))})`)
      .on("click", (event, d) => { 
        setSelectedSkill(null);
        setSelectedCompetence(d)
      });

    skills.append("circle")
      .attr("r", 18,76)
      .style("fill", "#FFD4AD");

    competences.append("circle")
      .attr("r", 18,76)
      .style("fill", "#ADADAD");


    skills.append("text")
      .text((d) => d.name)
      .attr("text-anchor", "middle")
      .attr("dy", "-1em")
      .attr("fill", "#3A3A3A");

      competences.append("text")
      .attr("text-anchor", "start")
      .attr("fill", "#3A3A3A")
      .selectAll("tspan")
      .data((d) => d.name.split(" ")) 
      .enter().append("tspan")
      .attr("x", '-40px')
      .attr("dy", (d, i) => i > 0 ? "1.5em" : 0) 
      .text((d) => d);
  

    for (let i = 0; i < data.length; i++) {
      const startX = centerX + (radius / 2) * Math.cos(competenceAngles(i));
      const startY = centerY + (radius / 2) * Math.sin(competenceAngles(i));
      const endX = centerX + (radius / 2) * Math.cos(competenceAngles((i + 1) % data.length));
      const endY = centerY + (radius / 2) * Math.sin(competenceAngles((i + 1) % data.length));
      const controlX = centerX + (radius / 2) * Math.cos(competenceAngles((i + 0.5) % data.length));
      const controlY = centerY + (radius / 2) * Math.sin(competenceAngles((i + 0.5) % data.length));
      
      svg.append("path")
        .attr("d", `M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`)
        .attr("fill", "none")
        .attr("stroke", "#ADADAD")
        .attr("stroke-width", 2.35);
    }

    for (let i = 0; i < uniqueSkills.length; i++) {
      const startX = centerX + radius * Math.cos(skillAngles(i));
      const startY = centerY + radius * Math.sin(skillAngles(i));
      const endX = centerX + radius * Math.cos(skillAngles((i + 1) % uniqueSkills.length));
      const endY = centerY + radius * Math.sin(skillAngles((i + 1) % uniqueSkills.length));
      const controlX = centerX + radius * Math.cos(skillAngles((i + 0.5) % uniqueSkills.length));
      const controlY = centerY + radius * Math.sin(skillAngles((i + 0.5) % uniqueSkills.length));
      
      svg.append("path")
        .attr("d", `M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`)
        .attr("fill", "none")
        .attr("stroke", "#ADADAD")
        .attr("stroke-width", 2.35);
    }

    if (selectedSkill) {
      const connectedCompetences = extractSkills(selectedSkill.name);

      for (const competence of connectedCompetences) {
        const isMainSkill = competence.mainSkills.includes(selectedSkill.name);
        const lineColor = isMainSkill ? "orange" : "purple";

        const componentsIndex = uniqueSkills.findIndex(s => s.name === selectedSkill.name);

        const startX = centerX + radius * Math.cos(skillAngles(componentsIndex));
        const startY = centerY + radius * Math.sin(skillAngles(componentsIndex));
        const endX = centerX + (radius / 2) * Math.cos(competenceAngles(data.indexOf(competence)));
        const endY = centerY + (radius / 2) * Math.sin(competenceAngles(data.indexOf(competence)));

        const controlX = (endX + startX) / 2;
        const controlY = (startY + endY) / 2;

        const controlX2 = (startX + controlX) / 2;
        const controlY2 = startY;

        const curve = svg.append("path")
          .attr("fill", "none")
          .attr("stroke", lineColor)
          .attr("stroke-width", 2);
        
        const pathData = `
          M${startX},${startY}
          Q ${controlX2},${controlY2} ${controlX},${controlY}
          T ${endX},${endY}
        `;

        curve.attr("d", pathData);
      };
    }

    if (selectedCompetence) {
      const selectedSkills = [...selectedCompetence.mainSkills, ...selectedCompetence.otherSkills];
  
      for (const skill of selectedSkills) {
        const skillIndex = uniqueSkills.findIndex(s => s.name === skill);
        const startX = centerX + radius * Math.cos(skillAngles(skillIndex));
        const startY = centerY + radius * Math.sin(skillAngles(skillIndex));
        const endX = centerX + (radius / 2) * Math.cos(competenceAngles(data.indexOf(selectedCompetence)));
        const endY = centerY + (radius / 2) * Math.sin(competenceAngles(data.indexOf(selectedCompetence)));

        const controlX = (endX + startX) / 2;
        const controlY = (startY + endY) / 2;

        const controlX2 = (startX + controlX) / 2;
        const controlY2 = startY;
        
        const lineColor = selectedCompetence.mainSkills.includes(skill) ? "orange" : "purple";

        const curve = svg.append("path")
          .attr("fill", "none")
          .attr("stroke", lineColor)
          .attr("stroke-width", 2);
        
        const pathData = `
          M${startX},${startY}
          Q ${controlX2},${controlY2} ${controlX},${controlY}
          T ${endX},${endY}
        `;

        curve.attr("d", pathData);
      }
    }

  };

  return (
    <div id="skillGraphContainer"></div>
  );
};

export default Graph;
