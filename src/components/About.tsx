import React from 'react';
import { Code, Palette, Rocket, Zap } from 'lucide-react';

const coreSkills = [
  { icon: Code, name: 'Web App Development' },
  { icon: Palette, name: 'Front-End Tools' },
  { icon: Rocket, name: 'E-Commerce Solutions' },
  { icon: Zap, name: 'Workflow Automation' },
];

const About: React.FC = () => {
  return (
    <section
      id="about"
      className="min-h-screen bg-white py-24 px-6 flex items-center justify-center"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          <img
            src="https://files.imagetourl.net/uploads/1760358752168-eb843ce2-4540-46f6-b9a1-c6fcc6a4c5cf.jpg"
            alt="Profile"
            className="w-52 h-52 rounded-full object-cover shadow-xl border-4 border-blue-300 hover:scale-105 transition-transform duration-500 ease-in-out"
          />
        </div>

        {/* Text and Skills */}
        <div className="flex-1">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">About Me</h2>

          <p className="text-gray-700 text-lg mb-4 leading-relaxed">
            Hi! I'm a passionate developer specializing in transforming ideas into fully functional web applications and SaaS products. With expertise in modern no-code and AI-assisted development, I help businesses and entrepreneurs bring their visions to life quickly and efficiently.
          </p>

          <p className="text-gray-700 text-lg mb-8 leading-relaxed">
            My goal is to provide high-quality, production-ready solutions that not only look stunning but also deliver exceptional user experiences. Whether you need an e-commerce platform, a subscription service, or a custom web application, I've got you covered.
          </p>

          {/* Core Skills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {coreSkills.map((skill, index) => (
              <div
                key={index}
                className="group relative p-6 bg-gray-100 rounded-lg shadow-md cursor-pointer transition-all duration-500 ease-in-out hover:scale-105 hover:bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500"
              >
                <skill.icon className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors duration-300 mb-2" />
                <p className="text-sm font-semibold text-gray-700 group-hover:text-white transition-colors duration-300">
                  {skill.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
