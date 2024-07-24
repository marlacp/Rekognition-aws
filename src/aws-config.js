import AWS from 'aws-sdk';

AWS.config.update({
  region: 'us-east-1', 
  accessKeyId: 'YOUR_ACCESS_KEY',
  secretAccessKey: 'YOUR_SECRET'
});


const rekognition = new AWS.Rekognition();
export default rekognition;