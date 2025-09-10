"use client";

import { ICreateOpportunityBody } from "@/services/ambassador-dao/interfaces/sponsor";
import {
  MDXEditor,
  MDXEditorMethods,
  headingsPlugin,
  BoldItalicUnderlineToggles,
  toolbarPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  BlockTypeSelect,
  CreateLink,
  CodeToggle,
  linkPlugin,
  jsxPlugin,
  ListsToggle,
} from "@mdxeditor/editor";
import { FC } from "react";
import { UseFormSetValue } from "react-hook-form";

interface EditorProps {
  markdown: string;
  editorRef?: React.MutableRefObject<MDXEditorMethods | null>;
  setValue: UseFormSetValue<ICreateOpportunityBody>;
}

const MarkdownEditor: FC<EditorProps> = ({ markdown, editorRef, setValue }) => {
  return (
    <MDXEditor
      autoFocus={false}
      onChange={(e) => setValue("description", e)}
      className='custom-markdown-editor'
      ref={editorRef}
      markdown={markdown}
      placeholder='Describe your project in detail. What does it do? Who is it for?'
      plugins={[
        jsxPlugin(),
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        toolbarPlugin({
          toolbarClassName: "my-classname",
          toolbarContents: () => (
            <>
              <BoldItalicUnderlineToggles options={["Bold", "Italic"]} />
              <BlockTypeSelect />
              <ListsToggle />
              <CodeToggle />
            </>
          ),
        }),
      ]}
    />
  );
};

export default MarkdownEditor;
