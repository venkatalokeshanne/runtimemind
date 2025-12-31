'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { uploadImage } from '@/modules/articles/services';
import { Button } from '@/ui/button';

export default function TiptapEditor({ value = '', onChange, authorId }) {
  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: value || '',
    // Avoid SSR hydration mismatch in Next.js by preventing immediate render
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange && onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value === '') return;
    // Keep editor content in sync when `value` prop changes externally
    const html = editor.getHTML();
    if (value !== html) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  async function handleImageUpload(file) {
    if (!file) return;
    const { url, error } = await uploadImage(file, authorId || 'anonymous');
    if (error) {
      console.error('Image upload failed:', error);
      return;
    }
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }

  return (
    <div className="prose max-w-none">
      <div className="mb-3 flex items-center gap-2">
        <Button variant="outline" onClick={() => editor && editor.chain().focus().toggleBold().run()}>Bold</Button>
        <Button variant="outline" onClick={() => editor && editor.chain().focus().toggleItalic().run()}>Italic</Button>
        <Button variant="outline" onClick={() => editor && editor.chain().focus().toggleCodeBlock().run()}>Code</Button>
        <label className="inline-flex">
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files && e.target.files[0])} />
          <Button variant="outline">Insert image</Button>
        </label>
      </div>

      <div className="bg-surface border border-border rounded p-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
