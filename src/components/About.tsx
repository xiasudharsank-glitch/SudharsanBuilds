<section id="about" className="bg-white py-16 px-6">
  <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
    {/* Profile Image */}
    <div className="flex-shrink-0">
      <img
        src="https://files.imagetourl.net/uploads/1760358752168-eb843ce2-4540-46f6-b9a1-c6fcc6a4c5cf.jpg"
        alt="Profile"
        className="w-48 h-48 rounded-full object-cover shadow-xl border-4 border-gray-200 hover:scale-105 transition-transform duration-500 ease-in-out"
      />
    </div>

    {/* Text Content */}
    <div className="flex-1">
      <h2 className="text-4xl font-bold text-gray-800 mb-4">Hi, I'm Udharsan</h2>
      <p className="text-gray-600 text-lg mb-6">
        I specialize in transforming ideas into fully functional web applications and SaaS products...
      </p>

      {/* Core Skills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {about.map((item, index) => (
          <div
            key={index}
            className="group relative p-4 bg-gray-100 rounded-lg shadow-md hover:bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-in-out cursor-pointer"
          >
            <item.icon className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors duration-300" />
            <p className="text-sm font-semibold text-gray-700 group-hover:text-white transition-colors duration-300">
              {item.name}
            </p>

            {/* Hover Reveal Box */}
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center rounded-lg">
              <p className="text-md font-bold text-purple-700">{item.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>
