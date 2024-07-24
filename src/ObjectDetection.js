import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import rekognition from './aws-config';

const ObjectDetection = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [detectedObjects, setDetectedObjects] = useState([]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    detectObjects(imageSrc);
  }, [webcamRef]);

//* detecta cualquier objeto

  // const detectObjects = (imageData) => {
  //   const base64Image = imageData.split(",")[1];
  //   const binaryImg = atob(base64Image);
  //   const length = binaryImg.length;
  //   const ab = new ArrayBuffer(length);
  //   const ua = new Uint8Array(ab);
  //   for (let i = 0; i < length; i++) {
  //     ua[i] = binaryImg.charCodeAt(i);
  //   }

  //   const params = {
  //     Image: {
  //       Bytes: ab
  //     },
  //     MaxLabels: 10,
  //     MinConfidence: 70
  //   };
  //   rekognition.detectLabels(params, (err, data) => {
  //     if (err) console.log(err, err.stack);
  //     else {
  //       console.log("data", data);
  //       const objectsWithLabels = data.Labels.reduce((acc, label) => {
  //         // Agrega el nombre de la etiqueta a cada instancia de objeto detectado
  //         const instancesWithLabel = label.Instances.map(instance => ({
  //           ...instance,
  //           LabelName: label.Name // Agrega el nombre de la etiqueta al objeto
  //         }));
  //         return acc.concat(instancesWithLabel); // Acumula todos los objetos con sus etiquetas
  //       }, []);

  //       setDetectedObjects(objectsWithLabels);
  //     }
  //   });
  // };

//* detecta solo los documentos y las tarjetas de identificación
const detectObjects = (imageData) => {
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
      MaxLabels: 10,
      MinConfidence: 70
    };
  
    rekognition.detectLabels(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
      } else {
        console.log("data", data);
  
        // Filtra los labels para incluir solo los preferidos, si están presentes
        const preferredLabels = ["Id Cards", "Document", "Driving License"];
        const filteredLabels = data.Labels.filter(label => preferredLabels.includes(label.Name) && label.Instances.length > 0);
  
        console.log("filteredLabels", filteredLabels);
        if (filteredLabels.length > 0) {
          // Selecciona el label de mayor confianza que tenga instancias
          const mostConfidentLabel = filteredLabels.reduce((acc, label) => label.Confidence > acc.Confidence ? label : acc, filteredLabels[0]);
        
          // Prepara las instancias del label seleccionado para establecer en el estado
          const instancesWithLabel = mostConfidentLabel.Instances.map(instance => ({
            ...instance,
            LabelName: mostConfidentLabel.Name // Agrega el nombre de la etiqueta al objeto
          }));
  
          // Setea las instancias en el estado
          setDetectedObjects(instancesWithLabel);
        } else {
          // Si no hay labels preferidos con instancias, limpia el estado o maneja como veas necesario
          setDetectedObjects([]);
        }
      }
    });
  };
//** */
  useEffect(() => {
    console.log("detectedObjects", detectedObjects);
    if (detectedObjects.length > 0 && webcamRef.current) {
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
      ctx.font = '16px Arial';
      ctx.fillStyle = 'yellow';
  
      detectedObjects.forEach(object => {
        if (object.BoundingBox) {
          const box = object.BoundingBox;
          const rectX = box.Left * canvas.width * scaleWidth;
          const rectY = box.Top * canvas.height * scaleHeight;
          const rectWidth = box.Width * canvas.width * scaleWidth;
          const rectHeight = box.Height * canvas.height * scaleHeight;
  
          // Dibuja el recuadro
          ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
  
          // Dibuja el nombre de la etiqueta encima del recuadro
          if (object.LabelName) {
            ctx.fillText(object.LabelName, rectX, rectY - 5);
          }
        }
      });
    }
  }, [detectedObjects]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        style={{ position: 'absolute' }}
      />
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      <button onClick={capture} style={{ position: 'absolute', zIndex: 1 }}>Detect Objects</button>
    </div>
  );
};

export default ObjectDetection;