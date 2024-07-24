import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import rekognition from './aws-config';

const FaceDetection = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [boundingBox, setBoundingBox] = useState(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    detectFace(imageSrc);
  }, [webcamRef]);

  const detectFace = (imageData) => {
    const base64Image = imageData.split(",")[1];
    const binaryImg = atob(base64Image);
    const length = binaryImg.length;
    const ab = new ArrayBuffer(length);
    const ua = new Uint8Array(ab);
    for (let i = 0; i < length; i++) {
      ua[i] = binaryImg.charCodeAt(i);
    }

    const params = {
        Image: {
          Bytes: ab
        },
        Attributes: ['ALL']
      };

      rekognition.detectFaces(params, (err, data) => {
        if (err) console.log(err, err.stack);
        else if (data.FaceDetails.length > 0) {
          console.log("data", data);
          const faceDetail = data.FaceDetails[0];
          const box = faceDetail.BoundingBox;
          setBoundingBox(box);
      
          // // Imprimir las coordenadas de características faciales específicas
          // faceDetail.Landmarks.forEach(landmark => {
          //   console.log(`${landmark.Type}: X=${landmark.X}, Y=${landmark.Y}`);
          // });
          console.log("faceDetail", faceDetail);
        }
      });
  };

  useEffect(() => {
    console.log("boundingBox",boundingBox);
    if (boundingBox && webcamRef.current) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const { width, height } = video.getBoundingClientRect();
      const scaleWidth = width / video.videoWidth;
      const scaleHeight = height / video.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        boundingBox.Left * canvas.width * scaleWidth,
        boundingBox.Top * canvas.height * scaleHeight,
        boundingBox.Width * canvas.width * scaleWidth,
        boundingBox.Height * canvas.height * scaleHeight
      );
    }
  }, [boundingBox]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        style={{ position: 'absolute' }}
      />
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      <button onClick={capture} style={{ position: 'absolute', zIndex: 1 }}>Detect Face</button>
    </div>
  );
};

export default FaceDetection;
