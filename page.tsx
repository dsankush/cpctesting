'use client'

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  Bold, Italic, List, Link, Video, Type, 
  AlignLeft, AlignCenter, AlignRight, Eye, Save, Send, 
  Moon, Sun, Smile, FileImage, Quote, Heading1, Heading2,
  Image as ImageIcon
} from 'lucide-react';

export default function BlogCreator() {
  // Content states
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [tags, setTags] = useState('');
  const [slug, setSlug] = useState('');
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  
  // Styling options
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Inter');
  const [textColor, setTextColor] = useState('#1f2937');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // UI states
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mediaLibrary, setMediaLibrary] = useState<Array<{ type: string; url: string; name: string }>>([]);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Auto-generate slug from title
  useEffect(() => {
    const generatedSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setSlug(generatedSlug);
  }, [title]);

  // Calculate statistics
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;
  const readingTime = Math.ceil(wordCount / 200);

  // Text formatting functions
  const formatText = (format: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = '';
    switch(format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'h1':
        formattedText = `# ${selectedText}`;
        break;
      case 'h2':
        formattedText = `## ${selectedText}`;
        break;
      case 'list':
        formattedText = `\n- ${selectedText}`;
        break;
      case 'quote':
        formattedText = `\n> ${selectedText}`;
        break;
      case 'link':
        formattedText = `[${selectedText}](url)`;
        break;
      default:
        formattedText = selectedText;
    }
    
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
  };

  // Insert emoji
  const insertEmoji = (emoji: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const newContent = content.substring(0, start) + emoji + content.substring(start);
    setContent(newContent);
    setShowEmojiPicker(false);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result;
        if (typeof imageUrl === 'string') {
          setMediaLibrary([...mediaLibrary, { type: 'image', url: imageUrl, name: file.name }]);
          setContent(content + `\n![${file.name}](${imageUrl})\n`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle thumbnail upload
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          setThumbnail(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle video embed
  const handleVideoEmbed = () => {
    const url = prompt('Enter YouTube or video URL:');
    if (url) {
      setContent(content + `\n[video](${url})\n`);
    }
  };

  // Save draft
  const saveDraft = () => {
    const draft = {
      title,
      subtitle,
      content,
      metaTitle,
      metaDescription,
      tags: tags.split(',').map(t => t.trim()),
      slug,
      thumbnail,
      styling: { fontSize, fontFamily, textColor, bgColor, alignment },
      timestamp: new Date().toISOString()
    };
    console.log('Draft saved:', draft);
    alert('Draft saved! Check console for data.');
  };

  // Publish
  const publish = () => {
    const article = {
      title,
      subtitle,
      content,
      metaTitle,
      metaDescription,
      tags: tags.split(',').map(t => t.trim()),
      slug,
      thumbnail,
      styling: { fontSize, fontFamily, textColor, bgColor, alignment },
      wordCount,
      readingTime,
      publishedAt: new Date().toISOString()
    };
    console.log('Published article:', article);
    alert('Article published! Check console for data.');
  };

  // Render markdown preview
  const renderPreview = () => {
    const html = content
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^# (.+)$/gm, '<h1 class="text-4xl font-bold mt-8 mb-4">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-3xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/^- (.+)$/gm, '<li class="ml-6">$1</li>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-blue-500 pl-4 italic my-4">$1</blockquote>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 underline">$1</a>')
      .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-4" />')
      .replace(/\n/g, '<br />');
    
    return html;
  };

  // Common emojis
  const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💡', '📝', '🚀', '💻', '🎨', '📸', '🌟', '⭐'];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border-b shadow-sm sticky top-0 z-10 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Type className="text-white" size={20} />
            </div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>BlogCraft</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-700'} hover:scale-105 transition-transform`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={saveDraft}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Save size={18} />
              Save Draft
            </button>
            <button
              onClick={publish}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all hover:shadow-lg"
            >
              <Send size={18} />
              Publish
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6 transition-colors duration-300`}>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Editor</h2>
            
            {/* Title & Subtitle */}
            <input
              type="text"
              placeholder="Enter your title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full text-3xl font-bold mb-3 p-3 border-0 outline-none ${isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-50 text-gray-900'} rounded-lg`}
            />
            <input
              type="text"
              placeholder="Enter subtitle (optional)..."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className={`w-full text-lg mb-4 p-3 border-0 outline-none ${isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-50 text-gray-900'} rounded-lg`}
            />

            {/* Thumbnail Upload */}
            <div className="mb-4">
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Blog Thumbnail
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <label
                  htmlFor="thumbnail-upload"
                  className={`flex items-center gap-2 px-4 py-2 ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} rounded-lg cursor-pointer hover:scale-105 transition-transform`}
                >
                  <FileImage size={18} />
                  Upload Thumbnail
                </label>
                {thumbnail && (
                  <Image src={thumbnail} alt="Blog thumbnail preview" width={48} height={48} className="object-cover rounded-lg" />
                )}
              </div>
            </div>

            {/* Formatting Toolbar */}
            <div className={`flex flex-wrap items-center gap-2 p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg mb-4`}>
              <button onClick={() => formatText('bold')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors" title="Bold">
                <Bold size={18} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} />
              </button>
              <button onClick={() => formatText('italic')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors" title="Italic">
                <Italic size={18} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} />
              </button>
              <button onClick={() => formatText('h1')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors" title="Heading 1">
                <Heading1 size={18} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} />
              </button>
              <button onClick={() => formatText('h2')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors" title="Heading 2">
                <Heading2 size={18} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} />
              </button>
              <button onClick={() => formatText('list')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors" title="Bullet List">
                <List size={18} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} />
              </button>
              <button onClick={() => formatText('quote')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors" title="Quote">
                <Quote size={18} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} />
              </button>
              <button onClick={() => formatText('link')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors" title="Insert Link">
                <Link size={18} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} />
              </button>
              
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              
              <label className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded cursor-pointer transition-colors" title="Insert Image">
                <ImageIcon size={18} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              <button onClick={handleVideoEmbed} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors" title="Embed Video">
                <Video size={18} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} />
              </button>
              
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              
              <button onClick={() => setAlignment('left')} className={`p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors ${alignment === 'left' ? 'bg-blue-100' : ''}`} title="Align Left">
                <AlignLeft size={18} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} />
              </button>
              <button onClick={() => setAlignment('center')} className={`p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors ${alignment === 'center' ? 'bg-blue-100' : ''}`} title="Align Center">
                <AlignCenter size={18} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} />
              </button>
              <button onClick={() => setAlignment('right')} className={`p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors ${alignment === 'right' ? 'bg-blue-100' : ''}`} title="Align Right">
                <AlignRight size={18} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} />
              </button>
              
              <div className="relative">
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors" title="Insert Emoji">
                  <Smile size={18} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} />
                </button>
                {showEmojiPicker && (
                  <div className={`absolute top-12 left-0 ${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-xl p-2 flex flex-wrap gap-1 w-64 z-20`}>
                    {emojis.map((emoji, idx) => (
                      <button
                        key={idx}
                        onClick={() => insertEmoji(emoji)}
                        className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-600 p-2 rounded transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Styling Controls */}
            <div className={`grid grid-cols-2 gap-3 p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg mb-4`}>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Font Size</label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{fontSize}px</span>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Font Family</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className={`w-full p-1 rounded ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-white'} text-sm`}
                >
                  <option value="Inter">Inter</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Courier New">Courier</option>
                  <option value="Arial">Arial</option>
                </select>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Text Color</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-8 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Background</label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full h-8 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Text Editor */}
            <textarea
              ref={editorRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your blog post..."
              className={`w-full h-96 p-4 border-0 outline-none resize-none ${isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-50 text-gray-900'} rounded-lg`}
              style={{
                fontSize: `${fontSize}px`,
                fontFamily: fontFamily,
                color: textColor,
                textAlign: alignment
              }}
            />

            {/* Statistics */}
            <div className={`flex items-center gap-4 mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{charCount} characters</span>
              <span>•</span>
              <span>{readingTime} min read</span>
            </div>
          </div>

          {/* Preview Panel */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6 transition-colors duration-300`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Live Preview</h2>
              <Eye className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} size={20} />
            </div>

            <div
              ref={previewRef}
              className="prose max-w-none h-[600px] overflow-y-auto p-6 rounded-lg transition-colors duration-300"
              style={{
                backgroundColor: bgColor,
                color: textColor,
                fontFamily: fontFamily,
                fontSize: `${fontSize}px`,
                textAlign: alignment
              }}
            >
              {thumbnail && (
                <Image src={thumbnail} alt="Blog thumbnail" width={800} height={400} className="w-full h-64 object-cover rounded-lg mb-6" />
              )}
              {title && <h1 className="text-4xl font-bold mb-2">{title}</h1>}
              {subtitle && <h2 className="text-xl text-gray-600 mb-6">{subtitle}</h2>}
              <div dangerouslySetInnerHTML={{ __html: renderPreview() }} />
            </div>
          </div>
        </div>

        {/* SEO Meta Section */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6 mt-6 transition-colors duration-300`}>
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>SEO & Metadata</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Meta Title</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Enter SEO title..."
                className={`w-full p-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 border-gray-200'} border outline-none`}
              />
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated-slug"
                className={`w-full p-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 border-gray-200'} border outline-none`}
              />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Meta Description</label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Enter a brief description for search engines..."
                className={`w-full p-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 border-gray-200'} border outline-none h-24 resize-none`}
              />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tags (comma-separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="technology, programming, tutorial"
                className={`w-full p-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 border-gray-200'} border outline-none`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
