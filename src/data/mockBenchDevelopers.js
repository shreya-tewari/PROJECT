// 100 Realistic Bench Developers with Employee Codes, Contacts, Profile PDF Links & Video Call availability
export const mockBenchDevelopers = [
  {
    id: "DEV-101",
    empCode: "EMP-101",
    name: "Alex Rivera",
    role: "Full Stack Developer",
    email: "alex.rivera@proposalai.com",
    phone: "+1 (555) 234-5678",
    experienceYears: 6,
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS", "Docker"],
    hourlyRate: 30,
    monthlyCost: 4800,
    status: "Available",
    benchSince: "2026-06-15",
    location: "Austin, TX",
    noticePeriod: "Immediate",
    certifications: ["AWS Certified Solutions Architect", "Node.js Security"],
    pastProjectsCount: 14,
    rating: 4.9,
    profilePdfUrl: "/resumes/EMP-101_Alex_Rivera_Resume.pdf",
    videoAvailable: true,
    bio: "Senior full-stack engineer specializing in scalable SaaS applications, real-time microservices, and GraphQL APIs.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
  },
  {
    id: "DEV-102",
    empCode: "EMP-102",
    name: "Priya Sharma",
    role: "AI Engineer",
    email: "priya.sharma@proposalai.com",
    phone: "+1 (555) 345-6789",
    experienceYears: 5,
    skills: ["Python", "PyTorch", "OpenAI API", "LangChain", "Pinecone", "FastAPI"],
    hourlyRate: 35,
    monthlyCost: 5600,
    status: "Available",
    benchSince: "2026-07-01",
    location: "Bengaluru, IN",
    noticePeriod: "Immediate",
    certifications: ["TensorFlow Developer Certified", "Deep Learning Specialization"],
    pastProjectsCount: 11,
    rating: 4.95,
    profilePdfUrl: "/resumes/EMP-102_Priya_Sharma_Resume.pdf",
    videoAvailable: true,
    bio: "RAG & LLM Specialist. Has built enterprise vector search pipelines, custom agent workflows, and document chat solutions.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250"
  },
  {
    id: "DEV-103",
    empCode: "EMP-103",
    name: "Marcus Vance",
    role: "DevOps Engineer",
    email: "marcus.vance@proposalai.com",
    phone: "+1 (555) 456-7890",
    experienceYears: 8,
    skills: ["AWS", "Kubernetes", "Terraform", "CI/CD", "Docker", "Prometheus"],
    hourlyRate: 28,
    monthlyCost: 4480,
    status: "Available",
    benchSince: "2026-06-20",
    location: "Chicago, IL",
    noticePeriod: "1 Week",
    certifications: ["CKA (Certified Kubernetes Admin)", "AWS DevOps Engineer Professional"],
    pastProjectsCount: 19,
    rating: 4.85,
    profilePdfUrl: "/resumes/EMP-103_Marcus_Vance_Resume.pdf",
    videoAvailable: true,
    bio: "Infrastructure automation expert. Specializes in zero-downtime deployment pipelines, infrastructure as code, and cloud cost optimization.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250"
  },
  {
    id: "DEV-104",
    empCode: "EMP-104",
    name: "Elena Rostova",
    role: "UI/UX Designer",
    email: "elena.rostova@proposalai.com",
    phone: "+1 (555) 567-8901",
    experienceYears: 4,
    skills: ["Figma", "Design Systems", "Prototyping", "User Research", "Tailwind CSS", "Micro-animations"],
    hourlyRate: 25,
    monthlyCost: 4000,
    status: "Available",
    benchSince: "2026-07-05",
    location: "Berlin, DE",
    noticePeriod: "Immediate",
    certifications: ["Google UX Design Professional", "Figma Expert"],
    pastProjectsCount: 16,
    rating: 4.9,
    profilePdfUrl: "/resumes/EMP-104_Elena_Rostova_Resume.pdf",
    videoAvailable: true,
    bio: "Product designer with a strong focus on accessibility, sleek dark mode aesthetics, dynamic design systems, and responsive web workflows.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250"
  },
  {
    id: "DEV-105",
    empCode: "EMP-105",
    name: "David Chen",
    role: "Backend Developer",
    email: "david.chen@proposalai.com",
    phone: "+1 (555) 678-9012",
    experienceYears: 7,
    skills: ["Java", "Spring Boot", "Kafka", "Microservices", "PostgreSQL", "Redis"],
    hourlyRate: 28,
    monthlyCost: 4480,
    status: "Available",
    benchSince: "2026-06-10",
    location: "Toronto, CA",
    noticePeriod: "Immediate",
    certifications: ["Oracle Certified Professional Java SE", "Spring Certified"],
    pastProjectsCount: 22,
    rating: 4.8,
    profilePdfUrl: "/resumes/EMP-105_David_Chen_Resume.pdf",
    videoAvailable: true,
    bio: "High-throughput fintech and enterprise backend architect. Expert in event-driven architecture and distributed caching.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250"
  }
];

