
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Mic, Square, Play, Pause, Trash2, Loader2 } from 'lucide-react';
import { Link } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Whisper } from '@shared/schema';

interface Recording {
  id: string;
  name: string;
  duration: number;
  date: Date;
  blob: Blob;
}

const Whisper = () => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [localRecordings, setLocalRecordings] = useState<Recording[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch saved whispers from database
  const { data: whispersData, isLoading } = useQuery({
    queryKey: ['/api/whisper'],
    queryFn: () => apiRequest('/api/whisper')
  });

  const whispers: Whisper[] = whispersData?.whispers || [];

  // Delete whisper mutation
  const deleteWhisperMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/whisper/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whisper'] });
      toast({
        title: "Recording deleted",
        description: "Your whisper has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete recording.",
        variant: "destructive",
      });
    },
  });

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support microphone access. Please use a modern browser like Chrome, Firefox, or Safari.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const newRecording: Recording = {
          id: Date.now().toString(),
          name: `Whisper ${new Date().toLocaleTimeString()}`,
          duration: recordingTime,
          date: new Date(),
          blob
        };
        
        // Add to local state immediately for immediate playback
        setLocalRecordings([newRecording, ...localRecordings]);
        setRecordingTime(0);
        
        // Save to database
        await saveRecordingToDatabase(newRecording);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      let errorMessage = 'Could not access microphone. ';
      
      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
            errorMessage += 'Please allow microphone access in your browser settings.';
            break;
          case 'NotFoundError':
            errorMessage += 'No microphone found. Please connect a microphone.';
            break;
          case 'NotSupportedError':
            errorMessage += 'Audio recording not supported by your browser.';
            break;
          default:
            errorMessage += 'Please check your microphone settings.';
        }
      }
      
      alert(errorMessage);
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

  // Save recording to database
  const saveRecordingToDatabase = async (recording: Recording) => {
    setIsSaving(true);
    try {
      // For now, save without audio file URL since we need Cloudinary setup
      // The recording will be available locally until page refresh
      await apiRequest('/api/whisper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: recording.name,
          duration: recording.duration,
          audioUrl: null // TODO: Implement Cloudinary upload
        })
      });

      // Refresh the whispers list
      queryClient.invalidateQueries({ queryKey: ['/api/whisper'] });
      
      toast({
        title: "Recording saved",
        description: "Your whisper has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving recording:', error);
      toast({
        title: "Save failed",
        description: "Could not save recording to database, but it's available locally this session.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const playRecording = (recording: Recording | Whisper) => {
    if (playingId === recording.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else if ('blob' in recording) {
      // Local recording with blob
      const url = URL.createObjectURL(recording.blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch((error) => {
          console.warn('Audio playback failed:', error);
          setPlayingId(null);
          URL.revokeObjectURL(url);
        });
        setPlayingId(recording.id);
        
        audioRef.current.onended = () => {
          setPlayingId(null);
          URL.revokeObjectURL(url);
        };
        
        audioRef.current.onerror = () => {
          setPlayingId(null);
          URL.revokeObjectURL(url);
        };
      }
    } else if ('audioUrl' in recording && recording.audioUrl) {
      // Database recording with URL
      if (audioRef.current) {
        audioRef.current.src = recording.audioUrl;
        audioRef.current.play().catch((error) => {
          console.warn('Audio playback failed:', error);
          setPlayingId(null);
        });
        setPlayingId(recording.id);
        
        audioRef.current.onended = () => setPlayingId(null);
        audioRef.current.onerror = () => setPlayingId(null);
      }
    } else {
      toast({
        title: "Playback unavailable",
        description: "Audio file not available for this recording.",
        variant: "destructive",
      });
    }
  };

  const deleteRecording = (id: string) => {
    // Check if it's a local recording
    const localRecording = localRecordings.find(r => r.id === id);
    if (localRecording) {
      setLocalRecordings(localRecordings.filter(r => r.id !== id));
      if (playingId === id) {
        audioRef.current?.pause();
        setPlayingId(null);
      }
    } else {
      // It's a database recording
      deleteWhisperMutation.mutate(id);
      if (playingId === id) {
        audioRef.current?.pause();
        setPlayingId(null);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black text-white page-content p-6">
      <div className="max-w-4xl mx-auto">
        {/* Hidden Audio Element */}
        <audio 
          ref={audioRef} 
          className="hidden"
          onError={(e) => {
            console.warn('Audio playback error:', e);
            setPlayingId(null);
          }}
          onEnded={() => setPlayingId(null)}
        />
        
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
                  className="immersive-button danger px-8 py-3"
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
                  className="immersive-button primary px-8 py-3"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Start Recording
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* Status indicator */}
        {isSaving && (
          <Card className="glass p-4 mb-4 border-blue-500/20">
            <div className="flex items-center space-x-3 text-blue-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving your whisper...</span>
            </div>
          </Card>
        )}

        {/* Recordings List */}
        {(localRecordings.length > 0 || whispers.length > 0) && (
          <div className="space-y-4">
            <h2 className="text-xl font-light text-gradient-lavender">Your Whispers</h2>
            
            {/* Local recordings first (current session) */}
            {localRecordings.map((recording) => (
              <Card key={`local-${recording.id}`} className="apple-card p-6">
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
                        {formatTime(recording.duration)} • {recording.date.toLocaleDateString()} • Local
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

            {/* Database recordings */}
            {whispers.map((recording) => (
              <Card key={`db-${recording.id}`} className="apple-card p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => playRecording(recording)}
                      className="w-12 h-12 rounded-full bg-lavender-500/20 hover:bg-lavender-500/30 text-lavender-400"
                      disabled={!recording.audioUrl}
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
                        {formatTime(recording.duration)} • {new Date(recording.createdAt).toLocaleDateString()}
                        {!recording.audioUrl && ' • Audio unavailable'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRecording(recording.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    disabled={deleteWhisperMutation.isPending}
                  >
                    {deleteWhisperMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
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
