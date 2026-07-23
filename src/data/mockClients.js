// Enterprise Clients Data with Name, Email, and Phone Number
export const mockClients = [
  {
    id: "CLI-201",
    name: "FinTech Global Labs",
    industry: "Financial Services",
    country: "United States",
    contactPerson: "Sarah Jenkins (VP of Tech)",
    email: "sarah.jenkins@fintechglobal.com",
    phone: "+1 (555) 234-8901",
    activeProjects: 3,
    totalBudgetSpent: 385000,
    status: "Active",
    avatar: "FG"
  },
  {
    id: "CLI-202",
    name: "HealthPulse Diagnostics",
    industry: "Healthcare & Biotech",
    country: "United Kingdom",
    contactPerson: "Dr. Robert Vance (CTO)",
    email: "robert.vance@healthpulse.io",
    phone: "+44 20 7946 0912",
    activeProjects: 2,
    totalBudgetSpent: 220000,
    status: "Active",
    avatar: "HP"
  },
  {
    id: "CLI-203",
    name: "OmniCart E-Commerce",
    industry: "Retail & E-Commerce",
    country: "Germany",
    contactPerson: "Lukas Weber (Director of Ops)",
    email: "lukas.weber@omnicart.de",
    phone: "+49 30 1234567",
    activeProjects: 4,
    totalBudgetSpent: 510000,
    status: "Active",
    avatar: "OC"
  },
  {
    id: "CLI-204",
    name: "LogiNext Freight Systems",
    industry: "Logistics & Supply Chain",
    country: "Singapore",
    contactPerson: "Keng Tan (Head of Digital)",
    email: "keng.tan@loginext.sg",
    phone: "+65 6789 0123",
    activeProjects: 1,
    totalBudgetSpent: 145000,
    status: "Prospect",
    avatar: "LN"
  },
  {
    id: "CLI-205",
    name: "EduSpark Learning Network",
    industry: "EdTech",
    country: "Canada",
    contactPerson: "Emily Ross (Product Lead)",
    email: "emily.ross@eduspark.ca",
    phone: "+1 (416) 555-0198",
    activeProjects: 2,
    totalBudgetSpent: 190000,
    status: "Active",
    avatar: "ES"
  }
];

const industries = ["FinTech", "Healthcare", "E-Commerce", "SaaS", "Logistics", "Cybersecurity", "Energy & Utilities", "Telecommunications", "Media & Entertainment", "Real Estate Tech"];
const countries = ["United States", "United Kingdom", "Germany", "Canada", "Australia", "Singapore", "Japan", "Switzerland", "Netherlands", "United Arab Emirates"];
const clientCompanies = ["Apex Dynamics", "Vortex Cyber", "CloudScale Systems", "BlueHorizon Energy", "Quantum Edge", "NextGen Bio", "HyperSpeed Networks", "Titanium Media", "Veritas Capital Tech", "Starlight Pay", "Nexus Robotics", "AeroSpace Tech", "GreenGrid Energy", "Nova Retail", "Civic Tech Solutions"];

for (let i = 6; i <= 50; i++) {
  const compName = `${clientCompanies[(i - 6) % clientCompanies.length]} ${i > 20 ? 'Group' : 'Inc'}`;
  const ind = industries[i % industries.length];
  const cntry = countries[i % countries.length];
  const cleanName = compName.toLowerCase().replace(/[^a-z0-9]/g, '');
  mockClients.push({
    id: `CLI-${200 + i}`,
    name: compName,
    industry: ind,
    country: cntry,
    contactPerson: `Exec Contact ${i}`,
    email: `contact@${cleanName}.com`,
    phone: `+1 (${400 + (i % 500)}) 555-${1000 + i}`,
    activeProjects: (i % 3) + 1,
    totalBudgetSpent: 75000 + (i * 12500),
    status: i % 5 === 0 ? "Prospect" : "Active",
    avatar: compName.substring(0, 2).toUpperCase()
  });
}