const rolesList = [
  { role: "Frontend Developer", skills: ["React", "Redux", "TypeScript", "Next.js", "Tailwind CSS"], rate: 25 },
  { role: "Backend Developer", skills: ["Node.js", "Express", "TypeScript", "MongoDB", "Redis"], rate: 28 },
  { role: "AI Engineer", skills: ["Python", "Django", "FastAPI", "PostgreSQL", "PyTorch", "OpenAI"], rate: 35 },
  { role: "Backend Developer", skills: ["Java", "Spring Boot", "Microservices", "Hibernate", "PostgreSQL"], rate: 28 },
  { role: "Full Stack Developer", skills: ["C#", ".NET Core", "Azure", "SQL Server", "Entity Framework"], rate: 30 },
  { role: "Frontend Developer", skills: ["Angular", "RxJS", "TypeScript", "HTML5", "SCSS"], rate: 25 },
  { role: "Mobile Developer", skills: ["Flutter", "Dart", "Firebase", "State Management", "REST API"], rate: 30 },
  { role: "Mobile Developer", skills: ["Kotlin", "Android SDK", "Jetpack Compose", "Coroutines"], rate: 30 },
  { role: "Mobile Developer", skills: ["Swift", "SwiftUI", "Combine", "iOS SDK", "CoreData"], rate: 30 },
  { role: "DevOps Engineer", skills: ["AWS", "Azure", "GCP", "Terraform", "CloudFormation"], rate: 28 },
  { role: "QA Engineer", skills: ["Selenium", "Cypress", "Python", "Appium", "Jenkins"], rate: 20 },
  { role: "Project Manager", skills: ["Project Management", "Agile", "Jira", "Sprint Planning", "Risk Analysis"], rate: 40 },
  { role: "UI/UX Designer", skills: ["Figma", "User Research", "Wireframing", "Design Systems"], rate: 25 }
];

const firstNames = ["James", "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Lucas", "Isabella", "Mason", "Mia", "Oliver", "Charlotte", "Elijah", "Amelia", "Logan", "Harper", "Benjamin", "Evelyn", "Aarav", "Ananya", "Rohan", "Diya", "Kavya"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Nair", "Rao", "Gupta", "Verma", "Kulkarni"];
const locations = ["San Francisco, CA", "Austin, TX", "New York, NY", "Seattle, WA", "Bengaluru, IN", "Hyderabad, IN", "Toronto, CA", "London, UK", "Berlin, DE"];

for (let i = 6; i <= 100; i++) {
  const roleObj = rolesList[(i - 6) % rolesList.length];
  const fn = firstNames[(i * 3) % firstNames.length];
  const ln = lastNames[(i * 7) % lastNames.length];
  const loc = locations[i % locations.length];
  const exp = 3 + (i % 8);
  const rate = Math.round(roleObj.rate + ((i % 3) * 2));
  const empCode = `EMP-${100 + i}`;
  const status = i % 6 === 0 ? "Allocated" : i % 11 === 0 ? "On Notice" : "Available";

  mockBenchDevelopers.push({
    id: `DEV-${100 + i}`,
    empCode: empCode,
    name: `${fn} ${ln}`,
    role: roleObj.role,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@proposalai.com`,
    phone: `+1 (${300 + (i % 600)}) 555-${2000 + i}`,
    experienceYears: exp,
    skills: [...roleObj.skills, exp > 5 ? "System Architecture" : "Git"],
    hourlyRate: rate,
    monthlyCost: rate * 160,
    status: status,
    benchSince: `2026-0${(i % 6) + 1}-${10 + (i % 15)}`,
    location: loc,
    noticePeriod: i % 4 === 0 ? "2 Weeks" : "Immediate",
    certifications: exp > 6 ? ["Certified Enterprise Professional", "Agile Practitioner"] : ["Certified Specialist"],
    pastProjectsCount: 4 + (i % 18),
    rating: Number((4.5 + ((i % 5) * 0.1)).toFixed(1)),
    profilePdfUrl: `/resumes/${empCode}_${fn}_${ln}_Resume.pdf`,
    videoAvailable: true,
    bio: `Experienced ${roleObj.role} with ${exp} years of track record in scalable software engineering and clean code standards.`,
    avatar: `https://i.pravatar.cc/150?u=${empCode}`
  });
}
