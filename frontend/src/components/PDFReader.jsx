import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Progress } from './ui/progress';
import { Upload, Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const PDFReader = () => {
  const { toast } = useToast();
  const [pdfText, setPdfText] = useState('');
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [speed, setSpeed] = useState([200]); // WPM
  const [isDragOver, setIsDragOver] = useState(false);
  const intervalRef = useRef(null);
  const speechRef = useRef(null);

  // Mock PDF text for demonstration
  const mockPdfText = `Speed reading is a collection of reading methods which attempt to increase rates of reading without substantially reducing comprehension or retention. Such methods include ways of increasing reading speed without reducing comprehension, and ways of reducing comprehension in order to increase reading speed. Speed reading methods include chunking and eliminating subvocalization. The many speed reading training courses available may utilize books, videos, software, and seminars. Speed reading enables the reader to read at a rate of 300-400 words per minute or faster, while still maintaining good comprehension. Some techniques like skimming and scanning can help readers get through material more quickly while focusing on key information. Practice and patience are essential for developing speed reading skills effectively.`;

  useEffect(() => {
    if (pdfText) {
      const wordArray = pdfText.split(/\s+/).filter(word => word.length > 0);
      setWords(wordArray);
      setCurrentWordIndex(0);
    }
  }, [pdfText]);

  useEffect(() => {
    if (isPlaying && words.length > 0) {
      const interval = 60000 / speed[0]; // Convert WPM to milliseconds
      intervalRef.current = setInterval(() => {
        setCurrentWordIndex(prev => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const nextIndex = prev + 1;
          
          // Speak the word if speech is enabled
          if (isSpeechEnabled && 'speechSynthesis' in window) {
            if (speechRef.current) {
              speechSynthesis.cancel();
            }
            const utterance = new SpeechSynthesisUtterance(words[nextIndex]);
            utterance.rate = Math.min(speed[0] / 200, 2); // Adjust speech rate
            utterance.pitch = 1;
            utterance.volume = 0.8;
            speechRef.current = utterance;
            speechSynthesis.speak(utterance);
          }
          
          return nextIndex;
        });
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (speechRef.current) {
        speechSynthesis.cancel();
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, speed, words, isSpeechEnabled]);

  const handleFileUpload = (file) => {
    if (file && file.type === 'application/pdf') {
      // For now, use mock data
      setPdfText(mockPdfText);
      toast({
        title: "PDF Loaded Successfully",
        description: "Using mock PDF content for demonstration.",
      });
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleSpeech = () => {
    setIsSpeechEnabled(!isSpeechEnabled);
    if (!isSpeechEnabled && speechRef.current) {
      speechSynthesis.cancel();
    }
  };

  const resetReading = () => {
    setIsPlaying(false);
    setCurrentWordIndex(0);
    if (speechRef.current) {
      speechSynthesis.cancel();
    }
  };

  const loadMockPDF = () => {
    setPdfText(mockPdfText);
    toast({
      title: "Mock PDF Loaded",
      description: "Ready to start speed reading!",
    });
  };

  const progress = words.length > 0 ? ((currentWordIndex + 1) / words.length) * 100 : 0;

  if (!pdfText) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-center text-2xl">
                PDF Speed Reader
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 bg-gray-700/50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-white text-lg mb-2">
                  Drop your PDF here or click to browse
                </p>
                <p className="text-gray-400 text-sm">
                  Only text-based PDF files are supported
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  id="pdf-upload"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                />
                <label
                  htmlFor="pdf-upload"
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  Browse Files
                </label>
              </div>
              
              <div className="text-center">
                <p className="text-gray-400 mb-2">Or try with mock content:</p>
                <Button
                  onClick={loadMockPDF}
                  variant="outline"
                  className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                >
                  Load Sample PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Controls */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={togglePlayPause}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                
                <Button
                  onClick={toggleSpeech}
                  variant="outline"
                  size="lg"
                  className={`border-gray-600 ${
                    isSpeechEnabled
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {isSpeechEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </Button>
                
                <Button
                  onClick={resetReading}
                  variant="outline"
                  size="lg"
                  className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex items-center gap-4 min-w-[200px]">
                <span className="text-white text-sm whitespace-nowrap">Speed: {speed[0]} WPM</span>
                <Slider
                  value={speed}
                  onValueChange={setSpeed}
                  max={800}
                  min={100}
                  step={25}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Progress</span>
                <span>{currentWordIndex + 1} / {words.length} words</span>
              </div>
              <Progress value={progress} className="bg-gray-700" />
            </div>
          </CardContent>
        </Card>

        {/* Reading Display */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12">
            <div className="text-center">
              <div className="min-h-[200px] flex items-center justify-center">
                {words.length > 0 ? (
                  <div className="space-y-4">
                    <div 
                      className="text-6xl font-bold text-white tracking-wide"
                      style={{ 
                        textShadow: '0 0 10px rgba(255,255,255,0.3)',
                        animation: isPlaying ? 'pulse 0.3s ease-in-out' : 'none'
                      }}
                    >
                      {words[currentWordIndex]}
                    </div>
                    <div className="text-gray-400 text-lg">
                      Word {currentWordIndex + 1} of {words.length}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-xl">
                    No text loaded
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <div className="text-center">
          <div className="text-gray-400 text-sm">
            {isPlaying ? (
              <span className="text-green-400">● Reading...</span>
            ) : (
              <span>⏸ Paused</span>
            )}
            {isSpeechEnabled && (
              <span className="ml-4 text-blue-400">🔊 Audio enabled</span>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default PDFReader;