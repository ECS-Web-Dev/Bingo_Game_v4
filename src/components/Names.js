'use client';

export default function Names() {
  const teamMembers = [
  {
    name: "Brajan Memishi",
    role: "Web Development Lead",
    github: "https://github.com/brajanmemishi",
    linkedin: "https://www.linkedin.com/in/USERNAME",
  },
  {
    name: "Elizabeth Ovieda",
    role: "Project Manager",
    github: "hhttps://github.com/eliO160",
    linkedin: "https://www.linkedin.com/in/elizabethovieda/",
  },
  {
    name: "Ellie Fong",
    role: "Developer",
    github: "https://github.com/ellefong",
    linkedin: "https://www.linkedin.com/in/USERNAME",
  },
  {
    name: "Davielle Gilzean",
    role: "Developer",
    github: "https://github.com/Davicodez",
    linkedin: "https://www.linkedin.com/in/davielle-gilzean-75a3a624b/",
  },
  {
    name: "Julie Yun",
    role: "Developer",
    github: "https://github.com/jyun36",
    linkedin: "https://www.linkedin.com/in/julie-yun/",
  },
];

  return (
    <main className="pb-10 px-5">
      <h3 className="m-0 text-center font-bold text-lg mb-6">
        Development Team
      </h3>
      <div className="flex flex-col items-center gap-4">
        {teamMembers.map((member) => (
          <div
            key={member.name}
            className="text-center"
          >
            <div className="font-medium">
              {member.name}
            </div>

            <div className="text-sm text-gray-600">
              {member.role}
            </div>

            <div className="mt-1 text-sm">
              <a
                href={member.github}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                GitHub
              </a>
              {" · "}
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                LinkedIn
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );

}
