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

    function drawCurves(data, anglesFunction, radiusFactor) {
      for (let i = 0; i < data.length; i++) {
        const startX = centerX + (radius * radiusFactor) * Math.cos(anglesFunction(i));
        const startY = centerY + (radius * radiusFactor) * Math.sin(anglesFunction(i));
        const endX = centerX + (radius * radiusFactor) * Math.cos(anglesFunction((i + 1) % data.length));
        const endY = centerY + (radius * radiusFactor) * Math.sin(anglesFunction((i + 1) % data.length));
        const controlX = centerX + (radius * radiusFactor) * Math.cos(anglesFunction((i + 0.5) % data.length));
        const controlY = centerY + (radius * radiusFactor) * Math.sin(anglesFunction((i + 0.5) % data.length));
        
        svg.append("path")
          .attr("d", `M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`)
          .attr("fill", "none")
          .attr("stroke", "#ADADAD")
          .attr("stroke-width", 2.35);
      }
    }
   
    function createCurve(svg, startX, startY, endX, endY, lineColor) {
      const totalLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    
      const curve = svg.append("path")
        .attr("fill", "none")
        .attr("stroke", lineColor)
        .attr("stroke-width", "2px")
        .style("opacity", 0)
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(800)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
        .style("opacity", 1);
    
      const pathData = `
        M${startX},${startY}
        Q ${(startX + ((endX + startX) / 2)) / 2},${startY} ${(endX + startX) / 2},${(startY + endY) / 2}
        T ${endX},${endY}
      `;
    
      curve.attr("d", pathData);
    }

    function calculateCoordinates(centerX, centerY, radius, angle) {
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return { x, y };
    }

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

    drawCurves(data, competenceAngles, 0.5);
    drawCurves(uniqueSkills, skillAngles, 1);

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
      .attr("data-name", (d, i) => `skill-${i}`)
      .attr("fill", "#FFD4AD");
    
    skills.append("circle")
      .attr("r", 13,35)
      .attr("data-name", (d, i) => `skillS-${i}`)
      .attr("fill", "#FFD4AD");

    competences.append("circle")
      .attr("r", 18,76)
      .attr("data-name", (d, i) => `competence-${i}`)
      .attr("fill", "#ADADAD");

    competences.append("circle")
      .attr("r", 13,35)
      .attr("data-name", (d, i) => `competenceS-${i}`)
      .attr("fill", "#ADADAD");

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

    if (selectedSkill) {
      const connectedCompetences = extractSkills(selectedSkill.name);

      for (const competence of connectedCompetences) {

        const isMainSkill = competence.mainSkills.includes(selectedSkill.name);
        const lineColor = isMainSkill ? "orange" : "purple";

        const componentsIndex = uniqueSkills.findIndex(s => s.name === selectedSkill.name);

        const { x: startX, y: startY } = calculateCoordinates(centerX, centerY, radius, skillAngles(componentsIndex));
        const { x: endX, y: endY } = calculateCoordinates(centerX, centerY, radius / 2, competenceAngles(data.indexOf(competence)));

        const skillElement = svg.selectAll(`[data-name="skill-${componentsIndex}"]`);
        const skillElementS = svg.selectAll(`[data-name="skillS-${componentsIndex}"]`);

        if (skillElement) {
          skillElement.attr("fill", "white")
            .attr("stroke", "#FF7A00")
          skillElementS.style("fill", "#FF7A00");
        }

        createCurve(svg, startX, startY, endX, endY, lineColor);

        const componentsElement = svg.selectAll(`[data-name="competence-${data.indexOf(competence)}"]`);
        const componentsElementS = svg.selectAll(`[data-name="competenceS-${data.indexOf(competence)}"]`);
          if (componentsElement) {
            componentsElement.style("fill", "#00A372");
            componentsElementS.style("fill", "#00A372");
          }
      };
    }

    if (selectedCompetence) {
      const selectedSkills = [...selectedCompetence.mainSkills, ...selectedCompetence.otherSkills].map( skill => ({name : skill}));

      const componentsElement = svg.selectAll(`[data-name="competence-${data.indexOf(selectedCompetence)}"]`);
      const componentsElementS = svg.selectAll(`[data-name="competenceS-${data.indexOf(selectedCompetence)}"]`);
        
      if (componentsElement) {
        componentsElement
          .attr("fill", "white")
          .attr("stroke", "#00A372");
        componentsElementS
          .attr("fill", "#00A372");
      }
  
      for (const skill of selectedSkills) {

        const isMainSkill = selectedCompetence.mainSkills.includes(skill.name);
        const lineColor = isMainSkill ? "orange" : "purple";

        const skillIndex = uniqueSkills.findIndex(s => s.name === skill.name);

        const { x: startX, y: startY } = calculateCoordinates(centerX, centerY, radius / 2, competenceAngles(data.indexOf(selectedCompetence)));
        const { x: endX, y: endY } = calculateCoordinates(centerX, centerY, radius, skillAngles(skillIndex));

        createCurve(svg, startX, startY, endX, endY, lineColor);

        const skillElement = svg.selectAll(`[data-name="skill-${skillIndex}"]`);
        const skillElementS = svg.selectAll(`[data-name="skillS-${skillIndex}"]`);
          if (skillElement) {
            skillElement.style("fill", "#FF7A00");
            skillElementS.style("fill", "#FF7A00");
          }
      };
    }
    
  };

  return (
    <div id="skillGraphContainer"></div>
  );
};

export default Graph;
