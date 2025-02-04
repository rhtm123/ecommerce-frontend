<script>
	import { createEventDispatcher, onMount, onDestroy, writable } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Bold from '@tiptap/extension-bold';
	import Italic from '@tiptap/extension-italic';
	import Underline from '@tiptap/extension-underline';
	import Blockquote from '@tiptap/extension-blockquote';
	import CodeBlock from '@tiptap/extension-code-block';

	export let content = '';
	const dispatch = createEventDispatcher();
	let element;
	let editor;
	const editorState = writable(null); // Make editor reactive

	onMount(() => {
		editor = new Editor({
			element: element,
			extensions: [
				StarterKit,
				Bold,
				Italic,
				Underline,
				Blockquote,
				CodeBlock
			],
			content: content,
			onUpdate: ({ editor }) => {
				dispatch('change', editor.getHTML());
			},
		});

		// Store editor instance
		editorState.set(editor);
	});

	onDestroy(() => {
		if (editor) editor.destroy();
	});
</script>


{#if $editorState}
	<div class="toolbar flex gap-2 p-2 bg-gray-100 rounded-t-lg">
		<button on:click={() => $editorState.chain().focus().toggleBold().run()} class:active={$editorState.isActive('bold')}>
			<strong>B</strong>
		</button>
		<button on:click={() => $editorState.chain().focus().toggleItalic().run()} class:active={$editorState.isActive('italic')}>
			<em>I</em>
		</button>
		<button on:click={() => $editorState.chain().focus().toggleUnderline().run()} class:active={$editorState.isActive('underline')}>
			<u>U</u>
		</button>
		<button on:click={() => $editorState.chain().focus().toggleHeading({ level: 1 }).run()} class:active={$editorState.isActive('heading', { level: 1 })}>
			H1
		</button>
		<button on:click={() => $editorState.chain().focus().toggleHeading({ level: 2 }).run()} class:active={$editorState.isActive('heading', { level: 2 })}>
			H2
		</button>
		<button on:click={() => $editorState.chain().focus().setParagraph().run()} class:active={$editorState.isActive('paragraph')}>
			P
		</button>
		<button on:click={() => $editorState.chain().focus().toggleBulletList().run()} class:active={$editorState.isActive('bulletList')}>
			&#8226; List
		</button>
		<button on:click={() => $editorState.chain().focus().toggleBlockquote().run()} class:active={$editorState.isActive('blockquote')}>
			❝ Quote
		</button>
		<button on:click={() => $editorState.chain().focus().toggleCodeBlock().run()} class:active={$editorState.isActive('codeBlock')}>
			&lt;/&gt; Code
		</button>
	</div>
{/if}


<style>
	.toolbar button {
		border: none;
		padding: 4px 8px;
		background: white;
		cursor: pointer;
		border-radius: 4px;
		font-size: 14px;
		transition: 0.2s;
	}

	.toolbar button:hover {
		background: #ddd;
	}

	.toolbar button.active {
		background: black;
		color: white;
	}
</style>