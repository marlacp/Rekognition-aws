import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import rekognition from './aws-config';

const FaceDetecRealTime = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [boundingBox, setBoundingBox] = useState(null);

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
        const faceDetail = data.FaceDetails[0];
        console.log("faceDetail", faceDetail);
        const box = faceDetail.BoundingBox;
        setBoundingBox(box);
      }
    });
  };

  useEffect(() => {
    // Establece el intervalo para ejecutar cada 500 milisegundos
    const interval = setInterval(() => {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          detectFace(imageSrc);
        }
      }
    }, 500); // Captura cada 500 milisegundos (0.5 segundos)
    // }, 1000); // Captura cada  segundo
  
    // Establece un temporizador para detener el intervalo después de 30 segundos
    const timer = setTimeout(() => {
      clearInterval(interval);
    }, 30000); // Detiene después de 30 segundos
  
    // Limpieza: cancela el intervalo y el temporizador cuando el componente se desmonta
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);  

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
    </div>
  );
};

export default FaceDetecRealTime;