
const ALU_PROGRAMS = {
  SE: { label: 'Software Engineering', icon: '💻', color: '#6366f1' },
};


const SE = {
  1: [
    { id:'se_101', name:'Introduction to Python Programming and Databases', icon:'🐍', color:'#3b82f6', topics:['Python programming for beginners tutorial','Python databases SQL sqlite beginner'] },
    { id:'se_102', name:'Introduction to Linux and IT Tools',               icon:'🐧', color:'#8b5cf6', topics:['Linux for beginners full tutorial','Linux command line IT tools explained'] },
    { id:'se_103', name:'Frontend Web Development',                         icon:'🌐', color:'#f59e0b', topics:['HTML CSS JavaScript tutorial beginner','frontend web development crash course'] },
    { id:'se_104', name:'Web Infrastructure',                               icon:'🖥️', color:'#10b981', topics:['web infrastructure tutorial','servers networking web hosting basics explained'] },
  ],
  2: [
    { id:'se_201', name:'Algorithms & Complexity',         icon:'⚙️', color:'#3b82f6', topics:['algorithms tutorial','sorting searching algorithms big O notation'] },
    { id:'se_202', name:'Database Systems',                icon:'🗄️', color:'#8b5cf6', topics:['SQL database tutorial','relational database design normalization'] },
    { id:'se_203', name:'Object-Oriented Programming',     icon:'🧱', color:'#f59e0b', topics:['object oriented programming tutorial','OOP concepts classes objects'] },
    { id:'se_204', name:'Probability & Statistics',        icon:'📊', color:'#10b981', topics:['probability statistics computer science','statistics tutorial beginner'] },
    { id:'se_205', name:'Operating Systems',               icon:'🖥️', color:'#ef4444', topics:['operating systems tutorial','processes threads memory management'] },
    { id:'se_206', name:'Full Stack Web Development',      icon:'🌐', color:'#06b6d4', topics:['full stack web development tutorial','React Node.js Express MERN stack'] },
    { id:'se_207', name:'Computer Networks',               icon:'🔗', color:'#f97316', topics:['computer networks tutorial','TCP IP networking basics'] },
    { id:'se_208', name:'Software Engineering Principles', icon:'📋', color:'#64748b', topics:['software engineering principles','SDLC agile scrum tutorial'] },
  ],
  3: [
    { id:'se_301', name:'Artificial Intelligence',         icon:'🤖', color:'#3b82f6', topics:['artificial intelligence tutorial beginner','machine learning crash course'] },
    { id:'se_302', name:'Mobile App Development',          icon:'📱', color:'#8b5cf6', topics:['Flutter mobile app tutorial','React Native beginner tutorial'] },
    { id:'se_303', name:'Cloud Computing',                 icon:'☁️', color:'#f59e0b', topics:['AWS cloud computing tutorial','cloud computing basics DevOps'] },
    { id:'se_304', name:'Cybersecurity Fundamentals',      icon:'🔐', color:'#10b981', topics:['cybersecurity fundamentals tutorial','ethical hacking beginners'] },
    { id:'se_305', name:'Machine Learning',                icon:'🧠', color:'#ef4444', topics:['machine learning tutorial Python','scikit-learn neural networks beginner'] },
    { id:'se_306', name:'Distributed Systems',             icon:'🕸️', color:'#06b6d4', topics:['distributed systems tutorial','microservices Docker Kubernetes'] },
    { id:'se_307', name:'Human-Computer Interaction',      icon:'🖱️', color:'#f97316', topics:['UX UI design tutorial','Figma design tutorial beginner'] },
    { id:'se_308', name:'Entrepreneurship & Innovation',   icon:'💡', color:'#64748b', topics:['tech entrepreneurship tutorial','lean startup methodology'] },
  ],
  4: [
    { id:'se_401', name:'Advanced Algorithms',             icon:'⚡', color:'#3b82f6', topics:['advanced algorithms dynamic programming tutorial','graph algorithms explained'] },
    { id:'se_402', name:'Blockchain & Web3',               icon:'⛓️', color:'#8b5cf6', topics:['blockchain development tutorial','Solidity smart contracts beginner'] },
    { id:'se_403', name:'Data Engineering',                icon:'🔧', color:'#f59e0b', topics:['data engineering tutorial','ETL pipelines Python Apache Spark'] },
    { id:'se_404', name:'System Design',                   icon:'🏗️', color:'#10b981', topics:['system design tutorial','scalable system design interview'] },
    { id:'se_405', name:'DevOps & CI/CD',                  icon:'🔄', color:'#ef4444', topics:['DevOps tutorial beginner','CI CD pipeline GitHub Actions Docker'] },
    { id:'se_406', name:'Research Methods',                icon:'🔬', color:'#06b6d4', topics:['research methods computer science','how to write a research paper'] },
    { id:'se_407', name:'Professional Ethics in Tech',     icon:'⚖️', color:'#f97316', topics:['tech ethics tutorial','AI ethics responsible technology'] },
    { id:'se_408', name:'Capstone Project',                icon:'🎓', color:'#64748b', topics:['software capstone project tutorial','full stack project build'] },
  ],
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
const COURSE_MAP = { SE };

function getCourses(program, year) {
  return COURSE_MAP[program]?.[year] || [];
}
