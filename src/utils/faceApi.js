import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export const loadFaceApiModels = async () => {
  if (modelsLoaded) return true;

  try {
    const MODEL_URL = '/models';
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);

    modelsLoaded = true;
    console.log('Face-api.js models loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading face-api.js models:', error);
    return false;
  }
};

export const detectFaceAndGetDescriptor = async (videoElement) => {
  try {
    const detection = await faceapi
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      return { success: false, error: 'No face detected' };
    }

    return {
      success: true,
      descriptor: Array.from(detection.descriptor),
      detection: detection.detection
    };
  } catch (error) {
    console.error('Error detecting face:', error);
    return { success: false, error: error.message };
  }
};

export const drawDetection = (canvas, detectionResult, label = '') => {
  const displaySize = { width: canvas.width, height: canvas.height };
  faceapi.matchDimensions(canvas, displaySize);

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Handle the detection object properly
  if (detectionResult && detectionResult.detection) {
    const resizedDetection = faceapi.resizeResults(detectionResult.detection, displaySize);
    
    // Draw only the detection box
    faceapi.draw.drawDetections(canvas, resizedDetection);

    if (label) {
      const box = resizedDetection.box;
      const drawBox = new faceapi.draw.DrawBox(box, { label });
      drawBox.draw(canvas);
    }
  }
};

export { faceapi };