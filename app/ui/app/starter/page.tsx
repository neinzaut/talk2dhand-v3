import React from 'react';

const StarterPage = () => {
  return (
    <div className="starter-page-container">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-12 max-w-5xl">
        <h1 className="text-6xl font-extrabold mb-8 text-blue-600 text-center">Welcome to Talk2DHand</h1>
        <p className="mb-8 text-xl text-gray-800 text-center">
          Render's limits may cause difficulties in performing this on your local machine. View the video demo below to see how Talk2DHand works.
        </p>
        <div className="mb-8 flex justify-center">
          <iframe
            src="https://drive.google.com/file/d/1mFtealLhmXdaS_hjkpm4lIHvJiNM5_3G/preview"
            width="800"
            height="450"
            allow="autoplay"
            className="rounded-lg shadow-lg border-4 border-blue-500"
            title="Talk2DHand Video Demo"
          ></iframe>
        </div>
        <p className="mb-6 text-lg text-gray-800 text-center">
          If you'd like to test it in full without errors, contact the following developers: <br />
          <a href="mailto:leb0006@dlsud.edu.ph" className="text-blue-600 hover:text-blue-800 underline font-semibold">leb0006@dlsud.edu.ph</a>, <a href="mailto:tfa2079@dlsud.edu.ph" className="text-blue-600 hover:text-blue-800 underline font-semibold">tfa2079@dlsud.edu.ph</a>, <a href="mailto:vko2058@dlsud.edu.ph" className="text-blue-600 hover:text-blue-800 underline font-semibold">vko2058@dlsud.edu.ph</a>
        </p>
        <p className="mb-10 text-lg text-gray-800 text-center font-semibold">
          Note: AI Converse is only accessible through the video demo and local hosting for now.
        </p>
        <div className="flex justify-center">
          <a href="/learn" className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-4 px-8 rounded-lg shadow-lg text-xl transition-colors">Go to Dashboard</a>
        </div>
      </div>
    </div>
  );
};

export default StarterPage;