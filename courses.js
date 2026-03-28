
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
    { id:'se_201', name:'Enterprise Web Development',                        icon:'🌐', color:'#3b82f6', topics:['enterprise web development Node.js Express tutorial','REST API enterprise web app architecture'] },
    { id:'se_202', name:'Foundations Project',                               icon:'🏗️', color:'#8b5cf6', topics:['software project planning agile tutorial','developer project management scrum beginners'] },
    { id:'se_203', name:'Introduction to Software Engineering',              icon:'📋', color:'#f59e0b', topics:['introduction to software engineering tutorial','SDLC software development life cycle explained'] },
    { id:'se_204', name:'Mobile Application Development',                    icon:'📱', color:'#10b981', topics:['mobile app development tutorial Flutter React Native','cross-platform mobile development beginner'] },
    { id:'se_205', name:'Advanced Frontend Web Development',                 icon:'💻', color:'#ef4444', topics:['advanced frontend web development JavaScript tutorial','React advanced components hooks full stack'] },
    { id:'se_206', name:'Programming in C',                                  icon:'⚙️', color:'#06b6d4', topics:['C programming tutorial beginner to advanced','low level programming C language pointers memory'] },
    { id:'se_207', name:'Mathematics for Machine Learning',                  icon:'📊', color:'#f97316', topics:['mathematics for machine learning tutorial','linear algebra calculus statistics ML explained'] },
    { id:'se_208', name:'Programming in C#',                                 icon:'🎮', color:'#64748b', topics:['C# programming tutorial beginner','C sharp Unity AR VR game development tutorial'] },
  ],
  3: [
    { id:'se_301', name:'Linux Programming',                                 icon:'🐧', color:'#3b82f6', topics:['Linux system programming C tutorial','advanced Linux programming processes sockets'] },
    { id:'se_302', name:'Advanced Backend Web Development',                  icon:'🖥️', color:'#8b5cf6', topics:['advanced backend web development tutorial Node.js','Express REST API authentication database advanced'] },
    { id:'se_303', name:'Machine Learning Techniques I',                     icon:'🤖', color:'#f59e0b', topics:['machine learning techniques supervised learning tutorial','classification regression algorithms Python sklearn'] },
    { id:'se_304', name:'Advanced C# Programming',                           icon:'🎮', color:'#10b981', topics:['advanced C# programming tutorial','C sharp advanced OOP Unity AR VR development'] },
    { id:'se_305', name:'Advanced Python Programming',                       icon:'🐍', color:'#ef4444', topics:['advanced Python programming tutorial','Python decorators generators async OOP advanced'] },
    { id:'se_306', name:'Introduction to Machine Learning',                  icon:'🧠', color:'#06b6d4', topics:['introduction to machine learning Python tutorial','scikit-learn ML beginner supervised unsupervised'] },
    { id:'se_307', name:'Introduction to Unity',                             icon:'🎯', color:'#f97316', topics:['Unity tutorial beginner 2024','Unity game development AR VR introduction'] },
    { id:'se_308', name:'Data Structures & Algorithms in C',                 icon:'⚡', color:'#64748b', topics:['data structures algorithms C programming tutorial','linked lists trees graphs C language implementation'] },
    { id:'se_309', name:'React Development',                                 icon:'⚛️', color:'#3b82f6', topics:['React development tutorial 2024','React hooks state management full stack web dev'] },
    { id:'se_310', name:'Machine Learning Techniques II',                    icon:'🧬', color:'#8b5cf6', topics:['machine learning techniques II deep learning tutorial','neural networks convolutional recurrent advanced ML'] },
    { id:'se_311', name:'Introduction to Blockchain Development',            icon:'⛓️', color:'#f59e0b', topics:['blockchain development tutorial beginner','Solidity smart contracts Ethereum Web3 tutorial'] },
    { id:'se_312', name:'AR/VR Development with Unity',                      icon:'🥽', color:'#10b981', topics:['AR VR development Unity tutorial','augmented reality virtual reality Unity XR beginner'] },
    { id:'se_313', name:'Machine Learning Pipeline',                         icon:'🔧', color:'#ef4444', topics:['machine learning pipeline MLOps tutorial','ML workflow data preprocessing training deployment'] },
    { id:'se_314', name:'Blockchain & Applications',                         icon:'🔗', color:'#06b6d4', topics:['blockchain applications Web3 DeFi tutorial','smart contract applications real world blockchain'] },
    { id:'se_315', name:'Advanced DevOps',                                   icon:'🔄', color:'#f97316', topics:['advanced DevOps tutorial CI CD pipeline','Docker Kubernetes GitHub Actions advanced DevOps'] },
  ],
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
const COURSE_MAP = { SE };

function getCourses(program, year) {
  return COURSE_MAP[program]?.[year] || [];
}
