import React from 'react';
import FaceDetection from './FaceDetection';
import FaceDetecRealTime from './FaceDetecRealTime';
import ObjectDetection from './ObjectDetection';

function App() {
  return (
    <div className="App">
      <h1>Face Detection Demo AWS</h1>
      {/* <ObjectDetection /> */}
      <FaceDetection />
      {/* <FaceDetecRealTime /> */}
    </div>
  );
}

export default App;
