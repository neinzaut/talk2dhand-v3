import React from 'react';

const StarterPage = () => {
  return (
    <div className="starter-page" style={{ backgroundImage: "url('/path-to-background-pattern.jpg')" }}>
      <div className="starter-overlay">
        <h1 className="text-4xl font-bold mb-4 text-blue-500">Welcome to Talk2DHand</h1>
        <p className="mb-4 text-blue-500">
          Render's limits may cause difficulties in performing this on your local machine. View the video demo to see how Talk2DHand works.
        </p>
        <div className="mb-4">
          <iframe
            src="https://drive.google.com/file/d/1mFtealLhmXdaS_hjkpm4lIHvJiNM5_3G/preview"
            width="800"
            height="450"
            allow="autoplay"
            className="rounded-md border border-gray-300"
            title="Talk2DHand Video Demo"
          ></iframe>
        </div>
        <p className="mb-4 text-blue-500">
          If you'd like to test it in full without errors, contact the following developers: <br />
          <a href="mailto:leb0006@dlsud.edu.ph" className="underline">leb0006@dlsud.edu.ph</a>, <a href="mailto:tfa2079@dlsud.edu.ph" className="underline">tfa2079@dlsud.edu.ph</a>, <a href="mailto:vko2058@dlsud.edu.ph" className="underline">vko2058@dlsud.edu.ph</a>
        </p>
        <p className="mb-8 text-blue-500">
          Note: AI Converse is only accessible through the video demo and local hosting for now.
        </p>
        <a href="/learn" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Go to Dashboard</a>
      </div>
    </div>
  );
};

export default StarterPage;