import React from 'react';

const ScoreboardHeader = ({ matchInfo, matchData, lsLogo }) => {
    return (
        <>
            {/* Logo List */}
            {lsLogo.length > 0 ? (
                <div className="w-full max-w-7xl mx-auto mb-3 mt-3">
                    <div className="flex justify-center items-center gap-8 px-8">
                        {lsLogo.map((logo, index) => (
                            <div
                                key={logo.id || index}
                                className="flex justify-center items-center hover:shadow-xl transition-shadow rounded"
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

            {/* Competition Header */}
            <div className="text-center mb-8 max-w-7xl mx-auto">
                <h1
                    className="text-4xl font-black leading-tight uppercase"
                    style={{
                        color: matchInfo?.config_system?.header_title_color_doikhang || '#FBBF24'
                    }}
                >
                    {matchInfo.ten_giai_dau?.split("\n").map((word, index) => (
                        <React.Fragment key={index}>
                            {word}
                            {index < matchInfo.ten_giai_dau.split(" ").length - 1 && <br />}
                        </React.Fragment>
                    ))}
                </h1>
                <div
                    className="h-1 w-48 mx-auto my-4"
                    style={{
                        backgroundColor: matchInfo?.config_system?.header_title_color_doikhang || '#FBBF24'
                    }}
                ></div>
                <p
                    className="text-3xl mt-3 font-bold uppercase tracking-wider"
                    style={{
                        color: matchInfo?.config_system?.header_desc_color_doikhang || '#D1D5DB'
                    }}
                >
                    {matchInfo.ten_mon_thi}
                </p>
            </div>
        </>
    );
};

export default ScoreboardHeader;
