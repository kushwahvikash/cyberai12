import React, { useState, useEffect } from 'react';
import { X, Palette, MessageSquare, Lightbulb, ArrowRight } from 'lucide-react';

interface FeaturePopupProps {
  onClose: () => void;
}

const FeaturePopup: React.FC<FeaturePopupProps> = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    {
      icon: MessageSquare,
      title: "Switch AI Modes",
      description: "Toggle between CyberSecurity Expert mode for technical guidance and Normal Chat mode for general conversations.",
      gradient: "from-purple-500 to-pink-600",
      tip: "Look for the 'AI Mode' section in the sidebar to switch modes anytime!"
    },
    {
      icon: Palette,
      title: "Theme Options",
      description: "Choose between Dark and Light themes to match your preference and working environment.",
      gradient: "from-blue-500 to-cyan-600",
      tip: "Find the theme toggle at the bottom of the sidebar - perfect for day and night usage!"
    },
    {
      icon: Lightbulb,
      title: "Pro Tips",
      description: "Use voice input, upload files, export chats, and personalize your profile for the best experience.",
      gradient: "from-green-500 to-emerald-600",
      tip: "Explore all the buttons in the chat interface - there's more than meets the eye!"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length);
  };

  const handlePrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
  };

  const currentFeature = features[currentSlide];
  const Icon = currentFeature.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className={`mx-auto w-16 h-16 bg-gradient-to-br ${currentFeature.gradient} rounded-xl flex items-center justify-center mb-4`}>
              <Icon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {currentFeature.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {currentFeature.description}
            </p>
          </div>

          {/* Tip Box */}
          <div className={`bg-gradient-to-br ${currentFeature.gradient} bg-opacity-10 border border-opacity-20 rounded-lg p-4 mb-6`}>
            <div className="flex items-start space-x-2">
              <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Tip:</strong> {currentFeature.tip}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevious}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowRight className="h-4 w-4 text-gray-600 dark:text-gray-400 rotate-180" />
            </button>

            {/* Dots Indicator */}
            <div className="flex space-x-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide 
                      ? 'bg-blue-500' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className={`w-full py-3 px-4 bg-gradient-to-r ${currentFeature.gradient} text-white rounded-lg hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5`}
          >
            Got it, thanks!
          </button>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700">
          <div 
            className={`h-full bg-gradient-to-r ${currentFeature.gradient} transition-all duration-4000 ease-linear`}
            style={{ width: `${((currentSlide + 1) / features.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default FeaturePopup;