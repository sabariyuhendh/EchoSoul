
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Mic, Square, Play, Pause, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Recording {
  id: string;
  name: string;
  duration: number;
  date: Date;
  blob: Blob;
}

const Whisper = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const newRecording: Recording = {
          id: Date.now().toString(),
          name: `Whisper ${new Date().toLocaleTimeString()}`,
          duration: recordingTime,
          date: new Date(),
          blob
        };
        setRecordings([newRecording, ...recordings]);
        setRecordingTime(0);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playRecording = (recording: Recording) => {
    if (playingId === recording.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      const url = URL.createObjectURL(recording.blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setPlayingId(recording.id);
        
        audioRef.current.onended = () => {
          setPlayingId(null);
          URL.revokeObjectURL(url);
        };
      }
    }
  };

  const deleteRecording = (id: string) => {
    setRecordings(recordings.filter(r => r.id !== id));
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Hidden Audio Element */}
        <audio ref={audioRef} className="hidden" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-light tracking-tight">
              <span className="text-gradient-lavender">WhisperBox</span>
            </h1>
            <p className="text-gray-400 text-sm">Your private voice diary</p>
          </div>
          <div className="w-24"></div>
        </div>

        {/* Recording Interface */}
        <Card className="lavender-card p-8 mb-8">
          <div className="text-center space-y-6">
            {isRecording ? (
              <>
                <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Mic className="w-16 h-16 text-white" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-light text-gradient-white">Recording...</h2>
                  <p className="text-3xl font-mono text-red-400">{formatTime(recordingTime)}</p>
                </div>
                <Button
                  onClick={stopRecording}
                  className="apple-button bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3"
                >
                  <Square className="w-5 h-5 mr-2" />
                  Stop Recording
                </Button>
              </>
            ) : (
              <>
                <div className="w-32 h-32 bg-gradient-to-br from-lavender-500 to-lavender-600 rounded-full flex items-center justify-center mx-auto hover:scale-105 transition-transform cursor-pointer"
                     onClick={startRecording}>
                  <Mic className="w-16 h-16 text-white" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-light text-gradient-white">Ready to Record</h2>
                  <p className="text-gray-400">Tap the microphone to start your voice diary</p>
                </div>
                <Button
                  onClick={startRecording}
                  className="apple-button bg-gradient-to-r from-lavender-500 to-lavender-600 text-white px-8 py-3"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Start Recording
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* Recordings List */}
        {recordings.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-light text-gradient-lavender">Your Whispers</h2>
            {recordings.map((recording) => (
              <Card key={recording.id} className="apple-card p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => playRecording(recording)}
                      className="w-12 h-12 rounded-full bg-lavender-500/20 hover:bg-lavender-500/30 text-lavender-400"
                    >
                      {playingId === recording.id ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </Button>
                    <div>
                      <h3 className="font-medium text-white">{recording.name}</h3>
                      <p className="text-sm text-gray-400">
                        {formatTime(recording.duration)} • {recording.date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRecording(recording.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Whisper;
