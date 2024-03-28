export default function extractUniqueSkills (data) {
  const allSkills = data.reduce((acc, item) => {
    const { mainSkills, otherSkills } = item;
    const skills = [...mainSkills, ...otherSkills];
    return [...acc, ...skills];
  }, []);

  const uniqueSkillsSet = new Set(allSkills);
  const uniqueSkillsArray = [...uniqueSkillsSet].map((skill) => ({ name: skill }));
  
  return uniqueSkillsArray;
};