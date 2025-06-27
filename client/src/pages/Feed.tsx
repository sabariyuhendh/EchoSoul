
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Heart, MessageCircle, Share, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Post {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
  mood: 'calm' | 'sage' | 'lavender' | 'rose' | 'amber';
}

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      content: "Just wanted to share that it's okay to have bad days. I've been struggling with anxiety lately, but I'm learning to be gentle with myself. Remember, healing isn't linear. 💙",
      author: "Anonymous Soul",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 24,
      comments: 8,
      isLiked: false,
      mood: 'calm'
    },
    {
      id: '2',
      content: "Today I tried the breathing exercise from therapy and it actually helped! Small wins count too. If you're reading this and struggling, you're not alone. 🌱",
      author: "Growing Heart",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      likes: 36,
      comments: 12,
      isLiked: true,
      mood: 'sage'
    },
    {
      id: '3',
      content: "Sometimes I feel like I'm drowning in my own thoughts. Writing here helps me feel less alone. Thank you to this community for being a safe space. 💜",
      author: "Wandering Mind",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      likes: 18,
      comments: 6,
      isLiked: false,
      mood: 'lavender'
    }
  ]);
  
  const [newPost, setNewPost] = useState('');
  const [selectedMood, setSelectedMood] = useState<Post['mood']>('calm');
  const [showComposer, setShowComposer] = useState(false);

  const moods = [
    { id: 'calm', name: 'Calm', color: 'calm', gradient: 'from-calm-500 to-calm-600' },
    { id: 'sage', name: 'Hopeful', color: 'sage', gradient: 'from-sage-500 to-sage-600' },
    { id: 'lavender', name: 'Reflective', color: 'lavender', gradient: 'from-lavender-500 to-lavender-600' },
    { id: 'rose', name: 'Grateful', color: 'rose', gradient: 'from-rose-500 to-rose-600' },
    { id: 'amber', name: 'Energetic', color: 'amber', gradient: 'from-amber-500 to-amber-600' }
  ];

  const toggleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const createPost = () => {
    if (!newPost.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      content: newPost.trim(),
      author: "You",
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      isLiked: false,
      mood: selectedMood
    };

    setPosts([post, ...posts]);
    setNewPost('');
    setShowComposer(false);
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-black/80 backdrop-blur-xl border-b border-white/10 p-6 z-10">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-light tracking-tight">
                <span className="text-gradient-wellness">Community Feed</span>
              </h1>
              <p className="text-gray-400 text-sm">Anonymous support & sharing</p>
            </div>
            <Button
              onClick={() => setShowComposer(!showComposer)}
              className="apple-button bg-gradient-to-r from-calm-500 to-sage-500 text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Post Composer */}
        {showComposer && (
          <Card className="m-6 apple-card p-6">
            <div className="space-y-4">
              <Textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share your thoughts, feelings, or encouragement with the community..."
                className="bg-transparent border-white/20 text-white placeholder-gray-400 resize-none min-h-24"
              />
              
              {/* Mood Selection */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Mood:</label>
                <div className="flex flex-wrap gap-2">
                  {moods.map((mood) => (
                    <Button
                      key={mood.id}
                      variant={selectedMood === mood.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedMood(mood.id as Post['mood'])}
                      className={`text-xs ${
                        selectedMood === mood.id 
                          ? `bg-gradient-to-r ${mood.gradient} text-white` 
                          : 'border-white/20 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {mood.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowComposer(false)}
                  className="border-white/20 text-gray-300 hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createPost}
                  disabled={!newPost.trim()}
                  className="apple-button bg-gradient-to-r from-sage-500 to-calm-500 text-white"
                >
                  Share
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Posts Feed */}
        <div className="p-6 space-y-6">
          {posts.map((post) => {
            const moodConfig = moods.find(m => m.id === post.mood);
            return (
              <Card key={post.id} className={`${moodConfig?.color}-card p-6`}>
                <div className="space-y-4">
                  {/* Post Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${moodConfig?.gradient} rounded-full flex items-center justify-center`}>
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{post.author}</h3>
                        <p className="text-xs text-gray-400">{getTimeAgo(post.timestamp)}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full bg-${moodConfig?.color}-500/20 text-${moodConfig?.color}-300`}>
                      {moodConfig?.name}
                    </span>
                  </div>

                  {/* Post Content */}
                  <p className="text-gray-200 leading-relaxed">{post.content}</p>

                  {/* Post Actions */}
                  <div className="flex items-center space-x-6 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center space-x-2 ${
                        post.isLiked ? 'text-red-400 hover:text-red-300' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                      <span className="text-sm">{post.likes}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2 text-gray-400 hover:text-white"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{post.comments}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2 text-gray-400 hover:text-white"
                    >
                      <Share className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Feed;
