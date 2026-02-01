'use client';
import { useState } from "react";
import './pack.css'; // Import the CSS file

export default function PackOpening() {
  const [isPackOpened, setIsPackOpened] = useState(false);
  const [sliderProgress, setSliderProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rotation, setRotation] = useState({ rotateX: 0, rotateY: 0 });
  const [cardRotation, setCardRotation] = useState({ rotateX: 0, rotateY: 0 });

  const [visibleCards, setVisibleCards] = useState([
    { id: 1, content: "Card 1" },
    { id: 2, content: "Card 2" },
    { id: 3, content: "Card 3" },
    { id: 4, content: "Card 4" },
    { id: 5, content: "Card 5" },
  ]); // Mock cards
  const [swipeDirection, setSwipeDirection] = useState("");

  const handleNextCard = () => {
    if (visibleCards.length > 0) {
      setSwipeDirection("up"); // Swipe up animation
      setTimeout(() => {
        setVisibleCards((prevCards) => prevCards.slice(1)); // Remove the top card
        setSwipeDirection(""); // Reset swipe direction
      }, 500); // Match the animation duration
    }
  };

  const handleMouseMove = (e, setRotationFn) => {
    const element = e.currentTarget.getBoundingClientRect();
    const centerX = element.left + element.width / 2;
    const centerY = element.top + element.height / 2;
    const rotateX = (e.clientY - centerY) / 5; // Adjust sensitivity
    const rotateY = (e.clientX - centerX) / 5;
    setRotationFn({ rotateX, rotateY });
  };

  const handleMouseLeave = (setRotationFn) => {
    setRotationFn({ rotateX: 0, rotateY: 0 }); // Reset rotation when the cursor leaves
  };

  const handleSliderClick = () => {
    if (isAnimating) return; // Prevent multiple animations
    setIsAnimating(true);

    const interval = setInterval(() => {
      setSliderProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsPackOpened(true);
          setIsAnimating(false);
          return 100;
        }
        return prev + 5; // Increment progress
      });
    }, 30); // Adjust speed of animation
  };

  return (
    <div className="flex flex-col items-center gap-16 px-24 pt-24 min-h-screen bg-gray-100">
      {!isPackOpened ? (
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-2xl font-bold">Open Your Pack</h1>
          <div
            className="pack-container"
            onMouseMove={(e) => handleMouseMove(e, setRotation)}
            onMouseLeave={() => handleMouseLeave(setRotation)}
            style={{
              transform: `rotateX(${rotation.rotateX}deg) rotateY(${rotation.rotateY}deg)`,
            }}
          >
            <div className="slider-container">
              <div
                className="slider-progress"
                style={{
                  width: `${sliderProgress}%`,
                  opacity: `${100 - sliderProgress}%`,
                }}
              ></div>
              <div
                className="slider-button"
                onClick={handleSliderClick} // Trigger animation on click
                style={{
                  left: `${sliderProgress}%`, // Move the button along the slider
                }}
              >
                <span className="slider-text">Click To Open</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-2xl font-bold">Your Cards</h1>
          <div className="card-container">
            {visibleCards.map((card, index) => (
              <div
                key={card.id}
                className={`card ${index === 0 ? swipeDirection : ""}`}
                onMouseMove={(e) => handleMouseMove(e, setCardRotation)}
                onMouseLeave={() => handleMouseLeave(setCardRotation)}
                style={{
                  transform: `rotateX(${cardRotation.rotateX}deg) rotateY(${cardRotation.rotateY}deg)`,
                  zIndex: visibleCards.length - index,
                  top: `${index * 10}px`, // Stack cards with vertical offset
                }}
              >
                <p>{card.content}</p>
              </div>
            ))}
          </div>
          {visibleCards.length > 0 && (
            <button className="swipe-button" onClick={handleNextCard}>
              Next Card
            </button>
          )}
        </div>
      )}
    </div>
  );
}