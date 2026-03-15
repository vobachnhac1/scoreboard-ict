import React from "react";

/**
 * Header Component
 * @param {string} title - Main title text
 * @param {string} desc - Description text
 * @param {Array} logos - Array of logo objects
 * @param {Object} config - Configuration object for styling
 * @param {string} config.titleColor - Title text color (Tailwind class or gradient)
 * @param {string} config.descColor - Description text color (Tailwind class)
 * @param {string} config.backgroundColor - Background color (Tailwind class)
 * @param {string} config.decorativeLineColors - Decorative line gradient colors
 */
export default function Header({ title, desc, logos, config = {} }) {
  // Default configuration
  const defaultConfig = {
    titleColor:
      "bg-gradient-to-r from-white via-white to-white bg-clip-text text-transparent",
    descColor: "text-yellow-300",
    backgroundColor:
      "bg-gradient-to-r from-transparent via-white/10 to-transparent",
    decorativeLineColors: {
      left: "from-transparent to-yellow-500",
      center: "from-yellow-500 via-yellow-500 to-yellow-500",
      right: "from-yellow-500 to-transparent",
    },
  };

  // Merge config with defaults
  const finalConfig = { ...defaultConfig, ...config };

  // Helper to determine if a color string is a Tailwind class or a hex/rgba color
  const isTailwindClass = (color) => {
    if (!color) return true;
    return color.startsWith('text-') || color.startsWith('bg-') || color.startsWith('from-');
  };

  return (
    <div className="text-center text-white w-full max-w-6xl">

      {/* Thiết kế hiển thị danh sách Logo - Căn giữa hàng ngang */}
      {logos.length > 0 ? (
        <div className="w-full max-w-7xl mx-auto mb-3 mt-3">
          <div className="flex justify-center items-center gap-8 px-8">
            {logos.map((logo, index) => (
              <div
                key={logo.id || index}
                className="flex justify-center items-center shadow-lg hover:shadow-xl transition-shadow rounded"
                style={{ minWidth: "50px", maxWidth: "50px" }}
              >
                <img
                  src={
                    logo.url.startsWith("http")
                      ? logo.url
                      : `http://localhost:6789${logo.url}`
                  }
                  alt={`Logo ${index + 1}`}
                  className="h-20 w-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-7xl mx-auto mb-6 mt-6" />
      )}

      {/* Header */}
      <div className="text-center mb-2 max-w-7xl mx-auto">
        <h1
          className={`text-4xl font-black leading-tight uppercase ${isTailwindClass(finalConfig.titleColor) ? finalConfig.titleColor : ''}`}
          style={!isTailwindClass(finalConfig.titleColor) ? { color: finalConfig.titleColor } : {}}
        >
          {/* Tự động xuống dòng mỗi từ */}
          {title?.split("\n").map((word, index) => (
            <React.Fragment key={index}>
              {word}
              {index < title.split(" ").length - 1 && <br />}
            </React.Fragment>
          ))}
        </h1>
        <div
          className="h-1 w-48 mx-auto my-4"
          style={{ backgroundColor: !isTailwindClass(finalConfig.titleColor) ? finalConfig.titleColor : '#FBBF24' }} // default yellow-400
        ></div>
        <p
          className={`text-3xl mt-3 font-bold uppercase tracking-wider ${isTailwindClass(finalConfig.descColor) ? finalConfig.descColor : ''}`}
          style={!isTailwindClass(finalConfig.descColor) ? { color: finalConfig.descColor } : {}}
        >
          {desc}
        </p>
      </div>
    </div>
  );
}
