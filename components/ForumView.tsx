import React, { useState } from 'react';
import { ForumPost, Language } from '../types';
import { Button } from './Button';
import { t } from '../utils/translations';

interface ForumViewProps {
  posts: ForumPost[];
  onAddPost: (post: Omit<ForumPost, 'id' | 'comments' | 'likes' | 'timestamp'>) => void;
  lang: Language;
}

const CATEGORIES = ['Vocabulary Help', 'Article Discussion', 'Learning Strategies', 'General'];

export const ForumView: React.FC<ForumViewProps> = ({ posts, onAddPost, lang }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState(CATEGORIES[3]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    
    onAddPost({
      title: newTitle,
      content: newContent,
      author: 'You', // In a real app, this comes from auth
      category: newCategory as any,
    });
    
    setNewTitle('');
    setNewContent('');
    setIsCreating(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{t('forum', lang)}</h1>
        <Button onClick={() => setIsCreating(!isCreating)} variant="secondary" className="px-4 py-2 text-sm">
          {isCreating ? 'Cancel' : t('newPost', lang)}
        </Button>
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 mb-8 animate-[slideDown_0.3s_ease-out]">
            <div className="space-y-4">
                <input 
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-200 outline-none"
                    placeholder="Title"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                />
                <textarea 
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-200 outline-none h-32"
                    placeholder="What's on your mind?"
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                />
                <div className="flex gap-4">
                    <select 
                        className="p-3 border border-slate-200 rounded-xl bg-white"
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                    >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <Button type="submit" className="flex-1">{t('submit', lang)}</Button>
                </div>
            </div>
        </form>
      )}

      <div className="space-y-4">
        {posts.length === 0 && (
            <div className="text-center py-10 text-slate-400">No posts yet. Be the first!</div>
        )}
        {posts.map(post => (
          <div key={post.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <span className="bg-brand-50 text-brand-700 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                    {post.category}
                </span>
                <span className="text-slate-400 text-xs">{new Date(post.timestamp).toLocaleDateString()}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{post.title}</h3>
            <p className="text-slate-600 mb-4 line-clamp-3">{post.content}</p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-50 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                        {post.author[0]}
                    </div>
                    {post.author}
                </div>
                <div className="flex gap-4">
                    <span className="flex items-center gap-1">
                        ❤️ {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                        💬 {post.comments.length}
                    </span>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
