import React, { useState, useEffect } from 'react';
import { TimerMode } from '../types';

const STUDY_IMAGES = ['/Doodle/S1.jpeg', '/Doodle/S2.jpeg', '/Doodle/S3.jpg'];
const REST_IMAGES = ['/Doodle/R1.jpeg', '/Doodle/R2.jpeg', '/Doodle/R3.jpeg', '/Doodle/R4.jpg'];
const ALMOST_DONE_IMAGE = '/Doodle/Almost done.jpeg';

interface CatMascotProps {
  mode: TimerMode;
  isActive: boolean;
  timeLeft: number;
  totalTime: number;
}

const CatMascot: React.FC<CatMascotProps> = ({ mode, isActive, timeLeft, totalTime }) => {
  const [currentImage, setCurrentImage] = useState<string>('');

  const isWork = mode === TimerMode.WORK;
  const progress = 1 - (timeLeft / totalTime);
  const showAlmostDone = isWork && progress >= 0.75;

  useEffect(() => {
    // Pick a random image when mode changes
    if (isWork) {
      const randomIndex = Math.floor(Math.random() * STUDY_IMAGES.length);
      setCurrentImage(STUDY_IMAGES[randomIndex]);
    } else {
      // For rest modes, pick a different image than the current one
      const availableImages = REST_IMAGES.filter(img => img !== currentImage);
      const randomIndex = Math.floor(Math.random() * availableImages.length);
      setCurrentImage(availableImages[randomIndex] || REST_IMAGES[0]);
    }
  }, [mode]);

  const displayImage = showAlmostDone ? ALMOST_DONE_IMAGE : currentImage;

  return (
    <div className="flex flex-col items-center w-full">
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