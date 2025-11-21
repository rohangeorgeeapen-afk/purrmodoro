import React, { useState, useEffect } from 'react';
import { TimerMode } from '../types';

const STUDY_IMAGES = ['/Doodle/S1.jpeg', '/Doodle/S2.jpeg', '/Doodle/S3.jpg'];
const REST_IMAGES = ['/Doodle/R1.jpeg', '/Doodle/R2.jpeg', '/Doodle/R3.jpeg', '/Doodle/R4.jpg'];
const END_STUDY_IMAGES = ['/Doodle/E1.jpeg', '/Doodle/E2.jpeg', '/Doodle/E3.jpeg'];
const HALF_BREAK_IMAGES = ['/Doodle/I1.jpeg', '/Doodle/I2.jpeg', '/Doodle/I3.jpeg', '/Doodle/I4.jpeg'];
const ALMOST_DONE_IMAGE = '/Doodle/Almost done.jpeg';
const END_BREAK_IMAGE = '/Doodle/End Of Break.jpeg';

interface CatMascotProps {
  mode: TimerMode;
  isActive: boolean;
  timeLeft: number;
  totalTime: number;
}

const CatMascot: React.FC<CatMascotProps> = ({ mode, isActive, timeLeft, totalTime }) => {
  const [currentImage, setCurrentImage] = useState<string>('');
  const [endStudyImage, setEndStudyImage] = useState<string>('');
  const [halfBreakImage, setHalfBreakImage] = useState<string>('');

  const isWork = mode === TimerMode.WORK;
  const progress = 1 - (timeLeft / totalTime);
  const showAlmostDone = isWork && progress >= 0.75 && timeLeft > 0;
  const showEndStudy = isWork && timeLeft === 0;
  const showHalfBreak = !isWork && progress >= 0.5 && timeLeft > 0;
  const showEndBreak = !isWork && timeLeft === 0;

  // Preload all images on mount
  useEffect(() => {
    const allImages = [
      ...STUDY_IMAGES, 
      ...REST_IMAGES, 
      ...END_STUDY_IMAGES,
      ...HALF_BREAK_IMAGES,
      ALMOST_DONE_IMAGE,
      END_BREAK_IMAGE
    ];
    allImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    // Pick a random image when mode changes
    if (isWork) {
      const randomIndex = Math.floor(Math.random() * STUDY_IMAGES.length);
      setCurrentImage(STUDY_IMAGES[randomIndex]);
      // Pick random end study image
      const endIndex = Math.floor(Math.random() * END_STUDY_IMAGES.length);
      setEndStudyImage(END_STUDY_IMAGES[endIndex]);
    } else {
      // For rest modes, pick a different image than the current one
      const availableImages = REST_IMAGES.filter(img => img !== currentImage);
      const randomIndex = Math.floor(Math.random() * availableImages.length);
      setCurrentImage(availableImages[randomIndex] || REST_IMAGES[0]);
      // Pick random half break image
      const halfIndex = Math.floor(Math.random() * HALF_BREAK_IMAGES.length);
      setHalfBreakImage(HALF_BREAK_IMAGES[halfIndex]);
    }
  }, [mode]);

  // Determine which image to display
  let displayImage = currentImage;
  if (showEndStudy) {
    displayImage = endStudyImage;
  } else if (showEndBreak) {
    displayImage = END_BREAK_IMAGE;
  } else if (showHalfBreak) {
    displayImage = halfBreakImage;
  } else if (showAlmostDone) {
    displayImage = ALMOST_DONE_IMAGE;
  }

  return (
    <div className="flex flex-col items-center w-full space-y-4">
      {/* Encouraging Message */}
      {showAlmostDone && (
        <div className="bg-pastel-yellow border-2 border-doodle-black rounded-2xl px-4 py-2 shadow-doodle">
          <p className="text-center text-lg font-bold text-doodle-black">
            You're almost done, keep going!
          </p>
        </div>
      )}
      
      {/* Cat Image Container */}
      <div className={`relative z-10 transition-all duration-500 ${isActive ? 'scale-105' : 'scale-100'}`}>
        <img 
          src={displayImage} 
          alt={showAlmostDone ? "Almost Done!" : isWork ? "Studying Cat" : "Resting Cat"}
          className="w-48 h-48 sm:w-64 sm:h-64 object-cover transition-opacity duration-300"
        />
      </div>
    </div>
  );
};

export default CatMascot;