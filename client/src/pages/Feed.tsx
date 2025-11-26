
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Heart, Plus, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

interface Post {
  id: string;
  content: string;
  mood: 'calm' | 'sage' | 'lavender' | 'rose' | 'amber';
  likes: number;
  isAnonymous: boolean;
  createdAt: string | Date;
  userId: string;
}

const Feed = () => {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [selectedMood, setSelectedMood] = useState<Post['mood']>('calm');
  const [showComposer, setShowComposer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/feed', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching feed posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const moods = [
    { id: 'calm', name: 'Calm', color: 'calm', gradient: 'from-calm-500 to-calm-600', cardClass: 'calm-card', badgeClass: 'bg-calm-500/20 text-calm-300 border-calm-500/30' },
    { id: 'sage', name: 'Hopeful', color: 'sage', gradient: 'from-sage-500 to-sage-600', cardClass: 'sage-card', badgeClass: 'bg-sage-500/20 text-sage-300 border-sage-500/30' },
    { id: 'lavender', name: 'Reflective', color: 'lavender', gradient: 'from-lavender-500 to-lavender-600', cardClass: 'lavender-card', badgeClass: 'bg-lavender-500/20 text-lavender-300 border-lavender-500/30' },
    { id: 'rose', name: 'Grateful', color: 'rose', gradient: 'from-rose-500 to-rose-600', cardClass: 'rose-card', badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    { id: 'amber', name: 'Energetic', color: 'amber', gradient: 'from-amber-500 to-amber-600', cardClass: 'amber-card', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30' }
  ];

  const toggleLike = (postId: string) => {
    const isLiked = likedPosts.has(postId);
    const newLikedPosts = new Set(likedPosts);
    
    if (isLiked) {
      newLikedPosts.delete(postId);
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, likes: Math.max(0, post.likes - 1) } : post
      ));
    } else {
      newLikedPosts.add(postId);
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      ));
    }
    
    setLikedPosts(newLikedPosts);
  };

  const deletePost = async (postId: string) => {
    if (!isAuthenticated || !user) return;
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/feed/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const createPost = async () => {
    if (!newPost.trim() || !isAuthenticated) return;

    try {
      setIsSaving(true);
      const response = await fetch('/api/feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: newPost.trim(),
          mood: selectedMood,
          isAnonymous: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPosts([data.post, ...posts]);
        setNewPost('');
        setShowComposer(false);
      } else {
        console.error('Error creating post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getTimeAgo = (date: string | Date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diff = now.getTime() - postDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const formatDateTime = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-black text-white page-content p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-light tracking-tight">
              <span className="text-gradient-sage">Community Feed</span>
            </h1>
            <p className="text-gray-400 text-sm mt-2">Anonymous support & sharing</p>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            {isAuthenticated && (
              <Button
                onClick={() => setShowComposer(!showComposer)}
                className="immersive-button primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            )}
          </div>
        </div>

        {/* Post Composer */}
        {showComposer && (
          <Card className="apple-card p-6 mb-8">
            <div className="space-y-4">
              <Textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share your thoughts, feelings, or encouragement with the community..."
                className="bg-transparent border-white/20 text-white placeholder-gray-400 resize-none min-h-32"
              />
              
              {/* Mood Selection */}
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Mood:</label>
                <div className="flex flex-wrap gap-2">
                  {moods.map((mood) => (
                    <Button
                      key={mood.id}
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedMood(mood.id as Post['mood'])}
                      className={`text-xs ${
                        selectedMood === mood.id 
                          ? `bg-gradient-to-r ${mood.gradient} !text-white border-transparent` 
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
                  onClick={() => setShowComposer(false)}
                  className="immersive-button secondary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createPost}
                  disabled={!newPost.trim() || isSaving}
                  className="immersive-button primary"
                >
                  {isSaving ? 'Sharing...' : 'Share'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Posts Feed */}
        {isLoading ? (
          <div className="text-center text-gray-400 py-12">Loading feed...</div>
        ) : posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => {
              const moodConfig = moods.find(m => m.id === post.mood);
              const isLiked = likedPosts.has(post.id);
              return (
                <Card key={post.id} className={`${moodConfig?.cardClass || 'apple-card'} p-6`}>
                  <div className="space-y-4">
                    {/* Post Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${moodConfig?.gradient} rounded-full flex items-center justify-center`}>
                          <Heart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">
                            {post.isAnonymous ? 'Anonymous Soul' : 'Community Member'}
                          </h3>
                          <p className="text-xs text-gray-400">
                            {getTimeAgo(post.createdAt)} • {formatDateTime(post.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-3 py-1 rounded-full border ${moodConfig?.badgeClass || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
                          {moodConfig?.name}
                        </span>
                        {user && post.userId === user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePost(post.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            title="Delete post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Post Content */}
                    <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                    {/* Post Actions */}
                    <div className="flex items-center space-x-6 pt-2 border-t border-white/10">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center space-x-2 ${
                          isLiked ? 'text-red-400 hover:text-red-300' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                        <span className="text-sm">{post.likes}</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12">
            <p className="text-lg mb-2">No posts yet</p>
            <p className="text-sm">Be the first to share something with the community!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
