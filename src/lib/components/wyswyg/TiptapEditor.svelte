<script>
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Bold from '@tiptap/extension-bold';
	import Italic from '@tiptap/extension-italic';
	import Underline from '@tiptap/extension-underline';
	import Blockquote from '@tiptap/extension-blockquote';
	import CodeBlock from '@tiptap/extension-code-block';

	export let content = ''; // Bind this with parent
	const dispatch = createEventDispatcher();
	let element;
	let editor;

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
				// Emit updated content to parent
				dispatch('change', editor.getHTML());
			},
		});
	});

	onDestroy(() => {
		if (editor) editor.destroy();
	});
</script>

<!-- Toolbar -->




<div class="rounded-lg border">

{#if editor}
	<div class="toolbar flex gap-2 p-2 bg-gray-100 rounded-t-lg">
		<button on:click={() => editor.chain().focus().toggleBold().run()} class:active={editor.isActive('bold')}>
			<strong>B</strong>
		</button>
		<button on:click={() => editor.chain().focus().toggleItalic().run()} class:active={editor.isActive('italic')}>
			<em>I</em>
		</button>
		<button on:click={() => editor.chain().focus().toggleUnderline().run()} class:active={editor.isActive('underline')}>
			<u>U</u>
		</button>
		<button on:click={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} class:active={editor.isActive('heading', { level: 1 })}>
			H1
		</button>
		<button on:click={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} class:active={editor.isActive('heading', { level: 2 })}>
			H2
		</button>
		<button on:click={() => editor.chain().focus().setParagraph().run()} class:active={editor.isActive('paragraph')}>
			P
		</button>
		<button on:click={() => editor.chain().focus().toggleBulletList().run()} class:active={editor.isActive('bulletList')}>
			&#8226; List
		</button>
		<button on:click={() => editor.chain().focus().toggleBlockquote().run()} class:active={editor.isActive('blockquote')}>
			❝ Quote
		</button>
		<button on:click={() => editor.chain().focus().toggleCodeBlock().run()} class:active={editor.isActive('codeBlock')}>
			&lt;/&gt; Code
		</button>
	</div>
{/if}

<!-- Editor -->



<div class="w-full prose max-w-none m-auto p-0 ">
	<div class="min-h-24 p-2 bg-white rounded-lg" bind:this={element} />
</div>

</div>

<!-- Styles -->
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
